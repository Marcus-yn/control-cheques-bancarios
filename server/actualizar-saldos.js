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

async function actualizarSaldosCuentas() {
    try {
        await sql.connect(config);
        console.log('💰 CALCULANDO Y ACTUALIZANDO SALDOS DE CUENTAS...');
        console.log('='.repeat(60));
        
        // Obtener todas las cuentas activas
        const cuentasResult = await sql.query(`
            SELECT id, nombre, banco, saldo_inicial, saldo_actual, moneda 
            FROM CuentasBancarias 
            WHERE activa = 1
            ORDER BY id
        `);
        
        const cuentas = cuentasResult.recordset;
        console.log(`📊 Cuentas activas encontradas: ${cuentas.length}`);
        
        let cuentasActualizadas = 0;
        
        for (const cuenta of cuentas) {
            console.log(`\n🏦 Procesando: ${cuenta.nombre} (${cuenta.banco})`);
            console.log(`   💰 Saldo inicial: ${cuenta.saldo_inicial} ${cuenta.moneda}`);
            console.log(`   💰 Saldo actual anterior: ${cuenta.saldo_actual} ${cuenta.moneda}`);
            
            // Calcular total de cheques por estado para esta cuenta
            const chequesResult = await sql.query(`
                SELECT 
                    estado,
                    COUNT(*) as cantidad,
                    SUM(monto) as total_monto
                FROM Cheques 
                WHERE cuenta_id = ${cuenta.id}
                GROUP BY estado
            `);
            
            let totalChequesCobrados = 0;
            let totalChequesPendientes = 0;
            let resumenCheques = {};
            
            chequesResult.recordset.forEach(row => {
                resumenCheques[row.estado] = {
                    cantidad: row.cantidad,
                    monto: row.total_monto || 0
                };
                
                // Solo los cheques cobrados afectan el saldo real
                if (row.estado === 'cobrado') {
                    totalChequesCobrados += row.total_monto || 0;
                }
                
                // Los pendientes y emitidos son comprometidos
                if (row.estado === 'pendiente' || row.estado === 'emitido') {
                    totalChequesPendientes += row.total_monto || 0;
                }
            });
            
            // Calcular nuevo saldo: saldo inicial - cheques cobrados
            const nuevoSaldo = cuenta.saldo_inicial - totalChequesCobrados;
            
            console.log(`   📋 Resumen de cheques:`);
            Object.entries(resumenCheques).forEach(([estado, info]) => {
                const emoji = {
                    'pendiente': '⏳',
                    'emitido': '📄',
                    'cobrado': '✅',
                    'cancelado': '❌'
                }[estado] || '📝';
                console.log(`      ${emoji} ${estado.toUpperCase()}: ${info.cantidad} cheques - ${info.monto.toFixed(2)} ${cuenta.moneda}`);
            });
            
            console.log(`   💸 Total cheques cobrados: ${totalChequesCobrados.toFixed(2)} ${cuenta.moneda}`);
            console.log(`   ⏳ Total comprometido (pendientes+emitidos): ${totalChequesPendientes.toFixed(2)} ${cuenta.moneda}`);
            console.log(`   💰 Nuevo saldo calculado: ${nuevoSaldo.toFixed(2)} ${cuenta.moneda}`);
            
            // Actualizar el saldo en la base de datos
            await sql.query(`
                UPDATE CuentasBancarias 
                SET saldo_actual = ${nuevoSaldo.toFixed(2)},
                    fecha_actualizacion = GETDATE()
                WHERE id = ${cuenta.id}
            `);
            
            cuentasActualizadas++;
            console.log(`   ✅ Saldo actualizado exitosamente`);
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('✅ PROCESO COMPLETADO');
        console.log(`📊 Total cuentas actualizadas: ${cuentasActualizadas}`);
        
        // Mostrar resumen final
        console.log('\n📈 RESUMEN FINAL DE SALDOS:');
        const resumenFinal = await sql.query(`
            SELECT nombre, banco, saldo_inicial, saldo_actual, moneda 
            FROM CuentasBancarias 
            WHERE activa = 1 
            ORDER BY banco, nombre
        `);
        
        resumenFinal.recordset.forEach(cuenta => {
            const diferencia = cuenta.saldo_actual - cuenta.saldo_inicial;
            const indicador = diferencia < 0 ? '📉' : diferencia > 0 ? '📈' : '➡️';
            console.log(`   🏦 ${cuenta.nombre} (${cuenta.banco})`);
            console.log(`      💰 Inicial: ${cuenta.saldo_inicial} ${cuenta.moneda} | Actual: ${cuenta.saldo_actual} ${cuenta.moneda} ${indicador}`);
        });
        
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await sql.close();
    }
}

actualizarSaldosCuentas();