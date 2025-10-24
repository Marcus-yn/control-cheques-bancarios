const sql = require('mssql');

const config = {
    server: 'localhost',
    database: 'ControlCheques',
    user: 'sa',
    password: 'yourpassword',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

async function verificarCheques() {
    try {
        await sql.connect(config);
        
        // Verificar todos los cheques
        const todosLosChequesQuery = `
            SELECT COUNT(*) as total_cheques FROM Cheques
        `;
        const totalResult = await sql.query(todosLosChequesQuery);
        
        // Verificar cheques recientes
        const chequesRecientesQuery = `
            SELECT TOP 10 
                ch.id,
                ch.numero,
                ch.monto,
                ch.beneficiario,
                ch.fecha_creacion,
                ch.estado,
                c.nombre as cuenta_nombre,
                c.numero as cuenta_numero
            FROM Cheques ch 
            JOIN Cuentas c ON ch.cuenta_id = c.id 
            ORDER BY ch.fecha_creacion DESC
        `;
        const chequesResult = await sql.query(chequesRecientesQuery);
        
        console.log('🔍 VERIFICACIÓN DE CHEQUES');
        console.log('='.repeat(50));
        console.log(`📊 Total de cheques en BD: ${totalResult.recordset[0].total_cheques}`);
        console.log('');
        
        if (chequesResult.recordset.length === 0) {
            console.log('❌ No hay cheques en la base de datos');
        } else {
            console.log('📋 ÚLTIMOS 10 CHEQUES:');
            console.log('-'.repeat(50));
            chequesResult.recordset.forEach((ch, i) => {
                console.log(`${i+1}. Cheque #${ch.numero} - $${ch.monto}`);
                console.log(`   📱 ID: ${ch.id}`);
                console.log(`   🏦 Cuenta: ${ch.cuenta_nombre} (${ch.cuenta_numero})`);
                console.log(`   👤 Beneficiario: ${ch.beneficiario}`);
                console.log(`   📅 Fecha: ${ch.fecha_creacion}`);
                console.log(`   📊 Estado: ${ch.estado}`);
                console.log('   ' + '-'.repeat(40));
            });
        }
        
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await sql.close();
    }
}

verificarCheques();