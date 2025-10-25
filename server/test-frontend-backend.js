const http = require('http');

function testEndpoint(url, name) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          console.log(`\n=== ${name} ===`);
          console.log(`Status: ${res.statusCode}`);
          console.log(`Content-Type: ${res.headers['content-type']}`);
          console.log(`Data Type: ${Array.isArray(jsonData) ? 'Array' : typeof jsonData}`);
          console.log(`Length/Keys: ${Array.isArray(jsonData) ? jsonData.length : Object.keys(jsonData).length}`);
          if (Array.isArray(jsonData) && jsonData.length > 0) {
            console.log('Sample item:', JSON.stringify(jsonData[0], null, 2));
          }
          resolve(jsonData);
        } catch (e) {
          console.log(`\n=== ${name} (ERROR) ===`);
          console.log('Raw response:', data);
          resolve(null);
        }
      });
    }).on('error', (err) => {
      console.log(`\n=== ${name} (NETWORK ERROR) ===`);
      console.log('Error:', err.message);
      resolve(null);
    });
  });
}

async function testAPI() {
  console.log('🔍 PROBANDO COMUNICACIÓN FRONTEND-BACKEND...\n');
  
  await testEndpoint('http://localhost:3001/api/cuentas', 'Cuentas');
  await testEndpoint('http://localhost:3001/api/chequeras', 'Chequeras');
  await testEndpoint('http://localhost:3001/api/cheques', 'Cheques');
  await testEndpoint('http://localhost:3001/api/beneficiarios', 'Beneficiarios');
  
  console.log('\n✅ Pruebas completadas');
}

testAPI();