const sql = require('mssql');

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

async function connectDB() {
    try {
        const pool = await sql.connect(dbConfig);
        return pool;
    } catch (err) {
        console.error('Error de conexión a la base de datos:', err);
        throw err;
    }
}

async function insertTestData() {
    try {
        const pool = await connectDB();
        console.log('🔄 Insertando datos de prueba...');

        // Insertar cuentas bancarias de prueba
        await pool.request().query(`
            IF NOT EXISTS (SELECT 1 FROM CuentasBancarias WHERE numero = 'BAM-12345678')
            INSERT INTO CuentasBancarias (nombre, numero, banco, moneda, tipo_cuenta, titular, saldo_inicial, saldo_actual, activa)
            VALUES 
            ('Cuenta Principal', 'BAM-12345678', 'BANCO AGROMERCANTIL', 'GTQ', 'corriente', 'Empresa Principal S.A.', 500000, 387500, 1),
            ('Cuenta Operativa', 'BI-87654321', 'BANCO INDUSTRIAL', 'GTQ', 'corriente', 'Empresa Principal S.A.', 200000, 125000, 1),
            ('Cuenta Dólares', 'BAM-USD-11111', 'BANCO AGROMERCANTIL', 'USD', 'ahorro', 'Empresa Principal S.A.', 50000, 45000, 1),
            ('Cuenta Nómina', 'GT-NOM-55555', 'BANCO G&T CONTINENTAL', 'GTQ', 'corriente', 'Empresa Principal S.A.', 300000, 275000, 1),
            ('Cuenta Inversión', 'PRO-INV-99999', 'BANCO PROMERICA', 'USD', 'ahorro', 'Empresa Principal S.A.', 75000, 68500, 1)
        `);

        // Verificar si ya existen chequeras
        const chequerasExist = await pool.request().query(`SELECT COUNT(*) as count FROM Chequeras`);
        
        if (chequerasExist.recordset[0].count === 0) {
            // Insertar chequeras de prueba
            await pool.request().query(`
                INSERT INTO Chequeras (cuenta_id, numero_inicial, numero_final, activa)
                VALUES 
                (1, 1000, 1050, 1),
                (2, 2000, 2050, 1),
                (3, 3000, 3050, 1),
                (4, 4000, 4050, 1),
                (5, 5000, 5050, 1)
            `);
        }

        // Insertar transacciones de prueba (cheques y depósitos)
        await pool.request().query(`
            IF NOT EXISTS (SELECT 1 FROM Cheques WHERE numero = '001245')
            INSERT INTO Cheques (cuenta_id, chequera_id, numero, fecha, beneficiario, monto, concepto, estado)
            VALUES 
            (1, 1, '001245', '2024-10-15', 'Proveedores Guatemala S.A.', 15000, 'Compra de materiales de oficina', 'pendiente'),
            (1, 1, '001246', '2024-10-16', 'Servicios Técnicos GT', 8500, 'Mantenimiento de equipos', 'cobrado'),
            (2, 2, '002001', '2024-10-17', 'Suministros de Oficina', 1200, 'Papelería y útiles', 'pendiente'),
            (1, 1, '001247', '2024-10-18', 'Transportes Unidos', 12000, 'Fletes y entregas', 'cobrado'),
            (3, 3, '003001', '2024-10-19', 'Consulting International', 2500, 'Consultoría especializada', 'pendiente')
        `);

        // Crear tabla de depósitos si no existe
        await pool.request().query(`
            IF OBJECT_ID('Depositos', 'U') IS NULL
            CREATE TABLE Depositos (
                id INT IDENTITY(1,1) PRIMARY KEY,
                cuenta_id INT NOT NULL,
                fecha DATETIME NOT NULL,
                monto DECIMAL(15,2) NOT NULL,
                tipo NVARCHAR(50) NOT NULL,
                concepto NVARCHAR(255),
                referencia NVARCHAR(100),
                fecha_creacion DATETIME DEFAULT GETDATE(),
                FOREIGN KEY (cuenta_id) REFERENCES CuentasBancarias(id)
            )
        `);

        // Insertar depósitos de prueba
        await pool.request().query(`
            IF NOT EXISTS (SELECT 1 FROM Depositos WHERE referencia = 'DEP001')
            INSERT INTO Depositos (cuenta_id, fecha, monto, tipo, concepto, referencia)
            VALUES 
            (1, '2024-10-20', 25000, 'efectivo', 'Ventas del día', 'DEP001'),
            (1, '2024-10-21', 18000, 'transferencia', 'Transferencia de cliente', 'TRF001'),
            (2, '2024-10-22', 12500, 'cheque', 'Depósito de cheque de tercero', 'CHQ001'),
            (3, '2024-10-23', 3500, 'abono', 'Intereses ganados', 'INT001'),
            (4, '2024-10-24', 45000, 'transferencia', 'Nómina recibida', 'NOM001')
        `);

        // Crear tabla de usuarios si no existe
        await pool.request().query(`
            IF OBJECT_ID('Usuarios', 'U') IS NULL
            CREATE TABLE Usuarios (
                id INT IDENTITY(1,1) PRIMARY KEY,
                nombre NVARCHAR(100) NOT NULL,
                correo NVARCHAR(100) NOT NULL UNIQUE,
                contrasena NVARCHAR(255) NOT NULL,
                rol NVARCHAR(20) NOT NULL DEFAULT 'user',
                activo BIT DEFAULT 1,
                fecha_creacion DATETIME DEFAULT GETDATE()
            )
        `);

        // Insertar usuarios de prueba
        await pool.request().query(`
            IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE correo = 'admin@empresa.com')
            INSERT INTO Usuarios (nombre, correo, contrasena, rol)
            VALUES 
            ('Administrador', 'admin@empresa.com', 'admin123', 'admin'),
            ('Usuario Test', 'usuario@empresa.com', 'user123', 'user')
        `);

        console.log('✅ Datos de prueba insertados correctamente');
        
    } catch (error) {
        console.error('❌ Error al insertar datos de prueba:', error);
    }
}

module.exports = {
    connectDB,
    dbConfig,
    insertTestData
};