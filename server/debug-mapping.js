const fetch = require('node-fetch');

async function debugAPI() {
    try {
        console.log('🔍 DEBUGGING FRONTEND-BACKEND DATA MAPPING...\n');
        
        // Simular exactamente lo que hace el frontend
        const [accountsRes, checkbooksRes] = await Promise.all([
            fetch('http://localhost:3001/api/cuentas'),
            fetch('http://localhost:3001/api/chequeras')
        ]);

        const accountsData = await accountsRes.json();
        const checkbooksData = await checkbooksRes.json();

        console.log('📊 RAW DATA FROM API:');
        console.log('Accounts sample:', JSON.stringify(accountsData[0], null, 2));
        console.log('Checkbooks sample:', JSON.stringify(checkbooksData[0], null, 2));

        // Mapear exactamente como lo hace el frontend
        const mappedAccounts = Array.isArray(accountsData) ? accountsData.map(acc => ({
            ...acc,
            balance: typeof acc.saldo_actual === 'number' && !isNaN(acc.saldo_actual) ? acc.saldo_actual : 0,
            currency: acc.moneda || 'GTQ',
            name: acc.nombre
        })) : [];

        const mappedCheckbooks = Array.isArray(checkbooksData) ? checkbooksData.map(cb => ({
            ...cb,
            accountId: String(cb.cuenta_id || cb.accountId),
            bank: cb.banco || '',
            name: cb.id ? `Chequera #${cb.id}` : (cb.name || ''),
            startNumber: cb.numero_inicial || cb.startNumber,
            endNumber: cb.numero_final || cb.endNumber,
            nextNumber: cb.siguiente_numero || cb.nextNumber
        })) : [];

        console.log('\n🔄 MAPPED DATA:');
        console.log('Mapped accounts length:', mappedAccounts.length);
        console.log('Mapped checkbooks length:', mappedCheckbooks.length);
        console.log('Mapped checkbooks sample:', JSON.stringify(mappedCheckbooks[0], null, 2));

        // Test the filtering logic
        const selectedAccount = String(mappedAccounts[0].id);
        const availableCheckbooks = mappedCheckbooks.filter(cb => cb.accountId === selectedAccount);
        
        console.log('\n🔎 FILTERING TEST:');
        console.log('Selected account ID:', selectedAccount);
        console.log('Account IDs in checkbooks:', mappedCheckbooks.map(cb => cb.accountId));
        console.log('Available checkbooks:', availableCheckbooks.length);
        
        // Show which accounts have checkbooks
        console.log('\n📋 ACCOUNT-CHECKBOOK MAPPING:');
        mappedAccounts.forEach(acc => {
            const accountCheckbooks = mappedCheckbooks.filter(cb => cb.accountId === String(acc.id));
            console.log(`Account ${acc.id} (${acc.nombre}): ${accountCheckbooks.length} checkbooks`);
        });

    } catch (error) {
        console.error('❌ ERROR:', error);
    }
}

debugAPI();