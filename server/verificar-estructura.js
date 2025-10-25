const sql = require('mssql');

const config = {
    user: 'marcus',
    password: 'UMG2025@',
    server: 'localhost',
    database: 'ControlCheques',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

async function verificarEstructura() {
    try {
        await sql.connect(config);
        
        console.log('📋 ESTRUCTURA DE TABLA CHEQUERAS:');
        const result = await sql.query(`
            SELECT COLUMN_NAME, DATA_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'Chequeras'
        `);
        
        result.recordset.forEach(col => {
            console.log(`   - ${col.COLUMN_NAME}: ${col.DATA_TYPE}`);
        });
        
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await sql.close();
    }
}

verificarEstructura();