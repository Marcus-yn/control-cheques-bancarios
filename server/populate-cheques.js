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
    const cuentas = (await sql.query`SELECT id, banco, numero FROM CuentasBancarias WHERE activa = 1`).recordset;
    if (cuentas.length === 0) {
      console.log('No hay cuentas bancarias activas.');
      process.exit(1);
    }

    // Insertar chequeras para cada cuenta
    for (const cuenta of cuentas) {
      // Chequera de 100 cheques
      const chequeraRes = await sql.query`
        IF NOT EXISTS (SELECT 1 FROM Chequeras WHERE cuenta_id = ${cuenta.id})
        BEGIN
          INSERT INTO Chequeras (cuenta_id, banco, numero_inicial, numero_final, siguiente_numero, activa)
          VALUES (${cuenta.id}, ${cuenta.banco}, 1001, 1100, 1001, 1)
        END
        SELECT TOP 1 * FROM Chequeras WHERE cuenta_id = ${cuenta.id}
      `;
      const chequera = chequeraRes.recordset[0];
      if (!chequera) continue;
      // Insertar 5 cheques de ejemplo
      for (let i = 0; i < 5; i++) {
        const chequeNum = chequera.numero_inicial + i;
        const beneficiario = `Beneficiario ${i+1}`;
        const monto = 1000 * (i+1);
        const concepto = `Pago de ejemplo ${i+1}`;
        await sql.query`
          IF NOT EXISTS (SELECT 1 FROM Cheques WHERE chequera_id = ${chequera.id} AND numero = ${chequeNum})
          BEGIN
            INSERT INTO Cheques (chequera_id, cuenta_id, numero, fecha, beneficiario, monto, concepto, estado)
            VALUES (${chequera.id}, ${cuenta.id}, ${chequeNum}, GETDATE(), ${beneficiario}, ${monto}, ${concepto}, 'emitido')
          END
        `;
      }
      console.log(`Chequera y cheques de ejemplo insertados para cuenta ${cuenta.numero}`);
    }
    console.log('Poblado de chequeras y cheques completado.');
    process.exit(0);
  } catch (err) {
    console.error('Error al poblar chequeras/cheques:', err);
    process.exit(1);
  }
}

poblarChequerasYCheques();
