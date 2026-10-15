/* ========================================
   SISTEMA DE REGISTRO - El Rincón de Mariana
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
        alert('️ Por favor completa todos los campos');
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
    document.getElementById('formulario-registro').style.display = 'none';
    const resultado = document.getElementById('resultado-registro');
    resultado.style.display = 'block';
    
    // Generar imagen QR
    const qrURL = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${codigoQR}`;
    document.getElementById('qr-imagen').innerHTML = `<img src="${qrURL}" alt="QR" style="width: 250px; height: 250px;">`;
    
    document.getElementById('qr-cliente-nombre').textContent = nombre;
    document.getElementById('qr-cliente-codigo').textContent = codigoQR;
    document.getElementById('qr-cliente-cedula').textContent = cedula;
    
    // 1. Botón Descargar QR (Imagen)
    const btnDescargar = document.getElementById('btn-descargar-qr');
    btnDescargar.href = qrURL;
    btnDescargar.download = `QR-${cedula}.png`;
    
    // 2. Botón Descargar Tarjeta PDF (Va a la página de generación)
    const btnPDF = document.getElementById('btn-descargar-tarjeta');
    // Pasamos los datos por URL para que aparezcan escritos en el formulario de la otra página
    btnPDF.href = `generar-tarjeta.html?nombre=${encodeURIComponent(nombre)}&cedula=${encodeURIComponent(cedula)}&telefono=${encodeURIComponent(telefono)}&qr=${encodeURIComponent(codigoQR)}`;
    
    // 3. Botón WhatsApp (AHORA VA AL NÚMERO DE MARIANA)
    const btnWhatsApp = document.getElementById('btn-whatsapp-qr');
    const numeroMariana = '584129354244'; // Número de Mariana
    const mensaje = `Hola Mariana, soy *${nombre}* (Cédula: ${cedula}). Me acabo de registrar en la página web. Mi código es ${codigoQR}. Quedo atento.`;
    btnWhatsApp.href = `https://wa.me/${numeroMariana}?text=${encodeURIComponent(mensaje)}`;
    
    console.log('✅ Registrado:', codigoQR);
}
