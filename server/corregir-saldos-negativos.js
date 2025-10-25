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

async function corregirSaldosNegativos() {
  try {
    console.log('💰 Iniciando corrección de saldos negativos...');
    const pool = await sql.connect(dbConfig);
    
    // 1. Obtener cuentas con saldo negativo
    const cuentasNegativasResult = await pool.request().query(`
      SELECT id, nombre, banco, saldo_inicial, saldo_actual 
      FROM CuentasBancarias 
      WHERE activa = 1 AND saldo_actual < 0
      ORDER BY saldo_actual ASC
    `);
    
    console.log(`🔴 Encontradas ${cuentasNegativasResult.recordset.length} cuentas con saldo negativo`);
    
    if (cuentasNegativasResult.recordset.length === 0) {
      console.log('✅ No hay cuentas con saldo negativo que corregir');
      return;
    }
    
    for (const cuenta of cuentasNegativasResult.recordset) {
      console.log(`\n💳 Corrigiendo cuenta: ${cuenta.nombre} (${cuenta.banco})`);
      console.log(`  📉 Saldo actual negativo: Q${cuenta.saldo_actual.toFixed(2)}`);
      
      // Calcular cuánto cheques están afectando el saldo
      const chequesResult = await pool.request().query(`
        SELECT 
          SUM(CASE WHEN estado IN ('emitido', 'cobrado') THEN monto ELSE 0 END) as total_descontado
        FROM Cheques 
        WHERE cuenta_id = ${cuenta.id}
      `);
      
      const totalDescontado = chequesResult.recordset[0].total_descontado || 0;
      
      // El saldo inicial debe ser suficiente para cubrir los cheques descontados
      // Agregar un margen de seguridad del 20%
      const saldoInicialNecesario = totalDescontado * 1.2;
      const nuevoSaldoInicial = Math.max(saldoInicialNecesario, 10000); // Mínimo Q10,000
      const nuevoSaldoActual = nuevoSaldoInicial - totalDescontado;
      
      console.log(`  📊 Total descontado en cheques: Q${totalDescontado.toFixed(2)}`);
      console.log(`  📈 Nuevo saldo inicial recomendado: Q${nuevoSaldoInicial.toFixed(2)}`);
      console.log(`  💰 Nuevo saldo actual resultante: Q${nuevoSaldoActual.toFixed(2)}`);
      
      // Actualizar los saldos
      await pool.request().query(`
        UPDATE CuentasBancarias 
        SET saldo_inicial = ${nuevoSaldoInicial},
            saldo_actual = ${nuevoSaldoActual}, 
            fecha_actualizacion = GETDATE()
        WHERE id = ${cuenta.id}
      `);
      
      console.log(`  ✅ Cuenta corregida exitosamente`);
    }
    
    console.log(`\n🎉 ¡Corrección de saldos negativos completada!`);
    
    // Verificar que no queden saldos negativos
    const verificacionResult = await pool.request().query(`
      SELECT COUNT(*) as cuentas_negativas
      FROM CuentasBancarias 
      WHERE activa = 1 AND saldo_actual < 0
    `);
    
    const cuentasNegativasRestantes = verificacionResult.recordset[0].cuentas_negativas;
    
    if (cuentasNegativasRestantes === 0) {
      console.log(`✅ ¡Perfecto! Ya no hay cuentas con saldo negativo`);
    } else {
      console.log(`⚠️  Aún quedan ${cuentasNegativasRestantes} cuentas con saldo negativo`);
    }
    
    // Mostrar resumen final actualizado
    const resumenFinalResult = await pool.request().query(`
      SELECT 
        COUNT(*) as total_cuentas,
        SUM(saldo_inicial) as suma_saldos_iniciales,
        SUM(saldo_actual) as suma_saldos_actuales,
        MIN(saldo_actual) as saldo_minimo,
        MAX(saldo_actual) as saldo_maximo,
        AVG(saldo_actual) as saldo_promedio
      FROM CuentasBancarias 
      WHERE activa = 1
    `);
    
    const resumen = resumenFinalResult.recordset[0];
    console.log(`\n📊 RESUMEN FINAL ACTUALIZADO:`);
    console.log(`Total de cuentas: ${resumen.total_cuentas}`);
    console.log(`Suma de saldos iniciales: Q${resumen.suma_saldos_iniciales.toFixed(2)}`);
    console.log(`Suma de saldos actuales: Q${resumen.suma_saldos_actuales.toFixed(2)}`);
    console.log(`Saldo mínimo: Q${resumen.saldo_minimo.toFixed(2)}`);
    console.log(`Saldo máximo: Q${resumen.saldo_maximo.toFixed(2)}`);
    console.log(`Saldo promedio: Q${resumen.saldo_promedio.toFixed(2)}`);
    
  } catch (error) {
    console.error('❌ Error al corregir saldos negativos:', error);
  } finally {
    await sql.close();
  }
}

// Ejecutar la corrección
corregirSaldosNegativos();