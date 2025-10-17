
const express = require('express');
const sql = require('mssql');
const router = express.Router();

// Obtener lista de beneficiarios únicos
router.get('/beneficiarios', async (req, res) => {
  try {
  const pool = await sql.connect(router.dbConfig);
    const result = await pool.request().query(`
      SELECT DISTINCT beneficiario FROM Cheques WHERE beneficiario IS NOT NULL AND beneficiario <> ''
    `);
    const beneficiarios = result.recordset.map(row => row.beneficiario);
    res.json(beneficiarios);
  } catch (err) {
    console.error('Error en /api/beneficiarios:', err);
    res.json([]); // Siempre responde con array
  }
});

// Obtener todas las chequeras
router.get('/chequeras', async (req, res) => {
  try {
  const pool = await sql.connect(router.dbConfig);
    const result = await pool.request().query(`
      SELECT ch.*, c.nombre as cuenta_nombre, c.banco, c.moneda
      FROM Chequeras ch
      JOIN CuentasBancarias c ON ch.cuenta_id = c.id
      WHERE ch.activa = 1
      ORDER BY ch.fecha_creacion DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error en /api/chequeras:', err);
    res.json([]); // Siempre responde con array
  }
});

// Obtener todos los cheques
router.get('/cheques', async (req, res) => {
  try {
  const pool = await sql.connect(router.dbConfig);
    const result = await pool.request().query(`
      SELECT chq.*, ch.numero_inicial, ch.numero_final, ch.siguiente_numero, c.nombre as cuenta_nombre, c.banco, c.moneda
      FROM Cheques chq
      JOIN Chequeras ch ON chq.chequera_id = ch.id
      JOIN CuentasBancarias c ON chq.cuenta_id = c.id
      ORDER BY chq.fecha DESC
    `);
    // Mapear los nombres de las propiedades a los que espera el frontend
    const mapped = result.recordset.map(row => ({
      id: row.id,
      number: row.numero,
      date: row.fecha,
      beneficiary: row.beneficiario,
      amount: row.monto,
      concept: row.concepto,
      status: row.estado,
      account: row.cuenta_id,
      checkbook: row.chequera_id,
      bank: row.banco,
      currency: row.moneda
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Registrar un nuevo cheque
router.post('/cheques', async (req, res) => {
  const { accountId, date, beneficiary, amount, concept } = req.body;
  if (!accountId || !date || !beneficiary || !amount) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }
  try {
  const pool = await sql.connect(router.dbConfig);
    // Buscar chequera activa para la cuenta
    let chequeraRes = await pool.request().query(`SELECT TOP 1 * FROM Chequeras WHERE cuenta_id = ${accountId} AND activa = 1 ORDER BY fecha_creacion DESC`);
    let chequera = chequeraRes.recordset[0];
    // Si no existe chequera activa, crear una nueva con rango de 25 cheques
    if (!chequera) {
      const numeroInicial = 100001;
      const numeroFinal = numeroInicial + 24;
      // Validar que no exista chequera igual para la cuenta y rango
      const existeChequera = await pool.request().query(`SELECT id FROM Chequeras WHERE cuenta_id = ${accountId} AND numero_inicial = ${numeroInicial} AND numero_final = ${numeroFinal}`);
      if (existeChequera.recordset.length > 0) {
        chequeraRes = await pool.request().query(`SELECT TOP 1 * FROM Chequeras WHERE cuenta_id = ${accountId} AND numero_inicial = ${numeroInicial} AND numero_final = ${numeroFinal}`);
        chequera = chequeraRes.recordset[0];
      } else {
        await pool.request().query(`
          INSERT INTO Chequeras (cuenta_id, banco, numero_inicial, numero_final, siguiente_numero, activa)
          VALUES (${accountId}, 'BANCO', ${numeroInicial}, ${numeroFinal}, ${numeroInicial}, 1)
        `);
        chequeraRes = await pool.request().query(`SELECT TOP 1 * FROM Chequeras WHERE cuenta_id = ${accountId} AND activa = 1 ORDER BY fecha_creacion DESC`);
        chequera = chequeraRes.recordset[0];
      }
    }
    // Validar que no se exceda el rango de la chequera
    if (chequera.siguiente_numero > chequera.numero_final) {
      return res.status(400).json({ error: 'La chequera está agotada, solicite una nueva.' });
    }
    // Asignar número de cheque automático
    const number = chequera.siguiente_numero;
    // Validar que no exista cheque con ese número y chequera
    const existeCheque = await pool.request().query(`SELECT id FROM Cheques WHERE chequera_id = ${chequera.id} AND numero = ${number}`);
    if (existeCheque.recordset.length > 0) {
      return res.status(409).json({ error: 'Ya existe un cheque con ese número en la chequera.' });
    }
    // Insertar cheque
    await pool.request().query(`
      INSERT INTO Cheques (chequera_id, cuenta_id, numero, fecha, beneficiario, monto, concepto, estado)
      VALUES (${chequera.id}, ${accountId}, ${number}, '${date}', '${beneficiary}', ${amount}, '${concept}', 'emitido')
    `);
    // Actualizar siguiente_numero en la chequera
    await pool.request().query(`
      UPDATE Chequeras SET siguiente_numero = siguiente_numero + 1 WHERE id = ${chequera.id}
    `);
    // Restar el monto del cheque al saldo_actual de la cuenta bancaria
    await pool.request().query(`
      UPDATE CuentasBancarias SET saldo_actual = saldo_actual - ${amount} WHERE id = ${accountId}
    `);
    res.status(201).json({ mensaje: 'Cheque registrado correctamente y saldo actualizado', numeroCheque: number });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cambiar estado de un cheque
router.put('/cheques/:id/estado', async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  if (!status) return res.status(400).json({ error: 'Falta el estado' });
  try {
  const pool = await sql.connect(router.dbConfig);
    // Obtener el cheque actual
    const chequeRes = await pool.request().query(`SELECT monto, cuenta_id, estado FROM Cheques WHERE id = ${id}`);
    const cheque = chequeRes.recordset[0];
    await pool.request().query(`
      UPDATE Cheques SET estado = '${status}' WHERE id = ${id}
    `);
    // Si el estado cambia a 'anulado' y antes no era 'anulado', devolver el monto al saldo_actual
    if (cheque && cheque.estado !== 'anulado' && status === 'anulado') {
      await pool.request().query(`
        UPDATE CuentasBancarias SET saldo_actual = saldo_actual + ${cheque.monto} WHERE id = ${cheque.cuenta_id}
      `);
    }
    // Si el estado cambia a 'cobrado' y antes era 'pendiente', descontar el monto del saldo_actual
    if (cheque && cheque.estado === 'pendiente' && status === 'cobrado') {
      await pool.request().query(`
        UPDATE CuentasBancarias SET saldo_actual = saldo_actual - ${cheque.monto} WHERE id = ${cheque.cuenta_id}
      `);
    }
    res.json({ mensaje: 'Estado actualizado y saldo ajustado si corresponde' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
