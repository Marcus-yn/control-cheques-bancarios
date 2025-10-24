const http = require('http');

function makePostRequest(path, data = {}) {
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
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
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

async function crearTodasLasChequeras() {
  try {
    console.log('🏦 CREANDO CHEQUERAS PARA TODAS LAS CUENTAS FALTANTES...\n');
    
    const result = await makePostRequest('/api/crear-chequeras-faltantes', {});
    
    console.log(`Status HTTP: ${result.status}`);
    console.log('Respuesta del servidor:');
    console.log(JSON.stringify(result.data, null, 2));
    
    if (result.status === 200) {
      console.log('\n✅ ¡Chequeras creadas exitosamente para todas las cuentas!');
      console.log(`🎉 Se crearon ${result.data.chequeras_creadas} chequeras nuevas`);
    } else {
      console.log('\n❌ Hubo un problema al crear las chequeras');
    }
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
}

crearTodasLasChequeras();