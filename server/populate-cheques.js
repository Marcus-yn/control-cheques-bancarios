// Script para poblar Chequeras y Cheques con datos de ejemplo
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

async function poblarChequerasYCheques() {
  try {
    await sql.connect(dbConfig);
    // Obtener cuentas existentes
    const cuentas = (await sql.query`SELECT id, banco, numero, nombre FROM CuentasBancarias WHERE activa = 1`).recordset;
    if (cuentas.length === 0) {
      console.log('No hay cuentas bancarias activas.');
      process.exit(1);
    }

    // Insertar chequeras para las primeras 5 cuentas
    for (let i = 0; i < Math.min(5, cuentas.length); i++) {
      const cuenta = cuentas[i];
      // Chequera de 100 cheques
      const chequeraRes = await sql.query`
        IF NOT EXISTS (SELECT 1 FROM Chequeras WHERE cuenta_id = ${cuenta.id})
        BEGIN
          INSERT INTO Chequeras (cuenta_id, numero_inicial, numero_final, siguiente_numero, total_cheques, activa)
          VALUES (${cuenta.id}, 1001, 1100, 1001, 100, 1)
        END
        SELECT TOP 1 * FROM Chequeras WHERE cuenta_id = ${cuenta.id}
      `;
      const chequera = chequeraRes.recordset[0];
      if (!chequera) continue;
      
      // Insertar 5 cheques de ejemplo con diferentes estados
      const beneficiarios = ['Proveedor ABC S.A.', 'Servicios XYZ Ltda.', 'Juan Pérez', 'María González', 'Empresa DEF S.A.'];
      const conceptos = ['Pago servicios', 'Compra mercadería', 'Pago honorarios', 'Reembolso gastos', 'Pago proveedores'];
      const estados = ['pendiente', 'cobrado', 'emitido', 'pendiente', 'cancelado'];
      
      for (let i = 0; i < 5; i++) {
        const chequeNum = chequera.numero_inicial + i;
        const beneficiario = beneficiarios[i];
        const monto = (1000 + (i * 500)) * Math.random() + 500; // Montos aleatorios entre 500-2500
        const concepto = conceptos[i];
        const estado = estados[i];
        
        await sql.query`
          IF NOT EXISTS (SELECT 1 FROM Cheques WHERE chequera_id = ${chequera.id} AND numero = ${chequeNum})
          BEGIN
            INSERT INTO Cheques (chequera_id, cuenta_id, numero, fecha, beneficiario, monto, concepto, estado)
            VALUES (${chequera.id}, ${cuenta.id}, ${chequeNum}, DATEADD(day, -${i}, GETDATE()), ${beneficiario}, ${monto}, ${concepto}, ${estado})
          END
        `;
      }
      
      // Actualizar el siguiente_numero en la chequera
      await sql.query`
        UPDATE Chequeras 
        SET siguiente_numero = ${chequera.numero_inicial + 5}
        WHERE id = ${chequera.id}
      `;
      
      console.log(`Chequera y 5 cheques de ejemplo insertados para cuenta: ${cuenta.nombre}`);
    }
    console.log('Poblado de chequeras y cheques completado.');
    process.exit(0);
  } catch (err) {
    console.error('Error al poblar chequeras/cheques:', err);
    process.exit(1);
  }
}

poblarChequerasYCheques();
