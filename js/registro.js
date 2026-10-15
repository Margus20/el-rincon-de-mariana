/* ========================================
   SISTEMA DE REGISTRO - El Rincón de Mariana
   VERSIÓN FINAL CON VALIDACIONES
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
    
    // Generar código único
    const codigoQR = 'ERM-' + cedula + '-' + Date.now().toString(36).toUpperCase();
    
    const btnSubmit = document.getElementById('btn-registrar');
    const textoOriginal = btnSubmit.innerHTML;
    btnSubmit.innerHTML = '⏳ Registrando...';
    btnSubmit.disabled = true;
    
    try {
        // Guardar en Supabase
        const { data, error } = await supabaseClient
            .from('clientes')
            .insert([{
                cedula: cedula,
                nombre_y_apellido: nombre,
                telefono: telefono,
                deuda_actual: 0,
                puntos: 0,
                codigo_qr: codigoQR
            }]);
        
        if (error) throw error;
        
        mostrarResultado(codigoQR, nombre, cedula, telefono);
        
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al registrar: ' + error.message);
        btnSubmit.innerHTML = textoOriginal;
        btnSubmit.disabled = false;
    }
}

function mostrarResultado(codigoQR, nombre, cedula, telefono) {
    // Ocultar formulario y mostrar resultado
    const formulario = document.getElementById('formulario-registro');
    const resultado = document.getElementById('resultado-registro');
    
    if (formulario) formulario.style.display = 'none';
    if (resultado) resultado.style.display = 'block';
    
    // Generar imagen QR
    const qrURL = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${codigoQR}`;
    const qrImagen = document.getElementById('qr-imagen');
    if (qrImagen) {
        qrImagen.innerHTML = `<img src="${qrURL}" alt="QR" style="width: 250px; height: 250px;">`;
    }
    
    // Llenar datos
    const elNombre = document.getElementById('qr-cliente-nombre');
    const elCodigo = document.getElementById('qr-cliente-codigo');
    const elCedula = document.getElementById('qr-cliente-cedula');
    
    if (elNombre) elNombre.textContent = nombre;
    if (elCodigo) elCodigo.textContent = codigoQR;
    if (elCedula) elCedula.textContent = cedula;
    
    // Botón 1: Descargar QR (imagen)
    const btnDescargar = document.getElementById('btn-descargar-qr');
    if (btnDescargar) {
        btnDescargar.href = qrURL;
        btnDescargar.download = `QR-${cedula}.png`;
    }
    
    // Botón 2: Descargar Tarjeta PDF (va a la página de generación)
    const btnPDF = document.getElementById('btn-descargar-tarjeta');
    if (btnPDF) {
        const urlGenerar = `generar-tarjeta.html?nombre=${encodeURIComponent(nombre)}&cedula=${encodeURIComponent(cedula)}&telefono=${encodeURIComponent(telefono)}&qr=${encodeURIComponent(codigoQR)}`;
        btnPDF.href = urlGenerar;
    }
    
    // Botón 3: WhatsApp (avisa a Mariana)
    const btnWhatsApp = document.getElementById('btn-whatsapp-qr');
    if (btnWhatsApp) {
        const numeroMariana = '584129354244';
        const mensaje = `Hola Mariana, soy *${nombre}* (Cédula: ${cedula}). Me acabo de registrar en la página web. Mi código es ${codigoQR}. Quedo atento.`;
        btnWhatsApp.href = `https://wa.me/${numeroMariana}?text=${encodeURIComponent(mensaje)}`;
    }
    
    console.log('✅ Registrado:', codigoQR);
}
