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

async function checkTables() {
  try {
    await sql.connect(dbConfig);
    
    console.log('=== VERIFICANDO ESTRUCTURA DE TABLAS ===\n');
    
    // Verificar CuentasBancarias
    console.log('Columnas en CuentasBancarias:');
    const cuentasColumns = await sql.query`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'CuentasBancarias'
      ORDER BY ORDINAL_POSITION
    `;
    console.table(cuentasColumns.recordset);
    
    // Verificar Chequeras
    console.log('\nColumnas en Chequeras:');
    const chequerasColumns = await sql.query`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'Chequeras'
      ORDER BY ORDINAL_POSITION
    `;
    console.table(chequerasColumns.recordset);
    
    // Verificar Cheques
    console.log('\nColumnas en Cheques:');
    const chequesColumns = await sql.query`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'Cheques'
      ORDER BY ORDINAL_POSITION
    `;
    console.table(chequesColumns.recordset);
    
    // Verificar datos existentes
    const cuentasCount = await sql.query`SELECT COUNT(*) as count FROM CuentasBancarias`;
    const chequerasCount = await sql.query`SELECT COUNT(*) as count FROM Chequeras`;
    const chequesCount = await sql.query`SELECT COUNT(*) as count FROM Cheques`;
    
    console.log('\n=== CONTEO DE REGISTROS ===');
    console.log(`CuentasBancarias: ${cuentasCount.recordset[0].count} registros`);
    console.log(`Chequeras: ${chequerasCount.recordset[0].count} registros`);
    console.log(`Cheques: ${chequesCount.recordset[0].count} registros`);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkTables();