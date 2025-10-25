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

async function verificarEstructuraCuentas() {
    try {
        await sql.connect(config);
        
        console.log('📋 ESTRUCTURA TABLA CuentasBancarias:');
        const result = await sql.query(`
            SELECT COLUMN_NAME, DATA_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'CuentasBancarias'
            ORDER BY ORDINAL_POSITION
        `);
        
        result.recordset.forEach(col => {
            console.log(`   - ${col.COLUMN_NAME}: ${col.DATA_TYPE}`);
        });
        
        console.log('\n📊 MUESTRA DE DATOS:');
        const sampleData = await sql.query(`SELECT TOP 3 * FROM CuentasBancarias`);
        console.log('Primeras 3 cuentas:', sampleData.recordset);
        
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await sql.close();
    }
}

verificarEstructuraCuentas();