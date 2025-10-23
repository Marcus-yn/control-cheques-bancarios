// Script para registrar cuentas mock en la base de datos
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

const cuentasMock = [
  { nombre: 'Cuenta Principal - Banco Agromercantil (BAM)', banco: 'BANCO AGROMERCANTIL (BAM)', numero: 'BAM-10000001', moneda: 'GTQ', tipo_cuenta: 'monetaria', titular: 'Pedro', saldo_inicial: 387500 },
  { nombre: 'Cuenta Operativa - Banco Industrial (BI)', banco: 'BANCO INDUSTRIAL', numero: 'BI-10000002', moneda: 'GTQ', tipo_cuenta: 'monetaria', titular: 'Marcos Aaron', saldo_inicial: 125000 },
  { nombre: 'Cuenta Dólares - BAC Credomatic', banco: 'BAC CREDOMATIC', numero: 'BAC-10000003', moneda: 'USD', tipo_cuenta: 'monetaria', titular: 'Empresa S.A.', saldo_inicial: 45000 },
  { nombre: 'Cuenta Nómina - Banrural', banco: 'BANRURAL', numero: 'BR-10000004', moneda: 'GTQ', tipo_cuenta: 'monetaria', titular: 'Recursos Humanos', saldo_inicial: 98750 },
  { nombre: 'Cuenta Comercial - G&T Continental', banco: 'BANCO G&T CONTINENTAL', numero: 'GT-10000005', moneda: 'GTQ', tipo_cuenta: 'monetaria', titular: 'Comercial S.A.', saldo_inicial: 256300 },
  { nombre: 'Cuenta USD - Banco Promerica', banco: 'BANCO PROMERICA', numero: 'PRO-10000006', moneda: 'USD', tipo_cuenta: 'monetaria', titular: 'Exportaciones', saldo_inicial: 78200 },
  { nombre: 'Cuenta Empresarial - Banco Internacional', banco: 'BANCO INTERNACIONAL', numero: 'INT-10000007', moneda: 'GTQ', tipo_cuenta: 'monetaria', titular: 'Empresarial S.A.', saldo_inicial: 145600 },
  { nombre: 'Cuenta Microempresa - Vivibanco', banco: 'VIVIBANCO', numero: 'VIV-10000008', moneda: 'GTQ', tipo_cuenta: 'monetaria', titular: 'Microempresa S.A.', saldo_inicial: 89400 }
];

async function registrarCuentas() {
  try {
    await sql.connect(dbConfig);
    // Crear tabla Chequeras si no existe
    await sql.query(`
      IF OBJECT_ID('Chequeras', 'U') IS NULL
      CREATE TABLE Chequeras (
        id INT IDENTITY(1,1) PRIMARY KEY,
        cuenta_id INT NOT NULL,
        banco NVARCHAR(100) NOT NULL,
        numero_inicial INT NOT NULL,
        numero_final INT NOT NULL,
        siguiente_numero INT NOT NULL,
        activa BIT DEFAULT 1,
        fecha_creacion DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (cuenta_id) REFERENCES CuentasBancarias(id)
      )
    `);
    // Crear tabla Cheques si no existe
    await sql.query(`
      IF OBJECT_ID('Cheques', 'U') IS NULL
      CREATE TABLE Cheques (
        id INT IDENTITY(1,1) PRIMARY KEY,
        chequera_id INT NOT NULL,
        cuenta_id INT NOT NULL,
        numero INT NOT NULL,
        fecha DATETIME NOT NULL,
        beneficiario NVARCHAR(100) NOT NULL,
        monto DECIMAL(15,2) NOT NULL,
        concepto NVARCHAR(200),
        estado NVARCHAR(20) DEFAULT 'emitido',
        fecha_emision DATETIME DEFAULT GETDATE(),
        fecha_cobro DATETIME NULL,
        FOREIGN KEY (chequera_id) REFERENCES Chequeras(id),
        FOREIGN KEY (cuenta_id) REFERENCES CuentasBancarias(id)
      )
    `);
    for (const cuenta of cuentasMock) {
      await sql.query`
        IF NOT EXISTS (SELECT 1 FROM CuentasBancarias WHERE numero = ${cuenta.numero})
        INSERT INTO CuentasBancarias (nombre, numero, banco, moneda, tipo_cuenta, titular, saldo_inicial, saldo_actual, activa)
        VALUES (${cuenta.nombre}, ${cuenta.numero}, ${cuenta.banco}, ${cuenta.moneda}, ${cuenta.tipo_cuenta}, ${cuenta.titular}, ${cuenta.saldo_inicial}, ${cuenta.saldo_inicial}, 1)
      `;
      console.log('Registrada:', cuenta.nombre);
    }
    console.log('Todas las cuentas mock han sido registradas.');
    process.exit(0);
  } catch (err) {
    console.error('Error al registrar cuentas:', err);
    process.exit(1);
  }
}

registrarCuentas();
