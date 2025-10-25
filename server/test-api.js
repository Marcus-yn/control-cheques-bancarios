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

async function testAPI() {
  try {
    await sql.connect(dbConfig);
    
    console.log('=== PROBANDO ENDPOINTS DE LA API ===\n');
    
    // Probar endpoint de chequeras
    console.log('1. Probando /api/chequeras:');
    const chequerasResult = await sql.query(`
      SELECT ch.*, c.nombre as cuenta_nombre, c.banco, ISNULL(c.moneda, 'GTQ') as moneda
      FROM Chequeras ch
      JOIN CuentasBancarias c ON ch.cuenta_id = c.id
      WHERE ch.activa = 1
      ORDER BY ch.fecha_creacion DESC
    `);
    console.log('Chequeras encontradas:', chequerasResult.recordset.length);
    if (chequerasResult.recordset.length > 0) {
      console.table(chequerasResult.recordset);
    }
    
    // Probar endpoint de cuentas
    console.log('\n2. Probando CuentasBancarias:');
    const cuentasResult = await sql.query(`
      SELECT id, nombre, banco, numero, activa
      FROM CuentasBancarias 
      WHERE activa = 1
      ORDER BY id
    `);
    console.log('Cuentas activas:', cuentasResult.recordset.length);
    if (cuentasResult.recordset.length > 0) {
      console.table(cuentasResult.recordset.slice(0, 5)); // Mostrar solo las primeras 5
    }
    
    // Probar endpoint de cheques
    console.log('\n3. Probando /api/cheques:');
    const chequesResult = await sql.query(`
      SELECT chq.*, ch.numero_inicial, ch.numero_final, ch.siguiente_numero, 
             c.nombre as cuenta_nombre, c.banco, ISNULL(c.moneda, 'GTQ') as moneda
      FROM Cheques chq
      JOIN Chequeras ch ON chq.chequera_id = ch.id
      JOIN CuentasBancarias c ON chq.cuenta_id = c.id
      ORDER BY chq.fecha DESC
    `);
    console.log('Cheques encontrados:', chequesResult.recordset.length);
    if (chequesResult.recordset.length > 0) {
      console.table(chequesResult.recordset.slice(0, 5)); // Mostrar solo los primeros 5
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

testAPI();