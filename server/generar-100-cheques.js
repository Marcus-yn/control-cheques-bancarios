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

// Estados posibles de cheques
const estados = ['pendiente', 'emitido', 'cobrado', 'cancelado'];

// Beneficiarios de ejemplo
const beneficiarios = [
    'Proveedor ABC S.A.', 'Servicios XYZ Ltda.', 'Juan Pérez', 'María González',
    'Empresa DEF S.A.', 'Comercial 123', 'Suministros Técnicos', 'Distribuidora Central',
    'Consultores Modernos', 'Tecnología Avanzada', 'Grupo Empresarial', 'Inversiones Globales',
    'Soluciones Integrales', 'Desarrollo Comercial', 'Servicios Profesionales', 'Compañía Industrial',
    'Sebastian Rodriguez', 'Ana Sofia Mendez', 'Carlos Eduardo Morales', 'Lucia Fernanda Castro',
    'Roberto Antonio Silva', 'Patricia Isabel Herrera', 'Diego Alejandro Ruiz', 'Valentina Gabriela Torres',
    'Alejandro Jose Martinez', 'Isabella Maria Vargas'
];

// Conceptos de ejemplo
const conceptos = [
    'Pago servicios', 'Compra mercadería', 'Pago honorarios', 'Reembolso gastos',
    'Pago proveedores', 'Servicios profesionales', 'Compra equipos', 'Pago nómina',
    'Mantenimiento', 'Alquiler oficina', 'Servicios públicos', 'Transporte',
    'Papelería y útiles', 'Combustible', 'Seguros', 'Impuestos',
    'Publicidad', 'Capacitación', 'Viáticos', 'Reparaciones'
];

function obtenerFechaAleatoria() {
    const inicio = new Date('2025-10-01');
    const fin = new Date('2025-10-24');
    const fecha = new Date(inicio.getTime() + Math.random() * (fin.getTime() - inicio.getTime()));
    return fecha.toISOString().split('T')[0];
}

function obtenerMontoAleatorio() {
    return Math.round((Math.random() * 5000 + 100) * 100) / 100; // Entre 100 y 5100
}

async function generarChequesPrueba() {
    try {
        await sql.connect(config);
        console.log('💳 GENERANDO 100 CHEQUES DE PRUEBA...');
        console.log('='.repeat(50));
        
        // Obtener todas las chequeras disponibles
        const chequeras = await sql.query(`
            SELECT ch.*, c.nombre as cuenta_nombre, c.banco, c.moneda
            FROM Chequeras ch
            JOIN CuentasBancarias c ON ch.cuenta_id = c.id
            WHERE ch.activa = 1
            ORDER BY ch.id
        `);
        
        const listaChequeras = chequeras.recordset;
        console.log(`📊 Chequeras disponibles: ${listaChequeras.length}`);
        
        let chequesCreados = 0;
        let estadisticas = {
            'pendiente': 0,
            'emitido': 0,
            'cobrado': 0,
            'cancelado': 0
        };
        
        // Distribuir cheques: 25 pendientes, 25 emitidos, 25 cobrados, 25 cancelados
        const distribucion = [
            ...Array(25).fill('pendiente'),
            ...Array(25).fill('emitido'),
            ...Array(25).fill('cobrado'),
            ...Array(25).fill('cancelado')
        ];
        
        // Mezclar la distribución
        for (let i = distribucion.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [distribucion[i], distribucion[j]] = [distribucion[j], distribucion[i]];
        }
        
        for (let i = 0; i < 100; i++) {
            // Seleccionar chequera aleatoria
            const chequera = listaChequeras[Math.floor(Math.random() * listaChequeras.length)];
            
            // Obtener el siguiente número disponible para esta chequera
            const numeroResult = await sql.query(`
                SELECT siguiente_numero FROM Chequeras WHERE id = ${chequera.id}
            `);
            
            let numeroASignar = numeroResult.recordset[0].siguiente_numero;
            
            // Verificar que no excedamos el rango de la chequera
            if (numeroASignar > chequera.numero_final) {
                // Si esta chequera está llena, buscar otra con espacio
                let chequeraConEspacio = null;
                for (const ch of listaChequeras) {
                    const numResult = await sql.query(`SELECT siguiente_numero FROM Chequeras WHERE id = ${ch.id}`);
                    if (numResult.recordset[0].siguiente_numero <= ch.numero_final) {
                        chequeraConEspacio = ch;
                        numeroASignar = numResult.recordset[0].siguiente_numero;
                        break;
                    }
                }
                
                if (!chequeraConEspacio) {
                    console.log('⚠️ No hay más espacio en las chequeras');
                    break;
                }
                chequera.id = chequeraConEspacio.id;
                chequera.cuenta_id = chequeraConEspacio.cuenta_id;
            }
            
            const beneficiario = beneficiarios[Math.floor(Math.random() * beneficiarios.length)];
            const concepto = conceptos[Math.floor(Math.random() * conceptos.length)];
            const monto = obtenerMontoAleatorio();
            const fecha = obtenerFechaAleatoria();
            const estado = distribucion[i];
            
            // Insertar el cheque
            await sql.query(`
                INSERT INTO Cheques (
                    numero, chequera_id, cuenta_id, fecha, 
                    beneficiario, monto, concepto, estado
                ) VALUES (
                    ${numeroASignar}, ${chequera.id}, ${chequera.cuenta_id}, 
                    '${fecha}', '${beneficiario}', ${monto}, '${concepto}', '${estado}'
                )
            `);
            
            // Actualizar el siguiente número en la chequera
            await sql.query(`
                UPDATE Chequeras 
                SET siguiente_numero = ${numeroASignar + 1}
                WHERE id = ${chequera.id}
            `);
            
            chequesCreados++;
            estadisticas[estado]++;
            
            if (chequesCreados % 20 === 0) {
                console.log(`📝 Creados ${chequesCreados} cheques...`);
            }
        }
        
        console.log('='.repeat(50));
        console.log('✅ PROCESO COMPLETADO');
        console.log(`📊 Total cheques creados: ${chequesCreados}`);
        console.log('\n📈 DISTRIBUCIÓN POR ESTADO:');
        for (const [estado, cantidad] of Object.entries(estadisticas)) {
            const emoji = {
                'pendiente': '⏳',
                'emitido': '📄',
                'cobrado': '✅',
                'cancelado': '❌'
            }[estado];
            console.log(`   ${emoji} ${estado.toUpperCase()}: ${cantidad} cheques`);
        }
        
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await sql.close();
    }
}

generarChequesPrueba();