const sql = require('mssql');

const config = {
    user: 'marcus',
    password: 'UMG2025@',
    server: 'localhost',
    database: 'ControlCheques',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

// Mapeo de bancos con sus códigos y rangos base
const bancosInfo = {
    'BANCO INDUSTRIAL': { codigo: 'BI', rangoBase: 1 },
    'BANRURAL': { codigo: 'BR', rangoBase: 100 },
    'BANCO G&T CONTINENTAL': { codigo: 'GT', rangoBase: 200 },
    'BANCO AGROMERCANTIL (BAM)': { codigo: 'BAM', rangoBase: 300 },
    'BAC CREDOMATIC': { codigo: 'BAC', rangoBase: 400 },
    'BANCO PROMERICA': { codigo: 'PRO', rangoBase: 500 },
    'BANCO INTERNACIONAL': { codigo: 'INT', rangoBase: 600 },
    'VIVIBANCO': { codigo: 'VIV', rangoBase: 700 }
};

async function crearChequeras25() {
    try {
        await sql.connect(config);
        console.log('🏦 CREANDO CHEQUERAS DE 25 CHEQUES CON RANGOS ÚNICOS...');
        console.log('='.repeat(60));
        
        // Obtener todas las cuentas
        const cuentasResult = await sql.query(`
            SELECT id, nombre, banco, numero, moneda 
            FROM CuentasBancarias 
            ORDER BY id
        `);
        
        const cuentas = cuentasResult.recordset;
        console.log(`📊 Encontradas ${cuentas.length} cuentas`);
        
        let chequeras_creadas = 0;
        let contador_por_banco = {}; // Para llevar la cuenta de chequeras por banco
        
        for (const cuenta of cuentas) {
            const bancoInfo = bancosInfo[cuenta.banco];
            if (!bancoInfo) {
                console.log(`⚠️ Banco no encontrado: ${cuenta.banco}`);
                continue;
            }
            
            // Inicializar contador si no existe
            if (!contador_por_banco[cuenta.banco]) {
                contador_por_banco[cuenta.banco] = 0;
            }
            
            // Calcular rango único para esta cuenta
            const rangoOffset = contador_por_banco[cuenta.banco] * 30; // 30 números entre cada chequera (25 + 5 de buffer)
            const numero_inicial = bancoInfo.rangoBase + rangoOffset + 1;
            const numero_final = numero_inicial + 24; // 25 cheques
            
            contador_por_banco[cuenta.banco]++;
            
            console.log(`🏦 Procesando: ${cuenta.nombre} (${bancoInfo.codigo})`);
            console.log(`   📋 Rango: ${numero_inicial} - ${numero_final}`);
            
            // Crear la chequera
            const insertResult = await sql.query(`
                INSERT INTO Chequeras (
                    cuenta_id, 
                    numero_inicial, 
                    numero_final, 
                    total_cheques, 
                    siguiente_numero, 
                    activa, 
                    fecha_creacion
                ) VALUES (
                    ${cuenta.id}, 
                    ${numero_inicial}, 
                    ${numero_final}, 
                    25, 
                    ${numero_inicial}, 
                    1, 
                    GETDATE()
                )
            `);
            
            if (insertResult.rowsAffected[0] > 0) {
                chequeras_creadas++;
                console.log(`   ✅ Chequera creada exitosamente`);
            } else {
                console.log(`   ❌ Error al crear chequera`);
            }
            
            console.log('   ' + '-'.repeat(40));
        }
        
        console.log('='.repeat(60));
        console.log('✅ PROCESO COMPLETADO');
        console.log(`📊 Total chequeras creadas: ${chequeras_creadas}`);
        console.log(`💳 Total cheques disponibles: ${chequeras_creadas * 25}`);
        
        console.log('\n🏦 RESUMEN POR BANCO:');
        for (const [banco, cantidad] of Object.entries(contador_por_banco)) {
            const info = bancosInfo[banco];
            console.log(`   ${info.codigo}: ${cantidad} chequeras (${cantidad * 25} cheques)`);
        }
        
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await sql.close();
    }
}

crearChequeras25();