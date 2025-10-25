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

// Obtener todas las cuentas bancarias
app.get('/api/cuentas', async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().query(`
            SELECT * FROM CuentasBancarias 
            WHERE activa = 1 
            ORDER BY fecha_creacion DESC
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

// Crear nueva cuenta bancaria
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
        const result = await pool.request().query(`
            INSERT INTO CuentasBancarias 
            (nombre, numero, banco, moneda, tipo_cuenta, titular, saldo_inicial, saldo_actual) 
            OUTPUT INSERTED.*
            VALUES (
                '${nombre}', '${numero}', '${banco}', '${monedaValue}', 
                '${tipoCuentaValue}', '${titular}', 
                ${saldoActual}, ${saldoActual}
            )
        `);
        res.status(201).json({
            mensaje: 'Cuenta registrada correctamente',
            cuenta: result.recordset[0]
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

// Endpoint para crear depósitos
app.post('/api/depositos', async (req, res) => {
    const { cuenta_id, monto, concepto, depositante, tipo } = req.body;
    
    try {
        // Validaciones
        if (!cuenta_id || !monto || !concepto) {
            return res.status(400).json({ 
                error: 'Faltan campos requeridos',
                required: ['cuenta_id', 'monto', 'concepto']
            });
        }

        if (parseFloat(monto) <= 0) {
            return res.status(400).json({ 
                error: 'El monto debe ser mayor a 0'
            });
        }

        const pool = await connectDB();
        
        // Verificar que la cuenta existe
        const cuentaResult = await pool.request()
            .input('cuenta_id', sql.Int, cuenta_id)
            .query('SELECT id, nombre, saldo_actual FROM CuentasBancarias WHERE id = @cuenta_id AND activa = 1');
        
        if (cuentaResult.recordset.length === 0) {
            return res.status(404).json({ 
                error: 'Cuenta bancaria no encontrada o inactiva'
            });
        }

        const cuenta = cuentaResult.recordset[0];

        // Crear la transacción de depósito
        const insertResult = await pool.request()
            .input('cuenta_id', sql.Int, cuenta_id)
            .input('tipo', sql.VarChar(50), 'DEPOSITO')
            .input('monto', sql.Decimal(18, 2), parseFloat(monto))
            .input('fecha_transaccion', sql.DateTime, new Date())
            .input('beneficiario', sql.VarChar(200), depositante || 'Depósito directo')
            .input('concepto', sql.VarChar(500), concepto)
            .input('estado', sql.VarChar(50), 'COMPLETADO')
            .input('tipo_deposito', sql.VarChar(50), tipo || 'efectivo')
            .input('referencia', sql.VarChar(100), `DEP-${Date.now()}`)
            .query(`
                INSERT INTO Transacciones 
                (cuenta_id, tipo, monto, fecha_transaccion, beneficiario, concepto, estado, tipo_deposito, referencia)
                OUTPUT INSERTED.id
                VALUES 
                (@cuenta_id, @tipo, @monto, @fecha_transaccion, @beneficiario, @concepto, @estado, @tipo_deposito, @referencia)
            `);

        const transaccionId = insertResult.recordset[0].id;
        
        // Actualizar el saldo de la cuenta
        const nuevoSaldo = cuenta.saldo_actual + parseFloat(monto);
        await pool.request()
            .input('cuenta_id', sql.Int, cuenta_id)
            .input('nuevo_saldo', sql.Decimal(18, 2), nuevoSaldo)
            .query('UPDATE CuentasBancarias SET saldo_actual = @nuevo_saldo WHERE id = @cuenta_id');

        res.json({
            success: true,
            message: 'Depósito registrado correctamente',
            data: {
                transaccion_id: transaccionId,
                cuenta: cuenta.nombre,
                monto: parseFloat(monto),
                saldo_anterior: cuenta.saldo_actual,
                saldo_nuevo: nuevoSaldo,
                fecha: new Date().toISOString()
            }
        });

    } catch (err) {
        console.error('Error al crear depósito:', err);
        res.status(500).json({ 
            error: 'Error al registrar el depósito',
            details: err.message 
        });
    }
});

// Importar y usar el endpoint de cheques

// Endpoints de cheques y chequeras
const chequesApi = require('./cheques-api');
const modulesApi = require('./modules-api');

app.use('/api', chequesApi);
app.use('/api', modulesApi);

const PORT = 3001;
app.listen(PORT, () => {
    console.log('🚀 Servidor backend ejecutándose en http://localhost:' + PORT);
    console.log('📊 Para configurar tablas visita: http://localhost:' + PORT + '/api/setup-tables');
});