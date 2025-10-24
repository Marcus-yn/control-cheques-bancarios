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

async function verificarChequeras() {
  try {
    await sql.connect(dbConfig);
    
    console.log('🔍 VERIFICANDO ESTADO DE CHEQUERAS...\n');
    
    // Contar cuentas totales
    const totalCuentas = await sql.query(`
      SELECT COUNT(*) as total FROM CuentasBancarias WHERE activa = 1
    `);
    
    // Contar cuentas con chequeras
    const cuentasConChequeras = await sql.query(`
      SELECT COUNT(DISTINCT c.id) as total
      FROM CuentasBancarias c
      INNER JOIN Chequeras ch ON c.id = ch.cuenta_id
      WHERE c.activa = 1 AND ch.activa = 1
    `);
    
    // Contar chequeras totales
    const totalChequeras = await sql.query(`
      SELECT COUNT(*) as total FROM Chequeras WHERE activa = 1
    `);
    
    // Listar cuentas SIN chequeras
    const cuentasSinChequeras = await sql.query(`
      SELECT c.id, c.nombre, c.banco, c.numero
      FROM CuentasBancarias c
      WHERE c.activa = 1 
      AND NOT EXISTS (
        SELECT 1 FROM Chequeras ch 
        WHERE ch.cuenta_id = c.id AND ch.activa = 1
      )
      ORDER BY c.nombre
    `);
    
    // Listar cuentas CON chequeras
    const cuentasConChequerasDetalle = await sql.query(`
      SELECT c.id, c.nombre, c.banco, c.numero, 
             ch.numero_inicial, ch.numero_final, ch.siguiente_numero
      FROM CuentasBancarias c
      INNER JOIN Chequeras ch ON c.id = ch.cuenta_id
      WHERE c.activa = 1 AND ch.activa = 1
      ORDER BY c.nombre
    `);
    
    console.log('📊 RESUMEN GENERAL:');
    console.log(`Total de cuentas activas: ${totalCuentas.recordset[0].total}`);
    console.log(`Cuentas con chequeras: ${cuentasConChequeras.recordset[0].total}`);
    console.log(`Total de chequeras activas: ${totalChequeras.recordset[0].total}`);
    console.log(`Cuentas SIN chequeras: ${cuentasSinChequeras.recordset.length}`);
    
    if (cuentasSinChequeras.recordset.length > 0) {
      console.log('\n❌ CUENTAS SIN CHEQUERAS:');
      console.table(cuentasSinChequeras.recordset);
    } else {
      console.log('\n✅ ¡TODAS LAS CUENTAS TIENEN CHEQUERAS!');
    }
    
    console.log('\n📋 CUENTAS CON CHEQUERAS:');
    if (cuentasConChequerasDetalle.recordset.length > 0) {
      console.table(cuentasConChequerasDetalle.recordset.slice(0, 10)); // Mostrar primeras 10
      if (cuentasConChequerasDetalle.recordset.length > 10) {
        console.log(`... y ${cuentasConChequerasDetalle.recordset.length - 10} más`);
      }
    }
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

verificarChequeras();