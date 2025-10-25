const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Configuración de SQL Server
const dbConfig = {
    user: 'marcus',
    password: 'UMG2025@',
    server: 'localhost',
    database: 'ControlCheques',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

// Bancos de Guatemala
const bancosGT = [
    'BANRURAL', 'BANCO INDUSTRIAL', 'BANCO G&T CONTINENTAL', 
    'BANCO AGROMERCANTIL (BAM)', 'BAC CREDOMATIC', 'BANCO PROMERICA', 
    'BANCO INTERNACIONAL', 'VIVIBANCO'
];

// Conectar a la base de datos
async function connectDB() {
    try {
        const pool = await sql.connect(dbConfig);
        return pool;
    } catch (err) {
        console.error('Error de conexión a la base de datos:', err);
        throw err;
    }
}

// Configurar tablas mejoradas
app.get('/api/setup-tables', async (req, res) => {
    try {
        const pool = await connectDB();
        
        // Crear tabla CuentasBancarias mejorada
        await pool.request().query(`
            IF OBJECT_ID('CuentasBancarias', 'U') IS NULL
            CREATE TABLE CuentasBancarias (
                id INT IDENTITY(1,1) PRIMARY KEY,
                nombre NVARCHAR(100) NOT NULL,
                numero NVARCHAR(50) NOT NULL UNIQUE,
                banco NVARCHAR(100) NOT NULL,
                moneda NVARCHAR(10) NOT NULL DEFAULT 'GTQ',
                tipo_cuenta NVARCHAR(20) NOT NULL DEFAULT 'corriente',
                titular NVARCHAR(100) NOT NULL,
                saldo_inicial DECIMAL(15,2) DEFAULT 0,
                saldo_actual DECIMAL(15,2) DEFAULT 0,
                activa BIT DEFAULT 1,
                fecha_creacion DATETIME DEFAULT GETDATE(),
                fecha_actualizacion DATETIME DEFAULT GETDATE()
            )
        `);
        
        console.log('Tabla CuentasBancarias creada o ya existe');
        res.json({ mensaje: 'Tablas configuradas correctamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Generar número de cuenta único
function generarNumeroCuenta(banco) {
    const prefijos = {
        'BANRURAL': 'BR', 'BANCO INDUSTRIAL': 'BI', 'BANCO G&T CONTINENTAL': 'GT',
        'BANCO AGROMERCANTIL (BAM)': 'BAM', 'BAC CREDOMATIC': 'BAC', 
        'BANCO PROMERICA': 'PRO', 'BANCO INTERNACIONAL': 'INT', 'VIVIBANCO': 'VIV'
    };
    const prefijo = prefijos[banco] || 'GT';
    const numero = Math.floor(10000000 + Math.random() * 90000000);
    return prefijo + '-' + numero;
}

// Obtener todas las cuentas bancarias (ordenar por las que tienen chequeras primero)
app.get('/api/cuentas', async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().query(`
            SELECT c.*, 
                   CASE WHEN EXISTS(SELECT 1 FROM Chequeras ch WHERE ch.cuenta_id = c.id AND ch.activa = 1) 
                        THEN 1 ELSE 0 END as tiene_chequeras
            FROM CuentasBancarias c
            WHERE c.activa = 1 
            ORDER BY tiene_chequeras DESC, c.fecha_creacion ASC
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener cuenta específica
app.get('/api/cuentas/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await connectDB();
        const result = await pool.request().query(
            `SELECT * FROM CuentasBancarias WHERE id = ${id} AND activa = 1`
        );
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Cuenta no encontrada' });
        }
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Crear nueva cuenta bancaria con chequera automática
app.post('/api/cuentas', async (req, res) => {
    const { nombre, banco, moneda, tipo_cuenta, titular, saldo_inicial } = req.body;
    
    if (!nombre || !banco || !titular) {
        return res.status(400).json({ error: 'Nombre, banco y titular son obligatorios' });
    }
    
    const numero = generarNumeroCuenta(banco);
    const saldoActual = saldo_inicial || 0;
    const monedaValue = moneda || 'GTQ';
    const tipoCuentaValue = tipo_cuenta || 'corriente';
    
    try {
        const pool = await connectDB();
        
        // Validar que no exista una cuenta con el mismo número
        const existe = await pool.request().query(`SELECT id FROM CuentasBancarias WHERE numero = '${numero}'`);
        if (existe.recordset.length > 0) {
            return res.status(409).json({ error: 'Ya existe una cuenta con ese número.' });
        }
        
        // Crear la cuenta
        const cuentaResult = await pool.request().query(`
            INSERT INTO CuentasBancarias 
            (nombre, numero, banco, moneda, tipo_cuenta, titular, saldo_inicial, saldo_actual) 
            OUTPUT INSERTED.*
            VALUES (
                '${nombre}', '${numero}', '${banco}', '${monedaValue}', 
                '${tipoCuentaValue}', '${titular}', 
                ${saldoActual}, ${saldoActual}
            )
        `);
        
        const nuevaCuenta = cuentaResult.recordset[0];
        
        // Crear automáticamente una chequera para la nueva cuenta
        const chequeraResult = await pool.request().query(`
            INSERT INTO Chequeras 
            (cuenta_id, numero_inicial, numero_final, siguiente_numero, total_cheques, activa, fecha_creacion)
            OUTPUT INSERTED.*
            VALUES (
                ${nuevaCuenta.id}, 1001, 2000, 1001, 1000, 1, GETDATE()
            )
        `);
        
        res.status(201).json({
            mensaje: 'Cuenta y chequera creadas correctamente',
            cuenta: nuevaCuenta,
            chequera: chequeraResult.recordset[0]
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Actualizar cuenta bancaria
app.put('/api/cuentas/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, banco, moneda, tipo_cuenta, titular, saldo_actual } = req.body;
    
    try {
        const pool = await connectDB();
        await pool.request().query(`
            UPDATE CuentasBancarias 
            SET nombre = '${nombre}', banco = '${banco}', moneda = '${moneda}',
                tipo_cuenta = '${tipo_cuenta}', titular = '${titular}', 
                saldo_actual = ${saldo_actual}, fecha_actualizacion = GETDATE()
            WHERE id = ${id}
        `);
        
        res.json({ mensaje: 'Cuenta actualizada correctamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Crear chequera para cuenta existente
app.post('/api/cuentas/:id/chequera', async (req, res) => {
    const { id } = req.params;
    const { numero_inicial, numero_final, total_cheques } = req.body;
    
    try {
        const pool = await connectDB();
        
        // Verificar que la cuenta existe
        const cuentaResult = await pool.request().query(`
            SELECT * FROM CuentasBancarias WHERE id = ${id} AND activa = 1
        `);
        
        if (cuentaResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Cuenta no encontrada' });
        }
        
        // Verificar que no tenga chequera activa
        const chequeraExiste = await pool.request().query(`
            SELECT id FROM Chequeras WHERE cuenta_id = ${id} AND activa = 1
        `);
        
        if (chequeraExiste.recordset.length > 0) {
            return res.status(409).json({ error: 'La cuenta ya tiene una chequera activa' });
        }
        
        // Crear nueva chequera
        const numeroInicial = numero_inicial || 1001;
        const numeroFinal = numero_final || (numeroInicial + (total_cheques || 1000) - 1);
        const totalCheques = total_cheques || 1000;
        
        const chequeraResult = await pool.request().query(`
            INSERT INTO Chequeras 
            (cuenta_id, numero_inicial, numero_final, siguiente_numero, total_cheques, activa, fecha_creacion)
            OUTPUT INSERTED.*
            VALUES (
                ${id}, ${numeroInicial}, ${numeroFinal}, ${numeroInicial}, ${totalCheques}, 1, GETDATE()
            )
        `);
        
        res.status(201).json({
            mensaje: 'Chequera creada correctamente',
            chequera: chequeraResult.recordset[0]
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Crear chequeras automáticamente para cuentas existentes sin chequera
app.post('/api/crear-chequeras-faltantes', async (req, res) => {
    try {
        const pool = await connectDB();
        
        // Encontrar cuentas sin chequeras activas
        const cuentasSinChequera = await pool.request().query(`
            SELECT c.* 
            FROM CuentasBancarias c
            WHERE c.activa = 1 
            AND NOT EXISTS (
                SELECT 1 FROM Chequeras ch 
                WHERE ch.cuenta_id = c.id AND ch.activa = 1
            )
        `);
        
        let chequerasCreadas = 0;
        const resultados = [];
        
        for (const cuenta of cuentasSinChequera.recordset) {
            const chequeraResult = await pool.request().query(`
                INSERT INTO Chequeras 
                (cuenta_id, numero_inicial, numero_final, siguiente_numero, total_cheques, activa, fecha_creacion)
                OUTPUT INSERTED.*
                VALUES (
                    ${cuenta.id}, 1001, 2000, 1001, 1000, 1, GETDATE()
                )
            `);
            
            chequerasCreadas++;
            resultados.push({
                cuenta: cuenta.nombre,
                chequera: chequeraResult.recordset[0]
            });
        }
        
        res.json({
            mensaje: `Se crearon ${chequerasCreadas} chequeras automáticamente`,
            chequeras_creadas: chequerasCreadas,
            resultados: resultados
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Eliminar cuenta (desactivar)
app.delete('/api/cuentas/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const pool = await connectDB();
            // Desactivar la cuenta
            await pool.request().query(`
                UPDATE CuentasBancarias 
                SET activa = 0, fecha_actualizacion = GETDATE()
                WHERE id = ${id}
            `);

            // Eliminar cheques relacionados a chequeras de la cuenta
            await pool.request().query(`
                DELETE FROM Cheques WHERE cuenta_id = ${id}
            `);

            // Eliminar chequeras relacionadas a la cuenta
            await pool.request().query(`
                DELETE FROM Chequeras WHERE cuenta_id = ${id}
            `);

            res.json({ mensaje: 'Cuenta y datos relacionados eliminados correctamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener resumen de cuentas
app.get('/api/cuentas-resumen', async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().query(`
            SELECT 
                COUNT(*) as total_cuentas,
                COUNT(CASE WHEN activa = 1 THEN 1 END) as cuentas_activas,
                ISNULL(SUM(CASE WHEN moneda = 'GTQ' THEN saldo_actual ELSE 0 END), 0) as total_gtq,
                ISNULL(SUM(CASE WHEN moneda = 'USD' THEN saldo_actual ELSE 0 END), 0) as total_usd
            FROM CuentasBancarias
        `);
        
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login de usuarios
app.post('/api/login', async (req, res) => {
    const { correo, contrasena } = req.body;
    
    try {
        const pool = await connectDB();
        const result = await pool.request().query(`
            SELECT id, nombre, correo, rol 
            FROM Usuarios 
            WHERE correo = '${correo}' AND contrasena = '${contrasena}'
        `);
        
        if (result.recordset.length === 1) {
            res.json(result.recordset[0]);
        } else {
            res.status(401).json({ error: 'Credenciales incorrectas' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Importar y usar el endpoint de cheques

// Endpoints de cheques y chequeras
const chequesApi = require('./cheques-api');
chequesApi.dbConfig = dbConfig;
app.use('/api', chequesApi);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log('🚀 Servidor backend ejecutándose en http://localhost:' + PORT);
    console.log('📊 Para configurar tablas visita: http://localhost:' + PORT + '/api/setup-tables');
});