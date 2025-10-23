const sql = require('mssql');

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

async function probarConexion() {
    try {
        await sql.connect(dbConfig);
        console.log('Conexión exitosa a SQL Server');
        process.exit(0);
    } catch (err) {
        console.error('Error de conexión:', err.message);
        process.exit(1);
    }
}

probarConexion();
