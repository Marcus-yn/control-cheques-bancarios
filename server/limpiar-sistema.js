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

async function limpiarSistema() {
    try {
        await sql.connect(config);
        console.log('🧹 INICIANDO LIMPIEZA DEL SISTEMA...');
        console.log('='.repeat(50));
        
        // 1. Eliminar todos los cheques
        console.log('🗑️ Eliminando todos los cheques...');
        const deleteCheques = await sql.query(`DELETE FROM Cheques`);
        console.log(`✅ Eliminados: ${deleteCheques.rowsAffected[0]} cheques`);
        
        // 2. Eliminar todas las chequeras
        console.log('🗑️ Eliminando todas las chequeras...');
        const deleteChequeras = await sql.query(`DELETE FROM Chequeras`);
        console.log(`✅ Eliminadas: ${deleteChequeras.rowsAffected[0]} chequeras`);
        
        // 3. Resetear auto-increment si es necesario
        console.log('🔄 Reseteando secuencias...');
        await sql.query(`DBCC CHECKIDENT ('Cheques', RESEED, 0)`);
        await sql.query(`DBCC CHECKIDENT ('Chequeras', RESEED, 0)`);
        
        console.log('='.repeat(50));
        console.log('✅ LIMPIEZA COMPLETADA EXITOSAMENTE');
        console.log('📊 El sistema está listo para las nuevas chequeras');
        
    } catch (err) {
        console.error('❌ Error durante la limpieza:', err.message);
    } finally {
        await sql.close();
    }
}

limpiarSistema();