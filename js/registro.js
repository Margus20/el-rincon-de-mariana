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
    
    const cedula = document.getElementById('cedula').value.trim();
    const nombre = document.getElementById('nombre').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    
    if (!cedula || !nombre || !telefono) {
        alert('⚠️ Por favor completa todos los campos');
        return;
    }
    
    const codigoQR = 'ERM-' + cedula + '-' + Date.now().toString(36).toUpperCase();
    
    const btnSubmit = document.getElementById('btn-registrar');
    const textoOriginal = btnSubmit.innerHTML;
    btnSubmit.innerHTML = '⏳ Registrando...';
    btnSubmit.disabled = true;
    
    try {
        const { data, error } = await supabaseClient
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
        
        mostrarQR(codigoQR, nombre, cedula, telefono);
        
    } catch (error) {
        console.error('Error al registrar:', error);
        alert('❌ Error al registrar: ' + error.message);
        btnSubmit.innerHTML = textoOriginal;
        btnSubmit.disabled = false;
    }
}

function mostrarQR(codigoQR, nombre, cedula, telefono) {
    const formulario = document.getElementById('formulario-registro');
    formulario.style.display = 'none';
    
    const resultado = document.getElementById('resultado-registro');
    resultado.style.display = 'block';
    
    const qrContainer = document.getElementById('qr-imagen');
    const qrURL = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${codigoQR}`;
    qrContainer.innerHTML = `<img src="${qrURL}" alt="Código QR" style="width: 250px; height: 250px;">`;
    
    document.getElementById('qr-cliente-nombre').textContent = nombre;
    document.getElementById('qr-cliente-codigo').textContent = codigoQR;
    document.getElementById('qr-cliente-cedula').textContent = cedula;
    
    const btnDescargar = document.getElementById('btn-descargar-qr');
    btnDescargar.href = qrURL;
    btnDescargar.download = `QR-ElRincon-${cedula}.png`;
    
    const btnWhatsApp = document.getElementById('btn-whatsapp-qr');
    const mensaje = `¡Hola! Soy ${nombre} (Cédula: ${cedula}). Acabo de registrarme en El Rincón de Mariana. Mi código QR es: ${codigoQR}`;
    btnWhatsApp.href = `https://wa.me/584129354244?text=${encodeURIComponent(mensaje)}`;
    
    // AGREGAR: Botón para descargar tarjeta PDF
    const btnTarjetaPDF = document.getElementById('btn-descargar-tarjeta');
    if (btnTarjetaPDF) {
        btnTarjetaPDF.href = `generar-tarjeta.html?nombre=${encodeURIComponent(nombre)}&cedula=${encodeURIComponent(cedula)}&telefono=${encodeURIComponent(telefono)}&qr=${encodeURIComponent(codigoQR)}`;
    }
    
    console.log('✅ Cliente registrado: ' + codigoQR);
}
