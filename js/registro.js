/* ========================================
   SISTEMA DE REGISTRO - El Rincón de Mariana
   VERSIÓN FINAL: Abre certificado en nueva pestaña
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
    
    const btnSubmit = document.getElementById('btn-registrar');
    const textoOriginal = btnSubmit.innerHTML;
    btnSubmit.innerHTML = ' Generando Certificado...';
    btnSubmit.disabled = true;
    
    try {
        // Buscar si el cliente ya existe (QR anclado a cédula)
        const { data: clientesEncontrados, error: errorBusqueda } = await supabaseClient
            .from('clientes')
            .select('codigo_qr, puntos')
            .eq('cedula', cedula)
            .limit(1);
        
        if (errorBusqueda) throw errorBusqueda;
        
        let codigoQR;
        
        if (clientesEncontrados && clientesEncontrados.length > 0) {
            // Cliente existente - usar el mismo QR
            codigoQR = clientesEncontrados[0].codigo_qr;
            console.log('✅ Cliente existente, QR mantenido:', codigoQR);
        } else {
            // Cliente nuevo - generar QR único
            codigoQR = 'ERM-' + cedula + '-' + Date.now().toString(36).toUpperCase();
            const { error: errorInsert } = await supabaseClient
                .from('clientes')
                .insert([{
                    cedula: cedula,
                    nombre_y_apellido: nombre,
                    telefono: telefono,
                    deuda_actual: 0,
                    puntos: 0,
                    codigo_qr: codigoQR
                }]);
            if (errorInsert) throw errorInsert;
            console.log('✅ Cliente nuevo registrado:', codigoQR);
        }
        
        // Mostrar mensaje de éxito en la página actual
        document.getElementById('formulario-registro').style.display = 'none';
        const resultado = document.getElementById('resultado-registro');
        resultado.style.display = 'block';
        
        document.getElementById('qr-cliente-nombre').textContent = nombre;
        document.getElementById('qr-cliente-codigo').textContent = codigoQR;
        document.getElementById('qr-cliente-cedula').textContent = cedula;
        
        const qrURL = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${codigoQR}`;
        document.getElementById('qr-imagen').innerHTML = `<img src="${qrURL}" style="width: 200px; height: 200px;">`;
        
        // URL del certificado con TODOS los parámetros (incluido teléfono)
        const urlCert = `certificado.html?nombre=${encodeURIComponent(nombre)}&cedula=${encodeURIComponent(cedula)}&telefono=${encodeURIComponent(telefono)}&qr=${encodeURIComponent(codigoQR)}`;
        
        // Configurar botón para abrir certificado manualmente
        const btnCertificado = document.getElementById('btn-ver-certificado');
        if (btnCertificado) {
            btnCertificado.href = urlCert;
        }
        
        // Abrir automáticamente el certificado en nueva pestaña
        window.open(urlCert, '_blank');
        
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al registrar: ' + error.message);
        btnSubmit.innerHTML = textoOriginal;
        btnSubmit.disabled = false;
    }
}
