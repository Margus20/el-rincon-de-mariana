/* ========================================
   SISTEMA DE REGISTRO - El Rincón de Mariana
   VERSIÓN FINAL: QR único por cédula
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
    btnSubmit.innerHTML = ' Buscando cliente...';
    btnSubmit.disabled = true;
    
    try {
        // PASO 1: Buscar si el cliente ya existe por cédula
        const { data: clienteExistente, error: errorBusqueda } = await supabaseClient
            .from('clientes')
            .select('codigo_qr, nombre_y_apellido, telefono, puntos, deuda_actual')
            .eq('cedula', cedula)
            .maybeSingle();
        
        if (errorBusqueda) throw errorBusqueda;
        
        let codigoQR;
        let esClienteNuevo = false;
        let puntosActuales = 0;
        
        if (clienteExistente) {
            // ✅ Cliente ya existe - usar su QR existente (mantiene sus puntos)
            codigoQR = clienteExistente.codigo_qr;
            puntosActuales = clienteExistente.puntos || 0;
            console.log('✅ Cliente existente encontrado:', codigoQR);
        } else {
            //  Cliente nuevo - generar QR único
            codigoQR = 'ERM-' + cedula + '-' + Date.now().toString(36).toUpperCase();
            esClienteNuevo = true;
            
            // Guardar nuevo cliente en la base de datos
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
        
        mostrarResultado(codigoQR, nombre, cedula, telefono, esClienteNuevo, puntosActuales);
        
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al registrar: ' + error.message);
        btnSubmit.innerHTML = textoOriginal;
        btnSubmit.disabled = false;
    }
}

function mostrarResultado(codigoQR, nombre, cedula, telefono, esClienteNuevo, puntos) {
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
    
    // Botón único: Descargar Tarjeta PDF
    const btnPDF = document.getElementById('btn-descargar-tarjeta');
    if (btnPDF) {
        const urlGenerar = `generar-tarjeta.html?nombre=${encodeURIComponent(nombre)}&cedula=${encodeURIComponent(cedula)}&telefono=${encodeURIComponent(telefono)}&qr=${encodeURIComponent(codigoQR)}&puntos=${puntos}&nuevo=${esClienteNuevo}`;
        btnPDF.href = urlGenerar;
    }
    
    console.log('✅ Registro completado:', codigoQR, esClienteNuevo ? '(NUEVO)' : '(EXISTENTE)');
}
