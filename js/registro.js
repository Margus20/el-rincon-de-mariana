/* ========================================
   SISTEMA DE REGISTRO DE CLIENTES
   El Rincón de Mariana
   ======================================== */

document.addEventListener('DOMContentLoaded', function() {
    const formulario = document.getElementById('formulario-registro');
    
    if (formulario) {
        formulario.addEventListener('submit', registrarCliente);
    }
});

async function registrarCliente(evento) {
    evento.preventDefault();
    
    // Obtener los valores del formulario
    const cedula = document.getElementById('cedula').value.trim();
    const nombre = document.getElementById('nombre').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    
    // Validar que no estén vacíos
    if (!cedula || !nombre || !telefono) {
        alert('⚠️ Por favor completa todos los campos');
        return;
    }
    
    // Generar el código QR único
    const codigoQR = 'ERM-' + cedula + '-' + Date.now().toString(36).toUpperCase();
    
    // Mostrar mensaje de carga
    const btnSubmit = document.getElementById('btn-registrar');
    btnSubmit.textContent = '⏳ Registrando...';
    btnSubmit.disabled = true;
    
    try {
        // 1. Guardar el cliente en la base de datos
        const { data, error } = await supabase
            .from('clientes')
            .insert([
                {
                    cedula: cedula,
                    nombre_y_apellido: nombre,
                    telefono: telefono,
                    deuda_actual: 0,
                    puntos: 0,
                    codigo_qr: codigoQR
                }
            ]);
        
        if (error) {
            throw error;
        }
        
        // 2. Mostrar el código QR al cliente
        mostrarQR(codigoQR, nombre, cedula);
        
    } catch (error) {
        console.error('Error al registrar:', error);
        alert('❌ Error al registrar: ' + error.message);
        btnSubmit.textContent = ' Registrarme';
        btnSubmit.disabled = false;
    }
}

function mostrarQR(codigoQR, nombre, cedula) {
    // Ocultar el formulario
    const formulario = document.getElementById('formulario-registro');
    formulario.style.display = 'none';
    
    // Mostrar la sección de resultado
    const resultado = document.getElementById('resultado-registro');
    resultado.style.display = 'block';
    
    // Generar el QR visual
    const qrContainer = document.getElementById('qr-imagen');
    const qrURL = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${codigoQR}`;
    qrContainer.innerHTML = `<img src="${qrURL}" alt="Código QR" style="width: 250px; height: 250px;">`;
    
    // Mostrar los datos
    document.getElementById('qr-cliente-nombre').textContent = nombre;
    document.getElementById('qr-cliente-codigo').textContent = codigoQR;
    document.getElementById('qr-cliente-cedula').textContent = cedula;
    
    // Configurar el botón de descarga
    const btnDescargar = document.getElementById('btn-descargar-qr');
    btnDescargar.href = qrURL;
    btnDescargar.download = `QR-ElRincon-${cedula}.png`;
    
    // Configurar el botón de WhatsApp
    const btnWhatsApp = document.getElementById('btn-whatsapp-qr');
    const mensaje = `¡Hola! Soy ${nombre} (Cédula: ${cedula}). Acabo de registrarme en El Rincón de Mariana. Mi código QR es: ${codigoQR}`;
    btnWhatsApp.href = `https://wa.me/584129354244?text=${encodeURIComponent(mensaje)}`;
    
    console.log('✅ Cliente registrado: ' + codigoQR);
}

// Función para consultar el estado del cliente (para el futuro)
async function consultarCliente(codigoQR) {
    const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('codigo_qr', codigoQR)
        .single();
    
    if (error) {
        console.error('Error al consultar:', error);
        return null;
    }
    
    return data;
}
