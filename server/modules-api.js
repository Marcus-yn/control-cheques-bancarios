const express = require('express');
const sql = require('mssql');
const router = express.Router();

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

// ENDPOINTS PARA TRANSACCIONES

// Obtener todas las transacciones
router.get('/transacciones', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT 
        t.id,
        t.cuenta_id,
        t.tipo,
        t.monto,
        t.descripcion,
        t.referencia as numero_cheque,
        t.fecha_transaccion as fecha_emision,
        t.estado,
        t.beneficiario,
        t.concepto,
        t.saldo_anterior,
        t.saldo_posterior,
        c.nombre as cuenta,
        c.banco,
        c.moneda
      FROM Transacciones t
      INNER JOIN CuentasBancarias c ON t.cuenta_id = c.id
      ORDER BY t.fecha_transaccion DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error en /api/transacciones:', err);
    res.status(500).json({ error: 'Error al obtener transacciones' });
  }
});

// Crear nueva transacción
router.post('/transacciones', async (req, res) => {
  try {
    const { cuenta_id, tipo, monto, descripcion, referencia, beneficiario, concepto } = req.body;
    const pool = await sql.connect(dbConfig);
    
    const result = await pool.request()
      .input('cuenta_id', sql.Int, cuenta_id)
      .input('tipo', sql.VarChar, tipo)
      .input('monto', sql.Decimal(15,2), monto)
      .input('descripcion', sql.VarChar, descripcion)
      .input('referencia', sql.VarChar, referencia)
      .input('beneficiario', sql.VarChar, beneficiario)
      .input('concepto', sql.VarChar, concepto)
      .query(`
        INSERT INTO Transacciones 
        (cuenta_id, tipo, monto, descripcion, referencia, fecha_transaccion, estado, beneficiario, concepto)
        OUTPUT INSERTED.*
        VALUES (@cuenta_id, @tipo, @monto, @descripcion, @referencia, GETDATE(), 'COMPLETADA', @beneficiario, @concepto)
      `);
    
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error('Error al crear transacción:', err);
    res.status(500).json({ error: 'Error al crear transacción' });
  }
});

// ENDPOINTS PARA DEPÓSITOS

// Obtener todos los depósitos
router.get('/depositos', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT 
        d.id,
        d.numero_deposito,
        d.monto,
        d.descripcion,
        d.depositante,
        d.tipo_deposito,
        d.fecha_deposito,
        d.estado,
        c.nombre as cuenta_nombre,
        c.numero as cuenta_numero,
        c.banco
      FROM Depositos d
      INNER JOIN CuentasBancarias c ON d.cuenta_id = c.id
      ORDER BY d.fecha_deposito DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error en /api/depositos:', err);
    res.status(500).json({ error: 'Error al obtener depósitos' });
  }
});

// Crear nuevo depósito
router.post('/depositos', async (req, res) => {
  try {
    const { cuenta_id, monto, concepto, depositante, tipo } = req.body;
    const pool = await sql.connect(dbConfig);
    
    // Verificar que la cuenta existe
    const cuentaResult = await pool.request()
      .input('cuenta_id', sql.Int, cuenta_id)
      .query('SELECT * FROM CuentasBancarias WHERE id = @cuenta_id');
    
    if (cuentaResult.recordset.length === 0) {
      return res.status(400).json({ error: 'Cuenta no encontrada' });
    }

    const cuenta = cuentaResult.recordset[0];
    
    // Generar número de depósito/transacción
    const numeroTransaccion = 'BOL-' + Date.now();
    
    // Insertar en la tabla Transacciones como depósito
    const result = await pool.request()
      .input('cuenta_id', sql.Int, cuenta_id)
      .input('tipo', sql.VarChar, 'DEPOSITO')
      .input('monto', sql.Decimal(15,2), parseFloat(monto))
      .input('descripcion', sql.Text, concepto || 'Depósito')
      .input('referencia', sql.VarChar, numeroTransaccion)
      .input('fecha_transaccion', sql.DateTime, new Date())
      .input('estado', sql.VarChar, 'COMPLETADO')
      .input('beneficiario', sql.VarChar, depositante || 'Depósito bancario')
      .input('concepto', sql.Text, concepto || 'Depósito')
      .input('saldo_anterior', sql.Decimal(15,2), cuenta.saldo_actual)
      .input('saldo_posterior', sql.Decimal(15,2), parseFloat(cuenta.saldo_actual) + parseFloat(monto))
      .input('usuario_creacion', sql.VarChar, 'SISTEMA')
      .query(`
        INSERT INTO Transacciones 
        (cuenta_id, tipo, monto, descripcion, referencia, fecha_transaccion, estado, beneficiario, concepto, 
         saldo_anterior, saldo_posterior, usuario_creacion, fecha_creacion)
        OUTPUT INSERTED.*
        VALUES (@cuenta_id, @tipo, @monto, @descripcion, @referencia, @fecha_transaccion, @estado, @beneficiario, 
                @concepto, @saldo_anterior, @saldo_posterior, @usuario_creacion, GETDATE())
      `);

    // Actualizar saldo de la cuenta (SUMAR porque es un depósito - ingreso)
    await pool.request()
      .input('cuenta_id', sql.Int, cuenta_id)
      .input('nuevo_saldo', sql.Decimal(15,2), parseFloat(cuenta.saldo_actual) + parseFloat(monto))
      .query('UPDATE CuentasBancarias SET saldo_actual = @nuevo_saldo WHERE id = @cuenta_id');
    
    res.status(201).json({ 
      success: true, 
      transaccion: result.recordset[0],
      mensaje: `Depósito de ${monto} ${cuenta.moneda} registrado exitosamente`
    });
  } catch (err) {
    console.error('Error al crear depósito:', err);
    res.status(500).json({ error: 'Error al crear depósito: ' + err.message });
  }
});

// ENDPOINTS PARA ESTADO DE CUENTA

// Obtener estado de cuenta por ID
router.get('/estado-cuenta/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await sql.connect(dbConfig);
    
    // Obtener información de la cuenta
    const cuentaResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM CuentasBancarias WHERE id = @id');
    
    if (cuentaResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }
    
    const cuenta = cuentaResult.recordset[0];
    
    // Obtener transacciones de la cuenta
    const transaccionesResult = await pool.request()
      .input('cuenta_id', sql.Int, id)
      .query(`
        SELECT * FROM Transacciones 
        WHERE cuenta_id = @cuenta_id 
        ORDER BY fecha_transaccion DESC
      `);
    
    // Calcular resumen
    const resumen = {
      cantidad_transacciones: transaccionesResult.recordset.length,
      total_ingresos: transaccionesResult.recordset
        .filter(t => ['DEPOSITO', 'INGRESO'].includes(t.tipo))
        .reduce((sum, t) => sum + parseFloat(t.monto), 0),
      total_egresos: transaccionesResult.recordset
        .filter(t => ['CHEQUE', 'RETIRO', 'TRANSFERENCIA'].includes(t.tipo))
        .reduce((sum, t) => sum + parseFloat(t.monto), 0)
    };
    
    res.json({
      cuenta,
      transacciones: transaccionesResult.recordset,
      resumen
    });
  } catch (err) {
    console.error('Error en estado de cuenta:', err);
    res.status(500).json({ error: 'Error al obtener estado de cuenta' });
  }
});

// ENDPOINTS PARA GRÁFICOS

// Obtener datos para gráficos
router.get('/graficos/resumen', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    
    // Datos por tipo de transacción
    const porTipo = await pool.request().query(`
      SELECT 
        tipo,
        COUNT(*) as cantidad,
        SUM(monto) as total_monto
      FROM Transacciones
      GROUP BY tipo
      ORDER BY total_monto DESC
    `);
    
    // Datos por mes
    const porMes = await pool.request().query(`
      SELECT 
        FORMAT(fecha_transaccion, 'yyyy-MM') as mes,
        COUNT(*) as cantidad,
        SUM(monto) as total_monto
      FROM Transacciones
      GROUP BY FORMAT(fecha_transaccion, 'yyyy-MM')
      ORDER BY mes DESC
    `);
    
    // Saldos por cuenta
    const saldosCuentas = await pool.request().query(`
      SELECT 
        nombre,
        banco,
        saldo_actual,
        moneda
      FROM CuentasBancarias
      WHERE activa = 1
      ORDER BY saldo_actual DESC
    `);
    
    res.json({
      por_tipo: porTipo.recordset,
      por_mes: porMes.recordset,
      saldos_cuentas: saldosCuentas.recordset
    });
  } catch (err) {
    console.error('Error en gráficos:', err);
    res.status(500).json({ error: 'Error al obtener datos de gráficos' });
  }
});

// ENDPOINT DE RESUMEN GENERAL

router.get('/resumen-general', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    
    const resumenResult = await pool.request().query(`
      SELECT 
        (SELECT COUNT(*) FROM CuentasBancarias WHERE activa = 1) as total_cuentas,
        (SELECT COUNT(*) FROM Transacciones) as total_transacciones,
        (SELECT COUNT(*) FROM Cheques) as total_cheques,
        (SELECT COUNT(*) FROM Depositos) as total_depositos,
        (SELECT ISNULL(SUM(saldo_actual), 0) FROM CuentasBancarias WHERE activa = 1) as saldo_total_sistema
    `);
    
    res.json(resumenResult.recordset[0]);
    
  } catch (err) {
    console.error('Error en /api/resumen-general:', err);
    res.status(500).json({ error: 'Error al obtener resumen general' });
  }
});

// ENDPOINTS PARA REPORTES

// Obtener datos mensuales para reportes
router.get('/reportes/mensuales', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT 
        MONTH(fecha_transaccion) as mes,
        YEAR(fecha_transaccion) as año,
        CASE MONTH(fecha_transaccion)
          WHEN 1 THEN 'Ene'
          WHEN 2 THEN 'Feb'
          WHEN 3 THEN 'Mar'
          WHEN 4 THEN 'Abr'
          WHEN 5 THEN 'May'
          WHEN 6 THEN 'Jun'
          WHEN 7 THEN 'Jul'
          WHEN 8 THEN 'Ago'
          WHEN 9 THEN 'Sep'
          WHEN 10 THEN 'Oct'
          WHEN 11 THEN 'Nov'
          WHEN 12 THEN 'Dic'
        END as month,
        COUNT(CASE WHEN tipo = 'CHEQUE' THEN 1 END) as cheques,
        COUNT(CASE WHEN tipo = 'DEPOSITO' THEN 1 END) as depositos,
        ISNULL(SUM(CASE WHEN tipo = 'CHEQUE' THEN monto ELSE 0 END), 0) as totalEgresos,
        ISNULL(SUM(CASE WHEN tipo = 'DEPOSITO' THEN monto ELSE 0 END), 0) as totalIngresos
      FROM Transacciones
      WHERE fecha_transaccion >= DATEADD(month, -12, GETDATE())
      GROUP BY MONTH(fecha_transaccion), YEAR(fecha_transaccion)
      ORDER BY año DESC, mes DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error en /api/reportes/mensuales:', err);
    res.status(500).json({ error: 'Error al obtener datos mensuales' });
  }
});

// Obtener datos por beneficiario
router.get('/reportes/beneficiarios', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT 
        beneficiario as name,
        SUM(monto) as amount,
        COUNT(*) as count,
        CAST(ROUND((SUM(monto) * 100.0 / NULLIF((SELECT SUM(monto) FROM Transacciones WHERE tipo = 'CHEQUE'), 0)), 0) AS INT) as percentage
      FROM Transacciones
      WHERE tipo = 'CHEQUE' AND beneficiario IS NOT NULL AND beneficiario != ''
      GROUP BY beneficiario
      HAVING SUM(monto) > 0
      ORDER BY SUM(monto) DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error en /api/reportes/beneficiarios:', err);
    res.status(500).json({ error: 'Error al obtener datos de beneficiarios' });
  }
});

// Obtener distribución de estados
router.get('/reportes/estados', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT 
        CASE 
          WHEN estado = 'COMPLETADA' OR estado = 'cobrado' THEN 'Cobrados'
          WHEN estado = 'PENDIENTE' OR estado = 'pendiente' THEN 'Pendientes'  
          WHEN estado = 'ANULADA' OR estado = 'anulado' THEN 'Anulados'
          WHEN estado = 'emitido' THEN 'Emitidos'
          ELSE estado
        END as name,
        COUNT(*) as value,
        CASE 
          WHEN estado = 'COMPLETADA' OR estado = 'cobrado' THEN '#059669'
          WHEN estado = 'PENDIENTE' OR estado = 'pendiente' THEN '#F59E0B'
          WHEN estado = 'ANULADA' OR estado = 'anulado' THEN '#DC2626'
          WHEN estado = 'emitido' THEN '#3B82F6'
          ELSE '#6B7280'
        END as color
      FROM (
        SELECT estado FROM Transacciones WHERE tipo = 'CHEQUE'
        UNION ALL
        SELECT estado FROM Cheques
      ) as todos_estados
      GROUP BY 
        CASE 
          WHEN estado = 'COMPLETADA' OR estado = 'cobrado' THEN 'Cobrados'
          WHEN estado = 'PENDIENTE' OR estado = 'pendiente' THEN 'Pendientes'
          WHEN estado = 'ANULADA' OR estado = 'anulado' THEN 'Anulados'
          WHEN estado = 'emitido' THEN 'Emitidos'
          ELSE estado
        END,
        CASE 
          WHEN estado = 'COMPLETADA' OR estado = 'cobrado' THEN '#059669'
          WHEN estado = 'PENDIENTE' OR estado = 'pendiente' THEN '#F59E0B'
          WHEN estado = 'ANULADA' OR estado = 'anulado' THEN '#DC2626'
          WHEN estado = 'emitido' THEN '#3B82F6'
          ELSE '#6B7280'
        END
      ORDER BY COUNT(*) DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error en /api/reportes/estados:', err);
    res.status(500).json({ error: 'Error al obtener distribución de estados' });
  }
});

// Obtener estadísticas generales para reportes
router.get('/reportes/estadisticas', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT 
        COUNT(*) as totalMovimientos,
        ISNULL(SUM(CASE WHEN tipo = 'CHEQUE' THEN monto ELSE 0 END), 0) as totalEgresos,
        ISNULL(SUM(CASE WHEN tipo = 'DEPOSITO' THEN monto ELSE 0 END), 0) as totalIngresos,
        ISNULL(MAX(CASE WHEN tipo = 'CHEQUE' THEN monto ELSE 0 END), 0) as mayorEgreso,
        ISNULL(MAX(CASE WHEN tipo = 'DEPOSITO' THEN monto ELSE 0 END), 0) as mayorIngreso,
        CAST(ROUND(AVG(monto), 2) AS DECIMAL(15,2)) as montoPromedio,
        CAST(ROUND((COUNT(CASE WHEN tipo = 'CHEQUE' AND (estado IN ('COMPLETADO', 'COMPLETADA', 'cobrado', 'COBRADO')) THEN 1 END) * 100.0 / NULLIF(COUNT(CASE WHEN tipo = 'CHEQUE' THEN 1 END), 0)), 1) AS DECIMAL(5,1)) as tasaCobro,
        CAST(ROUND((COUNT(CASE WHEN tipo = 'CHEQUE' AND (estado IN ('ANULADO', 'ANULADA', 'anulado')) THEN 1 END) * 100.0 / NULLIF(COUNT(CASE WHEN tipo = 'CHEQUE' THEN 1 END), 0)), 1) AS DECIMAL(5,1)) as porcentajeAnulados,
        COUNT(CASE WHEN tipo = 'CHEQUE' AND estado IN ('EMITIDO', 'emitido') THEN 1 END) as chequesEmitidos,
        COUNT(CASE WHEN tipo = 'CHEQUE' AND estado IN ('COMPLETADO', 'COMPLETADA', 'cobrado', 'COBRADO') THEN 1 END) as chequesCobrados,
        COUNT(CASE WHEN tipo = 'CHEQUE' AND estado IN ('PENDIENTE', 'pendiente', 'EMITIDO', 'emitido') THEN 1 END) as chequesPendientes,
        COUNT(CASE WHEN tipo = 'CHEQUE' AND estado IN ('ANULADO', 'ANULADA', 'anulado') THEN 1 END) as chequesAnulados,
        COUNT(CASE WHEN tipo = 'CHEQUE' THEN 1 END) as totalCheques,
        COUNT(CASE WHEN tipo = 'DEPOSITO' THEN 1 END) as totalDepositos
      FROM Transacciones
    `);
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error en /api/reportes/estadisticas:', err);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

module.exports = router;
