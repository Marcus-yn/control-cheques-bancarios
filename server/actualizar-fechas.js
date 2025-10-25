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

function obtenerFechaAleatoria2024_2025() {
    // 50% para 2024, 50% para 2025
    const año = Math.random() < 0.5 ? 2024 : 2025;
    
    let mes, día;
    
    if (año === 2024) {
        // Para 2024: enero a diciembre
        mes = Math.floor(Math.random() * 12) + 1;
        día = Math.floor(Math.random() * 28) + 1; // Usar 28 para evitar problemas con febrero
    } else {
        // Para 2025: enero a octubre (hasta la fecha actual)
        mes = Math.floor(Math.random() * 10) + 1;
        if (mes === 10) {
            // Si es octubre 2025, hasta el día 24
            día = Math.floor(Math.random() * 24) + 1;
        } else {
            día = Math.floor(Math.random() * 28) + 1;
        }
    }
    
    return `${año}-${mes.toString().padStart(2, '0')}-${día.toString().padStart(2, '0')}`;
}

async function actualizarFechasCheques() {
    try {
        await sql.connect(config);
        console.log('📅 ACTUALIZANDO FECHAS DE CHEQUES 2024-2025...');
        console.log('='.repeat(50));
        
        // Obtener todos los cheques
        const chequesResult = await sql.query(`SELECT id, numero, beneficiario FROM Cheques ORDER BY id`);
        const cheques = chequesResult.recordset;
        
        console.log(`📊 Cheques encontrados: ${cheques.length}`);
        
        let actualizados = 0;
        let estadisticas = {
            '2024': 0,
            '2025': 0
        };
        
        for (const cheque of cheques) {
            const nuevaFecha = obtenerFechaAleatoria2024_2025();
            const año = nuevaFecha.split('-')[0];
            
            await sql.query(`
                UPDATE Cheques 
                SET fecha = '${nuevaFecha}' 
                WHERE id = ${cheque.id}
            `);
            
            actualizados++;
            estadisticas[año]++;
            
            if (actualizados % 20 === 0) {
                console.log(`📝 Actualizados ${actualizados} cheques...`);
            }
        }
        
        console.log('='.repeat(50));
        console.log('✅ PROCESO COMPLETADO');
        console.log(`📊 Total cheques actualizados: ${actualizados}`);
        console.log('\n📈 DISTRIBUCIÓN POR AÑO:');
        console.log(`   📅 2024: ${estadisticas['2024']} cheques`);
        console.log(`   📅 2025: ${estadisticas['2025']} cheques`);
        
        // Mostrar algunos ejemplos
        console.log('\n🔍 MUESTRA DE FECHAS ACTUALIZADAS:');
        const muestraResult = await sql.query(`
            SELECT TOP 5 numero, beneficiario, fecha 
            FROM Cheques 
            ORDER BY fecha DESC
        `);
        
        muestraResult.recordset.forEach((cheque, i) => {
            console.log(`   ${i+1}. Cheque #${cheque.numero} - ${cheque.fecha.toISOString().split('T')[0]} - ${cheque.beneficiario}`);
        });
        
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await sql.close();
    }
}

actualizarFechasCheques();