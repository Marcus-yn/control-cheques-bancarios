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

async function recalcularSaldos() {
  try {
    console.log('🔄 Iniciando recálculo de saldos...');
    const pool = await sql.connect(dbConfig);
    
    // 1. Obtener todas las cuentas bancarias
    const cuentasResult = await pool.request().query(`
      SELECT id, nombre, banco, saldo_inicial 
      FROM CuentasBancarias 
      WHERE activa = 1
    `);
    
    console.log(`📊 Procesando ${cuentasResult.recordset.length} cuentas bancarias`);
    
    for (const cuenta of cuentasResult.recordset) {
      console.log(`\n💳 Procesando cuenta: ${cuenta.nombre} (${cuenta.banco})`);
      
      // 2. Calcular el total de cheques que afectan el saldo
      // Solo cheques en estado 'emitido' o 'cobrado' descuentan del saldo
      const chequesResult = await pool.request().query(`
        SELECT 
          SUM(CASE WHEN estado IN ('emitido', 'cobrado') THEN monto ELSE 0 END) as total_descontado,
          COUNT(*) as total_cheques,
          SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
          SUM(CASE WHEN estado = 'emitido' THEN 1 ELSE 0 END) as emitidos,
          SUM(CASE WHEN estado = 'cobrado' THEN 1 ELSE 0 END) as cobrados,
          SUM(CASE WHEN estado = 'cancelado' THEN 1 ELSE 0 END) as cancelados
        FROM Cheques 
        WHERE cuenta_id = ${cuenta.id}
      `);
      
      const estadisticas = chequesResult.recordset[0];
      const totalDescontado = estadisticas.total_descontado || 0;
      const saldoCorrectoActual = cuenta.saldo_inicial - totalDescontado;
      
      console.log(`  📈 Saldo inicial: Q${cuenta.saldo_inicial.toFixed(2)}`);
      console.log(`  📉 Total descontado: Q${totalDescontado.toFixed(2)}`);
      console.log(`  💰 Saldo correcto actual: Q${saldoCorrectoActual.toFixed(2)}`);
      console.log(`  📊 Estadísticas de cheques:`);
      console.log(`    ⏳ Pendientes: ${estadisticas.pendientes}`);
      console.log(`    📤 Emitidos: ${estadisticas.emitidos}`);
      console.log(`    ✅ Cobrados: ${estadisticas.cobrados}`);
      console.log(`    ❌ Cancelados: ${estadisticas.cancelados}`);
      
      // 3. Actualizar el saldo en la base de datos
      await pool.request().query(`
        UPDATE CuentasBancarias 
        SET saldo_actual = ${saldoCorrectoActual}, 
            fecha_actualizacion = GETDATE()
        WHERE id = ${cuenta.id}
      `);
      
      console.log(`  ✅ Saldo actualizado correctamente`);
    }
    
    console.log(`\n🎉 ¡Recálculo de saldos completado exitosamente!`);
    
    // 4. Mostrar resumen final
    const resumenResult = await pool.request().query(`
      SELECT 
        COUNT(*) as total_cuentas,
        SUM(saldo_inicial) as suma_saldos_iniciales,
        SUM(saldo_actual) as suma_saldos_actuales,
        MIN(saldo_actual) as saldo_minimo,
        MAX(saldo_actual) as saldo_maximo
      FROM CuentasBancarias 
      WHERE activa = 1
    `);
    
    const resumen = resumenResult.recordset[0];
    console.log(`\n📊 RESUMEN FINAL:`);
    console.log(`Total de cuentas procesadas: ${resumen.total_cuentas}`);
    console.log(`Suma de saldos iniciales: Q${resumen.suma_saldos_iniciales.toFixed(2)}`);
    console.log(`Suma de saldos actuales: Q${resumen.suma_saldos_actuales.toFixed(2)}`);
    console.log(`Saldo mínimo: Q${resumen.saldo_minimo.toFixed(2)}`);
    console.log(`Saldo máximo: Q${resumen.saldo_maximo.toFixed(2)}`);
    
    if (resumen.saldo_minimo < 0) {
      console.log(`⚠️  ADVERTENCIA: Hay cuentas con saldo negativo`);
    } else {
      console.log(`✅ Todas las cuentas tienen saldo no negativo`);
    }
    
  } catch (error) {
    console.error('❌ Error al recalcular saldos:', error);
  } finally {
    await sql.close();
  }
}

// Ejecutar el recálculo
recalcularSaldos();