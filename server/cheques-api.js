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
    res.json([]);
  }
});

// Obtener todas las chequeras
router.get('/chequeras', async (req, res) => {
  try {
    const pool = await sql.connect(router.dbConfig);
    const result = await pool.request().query(`
      SELECT ch.*, c.nombre as cuenta_nombre, c.banco, ISNULL(c.moneda, 'GTQ') as moneda
      FROM Chequeras ch
      JOIN CuentasBancarias c ON ch.cuenta_id = c.id
      WHERE ch.activa = 1
      ORDER BY ch.fecha_creacion DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error en /api/chequeras:', err);
    res.json([]);
  }
});

// Obtener todos los cheques
router.get('/cheques', async (req, res) => {
  try {
    const pool = await sql.connect(router.dbConfig);
    const result = await pool.request().query(`
      SELECT chq.*, ch.numero_inicial, ch.numero_final, ch.siguiente_numero, 
             c.nombre as cuenta_nombre, c.banco, ISNULL(c.moneda, 'GTQ') as moneda
      FROM Cheques chq
      JOIN Chequeras ch ON chq.chequera_id = ch.id
      JOIN CuentasBancarias c ON chq.cuenta_id = c.id
      ORDER BY chq.fecha DESC
    `);
    
    // Mapear los datos para compatibilidad con frontend
    const mapped = result.recordset.map(row => ({
      id: row.id,
      number: row.numero,
      date: row.fecha,
      beneficiary: row.beneficiario,
      amount: row.monto,
      concept: row.concepto,
      status: row.estado,
      account: row.cuenta_id,
      account_name: row.cuenta_nombre,
      checkbook: row.chequera_id,
      bank: row.banco,
      currency: row.moneda
    }));
    
    res.json(mapped);
  } catch (err) {
    console.error('Error en /api/cheques:', err);
    res.status(500).json({ error: err.message });
  }
});

// Crear un nuevo cheque con numeración automática o manual
router.post('/cheques', async (req, res) => {
  const { accountId, date, beneficiary, amount, concept, customNumber, useCustomNumber } = req.body;
  
  if (!accountId || !date || !beneficiary || !amount) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }
  
  try {
    const pool = await sql.connect(router.dbConfig);
    
    // Verificar que la cuenta existe y tiene saldo suficiente
    const cuentaResult = await pool.request().query(`
      SELECT id, saldo_actual FROM CuentasBancarias WHERE id = ${accountId} AND activa = 1
    `);
    
    if (cuentaResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Cuenta bancaria no encontrada' });
    }
    
    const cuenta = cuentaResult.recordset[0];
    if (cuenta.saldo_actual < amount) {
      return res.status(400).json({ error: 'Saldo insuficiente en la cuenta' });
    }
    
    // Buscar chequera activa para la cuenta
    const chequeraRes = await pool.request().query(`
      SELECT TOP 1 * FROM Chequeras 
      WHERE cuenta_id = ${accountId} AND activa = 1 
      ORDER BY fecha_creacion DESC
    `);
    
    if (chequeraRes.recordset.length === 0) {
      return res.status(400).json({ error: 'No hay chequeras disponibles para esta cuenta' });
    }
    
    const chequera = chequeraRes.recordset[0];
    let number;
    
    if (useCustomNumber && customNumber) {
      // Usar número manual
      number = parseInt(customNumber);
      
      // Validar que el número esté en el rango de la chequera
      if (number < chequera.numero_inicial || number > chequera.numero_final) {
        return res.status(400).json({ 
          error: `El número debe estar entre ${chequera.numero_inicial} y ${chequera.numero_final}` 
        });
      }
      
      // Verificar que el número no esté ya usado
      const chequeExiste = await pool.request().query(`
        SELECT id FROM Cheques 
        WHERE chequera_id = ${chequera.id} AND numero = ${number}
      `);
      
      if (chequeExiste.recordset.length > 0) {
        return res.status(409).json({ error: `El cheque número ${number} ya existe` });
      }
    } else {
      // Usar numeración automática
      if (chequera.siguiente_numero > chequera.numero_final) {
        return res.status(400).json({ error: 'La chequera está agotada, solicite una nueva.' });
      }
      
      // Buscar el siguiente número disponible (en caso de haber números saltados)
      let numeroDisponible = chequera.siguiente_numero;
      while (numeroDisponible <= chequera.numero_final) {
        const existe = await pool.request().query(`
          SELECT id FROM Cheques 
          WHERE chequera_id = ${chequera.id} AND numero = ${numeroDisponible}
        `);
        
        if (existe.recordset.length === 0) {
          break; // Número disponible encontrado
        }
        numeroDisponible++;
      }
      
      if (numeroDisponible > chequera.numero_final) {
        return res.status(400).json({ error: 'No hay números de cheque disponibles en esta chequera' });
      }
      
      number = numeroDisponible;
    }
    
    // Insertar cheque con estado inicial 'pendiente'
    await pool.request().query(`
      INSERT INTO Cheques (chequera_id, cuenta_id, numero, fecha, beneficiario, monto, concepto, estado)
      VALUES (${chequera.id}, ${accountId}, ${number}, '${date}', '${beneficiary}', ${amount}, '${concept}', 'pendiente')
    `);
    
    // Actualizar siguiente_numero en la chequera solo si se usó numeración automática
    if (!useCustomNumber || !customNumber) {
      const nuevoSiguiente = number + 1;
      await pool.request().query(`
        UPDATE Chequeras SET siguiente_numero = ${nuevoSiguiente} WHERE id = ${chequera.id}
      `);
    }
    
    // Descontar el monto del cheque del saldo_actual de la cuenta bancaria
    await pool.request().query(`
      UPDATE CuentasBancarias 
      SET saldo_actual = saldo_actual - ${amount}, fecha_actualizacion = GETDATE()
      WHERE id = ${accountId}
    `);
    
    res.status(201).json({ 
      mensaje: 'Cheque creado correctamente como PENDIENTE y monto descontado', 
      numeroCheque: number,
      estado: 'pendiente',
      montoDescontado: amount,
      nuevoSaldo: cuenta.saldo_actual - amount
    });
  } catch (err) {
    console.error('Error en POST /api/cheques:', err);
    res.status(500).json({ error: err.message });
  }
});

// Cambiar estado de un cheque
router.put('/cheques/:id/estado', async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  
  if (!status) {
    return res.status(400).json({ error: 'Falta el estado' });
  }
  
  const estadosValidos = ['pendiente', 'cobrado', 'cancelado', 'emitido'];
  if (!estadosValidos.includes(status)) {
    return res.status(400).json({ error: 'Estado no válido' });
  }
  
  try {
    const pool = await sql.connect(router.dbConfig);
    
    // Obtener el cheque actual
    const chequeRes = await pool.request().query(`
      SELECT monto, cuenta_id, estado FROM Cheques WHERE id = ${id}
    `);
    
    if (chequeRes.recordset.length === 0) {
      return res.status(404).json({ error: 'Cheque no encontrado' });
    }
    
    const cheque = chequeRes.recordset[0];
    const estadoAnterior = cheque.estado;
    const nuevoEstado = status;
    
    // Si no hay cambio de estado, no hacer nada
    if (estadoAnterior === nuevoEstado) {
      return res.json({ 
        mensaje: 'El cheque ya se encuentra en ese estado',
        estadoAnterior: estadoAnterior,
        nuevoEstado: nuevoEstado,
        ajusteSaldo: 0
      });
    }
    
    // Actualizar estado del cheque
    await pool.request().query(`
      UPDATE Cheques SET estado = '${nuevoEstado}' WHERE id = ${id}
    `);
    
    // Manejar cambios de saldo según transiciones de estado
    let ajusteSaldo = 0;
    let mensaje = 'Estado actualizado';
    
    // LÓGICA DE ESTADOS:
    // pendiente -> cobrado: ya estaba descontado, no hay cambio
    // pendiente -> cancelado: devolver dinero (+monto)
    // cobrado -> cancelado: devolver dinero (+monto)
    // emitido -> cobrado: ya se descontó al crear, no hay cambio adicional  
    // emitido -> cancelado: devolver dinero (+monto)
    // cancelado -> cualquier otro: descontar nuevamente (-monto)
    
    if (nuevoEstado === 'cancelado' && estadoAnterior !== 'cancelado') {
      // Devolver dinero cuando se cancela
      ajusteSaldo = cheque.monto;
      mensaje = 'Cheque cancelado, monto devuelto a la cuenta';
    } else if (estadoAnterior === 'cancelado' && nuevoEstado !== 'cancelado') {
      // Descontar dinero cuando se reactiva un cheque cancelado
      ajusteSaldo = -cheque.monto;
      mensaje = 'Cheque reactivado, monto descontado de la cuenta';
    }
    
    // Aplicar ajuste de saldo si es necesario
    if (ajusteSaldo !== 0) {
      await pool.request().query(`
        UPDATE CuentasBancarias 
        SET saldo_actual = saldo_actual + ${ajusteSaldo}, fecha_actualizacion = GETDATE()
        WHERE id = ${cheque.cuenta_id}
      `);
    }
    
    res.json({ 
      mensaje: mensaje,
      estadoAnterior: estadoAnterior,
      nuevoEstado: nuevoEstado,
      ajusteSaldo: ajusteSaldo
    });
  } catch (err) {
    console.error('Error en PUT /api/cheques/:id/estado:', err);
    res.status(500).json({ error: err.message });
  }
});

// Obtener siguiente número de cheque disponible para una chequera
router.get('/chequeras/:id/siguiente-numero', async (req, res) => {
  const { id } = req.params;
  
  try {
    const pool = await sql.connect(router.dbConfig);
    
    // Obtener información de la chequera
    const chequeraRes = await pool.request().query(`
      SELECT * FROM Chequeras WHERE id = ${id} AND activa = 1
    `);
    
    if (chequeraRes.recordset.length === 0) {
      return res.status(404).json({ error: 'Chequera no encontrada' });
    }
    
    const chequera = chequeraRes.recordset[0];
    
    // Buscar el siguiente número disponible
    let numeroDisponible = chequera.siguiente_numero;
    while (numeroDisponible <= chequera.numero_final) {
      const existe = await pool.request().query(`
        SELECT id FROM Cheques 
        WHERE chequera_id = ${id} AND numero = ${numeroDisponible}
      `);
      
      if (existe.recordset.length === 0) {
        break; // Número disponible encontrado
      }
      numeroDisponible++;
    }
    
    if (numeroDisponible > chequera.numero_final) {
      return res.json({ 
        siguiente_numero: null,
        chequera_agotada: true,
        mensaje: 'No hay números disponibles en esta chequera'
      });
    }
    
    res.json({ 
      siguiente_numero: numeroDisponible,
      chequera_agotada: false,
      rango_inicial: chequera.numero_inicial,
      rango_final: chequera.numero_final
    });
  } catch (err) {
    console.error('Error en /api/chequeras/:id/siguiente-numero:', err);
    res.status(500).json({ error: err.message });
  }
});

// Verificar si un número de cheque está disponible
router.get('/chequeras/:id/verificar-numero/:numero', async (req, res) => {
  const { id, numero } = req.params;
  
  try {
    const pool = await sql.connect(router.dbConfig);
    
    // Obtener información de la chequera
    const chequeraRes = await pool.request().query(`
      SELECT * FROM Chequeras WHERE id = ${id} AND activa = 1
    `);
    
    if (chequeraRes.recordset.length === 0) {
      return res.status(404).json({ error: 'Chequera no encontrada' });
    }
    
    const chequera = chequeraRes.recordset[0];
    const numeroInt = parseInt(numero);
    
    // Verificar que esté en el rango
    if (numeroInt < chequera.numero_inicial || numeroInt > chequera.numero_final) {
      return res.json({ 
        disponible: false,
        razon: `Número fuera del rango (${chequera.numero_inicial}-${chequera.numero_final})`
      });
    }
    
    // Verificar que no esté usado
    const existe = await pool.request().query(`
      SELECT id FROM Cheques 
      WHERE chequera_id = ${id} AND numero = ${numeroInt}
    `);
    
    if (existe.recordset.length > 0) {
      return res.json({ 
        disponible: false,
        razon: 'Número ya utilizado'
      });
    }
    
    res.json({ 
      disponible: true,
      numero: numeroInt
    });
  } catch (err) {
    console.error('Error en /api/chequeras/:id/verificar-numero:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;