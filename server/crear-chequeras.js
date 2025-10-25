const http = require('http');

function makePostRequest(path, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

async function crearChequerasFaltantes() {
  try {
    console.log('🏦 CREANDO CHEQUERAS PARA CUENTAS SIN CHEQUERA...\n');
    
    const result = await makePostRequest('/api/crear-chequeras-faltantes', {});
    
    console.log(`Status: ${result.status}`);
    console.log('Respuesta:', JSON.stringify(result.data, null, 2));
    
    if (result.status === 200) {
      console.log('\n✅ ¡Chequeras creadas exitosamente!');
    } else {
      console.log('\n❌ Error al crear chequeras');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

crearChequerasFaltantes();