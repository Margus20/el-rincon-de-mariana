/* ========================================
   SISTEMA DE REGISTRO - El Rincón de Mariana
   VERSIÓN FINAL: PDF automático sin formulario
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
    
    const btnSubmit = document.getElementById('btn-registrar');
    const textoOriginal = btnSubmit.innerHTML;
    btnSubmit.innerHTML = '⏳ Buscando cliente...';
    btnSubmit.disabled = true;
    
    try {
        // Buscar si el cliente ya existe
        const { data: clientesEncontrados, error: errorBusqueda } = await supabaseClient
            .from('clientes')
            .select('codigo_qr, nombre_y_apellido, telefono, puntos, deuda_actual')
            .eq('cedula', cedula)
            .limit(1);
        
        if (errorBusqueda) throw errorBusqueda;
        
        let codigoQR;
        let esClienteNuevo = false;
        let puntosActuales = 0;
        
        if (clientesEncontrados && clientesEncontrados.length > 0) {
            const cliente = clientesEncontrados[0];
            codigoQR = cliente.codigo_qr;
            puntosActuales = cliente.puntos || 0;
        } else {
            codigoQR = 'ERM-' + cedula + '-' + Date.now().toString(36).toUpperCase();
            esClienteNuevo = true;
            
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
        }
        
        // Generar PDF automáticamente
        await generarPDFAutomatico(nombre, cedula, telefono, codigoQR);
        
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al registrar: ' + error.message);
        btnSubmit.innerHTML = textoOriginal;
        btnSubmit.disabled = false;
    }
}

async function generarPDFAutomatico(nombre, cedula, telefono, codigoQR) {
    // Crear contenido del PDF dinámicamente
    const pdfContent = document.createElement('div');
    pdfContent.id = 'pdf-generado';
    pdfContent.style.cssText = `
        position: fixed;
        left: -9999px;
        top: 0;
        width: 210mm;
        min-height: 297mm;
        padding: 15mm;
        background: white;
        color: #333;
        font-family: Arial, sans-serif;
    `;
    
    pdfContent.innerHTML = `
        <div style="text-align: center; border-bottom: 3px solid #E67E22; padding-bottom: 15px; margin-bottom: 25px;">
            <img src="https://i.postimg.cc/BnVpksfg/1000405763-removebg-preview.png" style="width: 60px; height: 60px; object-fit: contain;">
            <h2 style="color: #E67E22; font-size: 24pt; margin: 10px 0 5px 0;">El Rincón de Mariana</h2>
            <p style="color: #666; font-size: 12pt; font-style: italic; margin: 0;">¡El sabor que provoca!</p>
        </div>

        <div style="margin-bottom: 30px;">
            <h3 style="color: #5D4037; font-size: 16pt; margin-bottom: 15px; border-left: 4px solid #E67E22; padding-left: 10px;">📋 Tarjeta de Fidelidad - Instrucciones de Uso</h3>
            <ul style="margin-left: 25px; font-size: 11pt; line-height: 1.8;">
                <li style="margin-bottom: 8px;"><strong style="color: #E67E22;">Imprime</strong> esta hoja en papel grueso o cartulina para mejor durabilidad.</li>
                <li style="margin-bottom: 8px;"><strong style="color: #E67E22;">Recorta</strong> la tarjeta por la línea punteada con tijeras.</li>
                <li style="margin-bottom: 8px;"><strong style="color: #E67E22;">Plastifica</strong> la tarjeta (lamina fría o caliente) para protegerla del desgaste y manchas.</li>
                <li style="margin-bottom: 8px;"><strong style="color: #E67E22;">Presenta</strong> esta tarjeta cada vez que visites El Rincón de Mariana.</li>
                <li style="margin-bottom: 8px;">El personal escaneará tu código QR para registrar tu visita.</li>
                <li style="margin-bottom: 8px;">Debes consumir <strong style="color: #E67E22;">$10 o más</strong> por visita para que cuente como válida.</li>
                <li style="margin-bottom: 8px;">Al completar <strong style="color: #E67E22;">5 visitas válidas</strong>, tu <strong style="color: #E67E22;">6ta visita es GRATIS</strong> (hasta $10 de consumo).</li>
                <li style="margin-bottom: 8px;">Si tu consumo es mayor a $10, solo pagas la diferencia.</li>
                <li style="margin-bottom: 8px;">Si pierdes tu tarjeta, escríbenos al WhatsApp <strong style="color: #E67E22;">0412-9354244</strong> con tu cédula para reponerla.</li>
            </ul>
        </div>

        <div style="border: 2px dashed #999; padding: 25px; position: relative; margin-top: 40px; text-align: center; background: #f9f9f9;">
            <div style="position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: #f9f9f9; padding: 0 15px; color: #999; font-weight: bold; font-size: 10pt;">✂ RECORTAR POR LA LÍNEA PUNTEADA ✂</div>
            
            <div style="width: 100mm; height: 60mm; border: 2px solid #333; border-radius: 8px; margin: 0 auto; display: flex; overflow: hidden; background: linear-gradient(135deg, #FFF8E7 0%, #F5E6D3 100%); box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
                <div style="flex: 0 0 40mm; padding: 10px; display: flex; flex-direction: column; justify-content: center; align-items: center; border-right: 1px solid #ddd; background: #fff;">
                    <img src="https://i.postimg.cc/BnVpksfg/1000405763-removebg-preview.png" style="width: 32mm; height: 32mm; object-fit: contain;">
                    <h4 style="margin: 5px 0 0; color: #E67E22; font-size: 10pt; text-align: center; line-height: 1.2;">El Rincón de Mariana</h4>
                </div>
                <div style="flex: 1; padding: 12px; display: flex; flex-direction: column; justify-content: space-between;">
                    <div style="font-size: 9pt; color: #333; line-height: 1.6;">
                        <p style="margin: 3px 0;"><strong style="color: #E67E22;">Cliente:</strong> ${nombre}</p>
                        <p style="margin: 3px 0;"><strong style="color: #E67E22;">Cédula:</strong> ${cedula}</p>
                        <p style="margin: 3px 0;"><strong style="color: #E67E22;">Código:</strong> <span style="font-family: monospace; font-size: 8pt;">${codigoQR}</span></p>
                    </div>
                    <div style="width: 25mm; height: 25mm; background: white; padding: 2mm; border-radius: 3px; align-self: center; margin: 5px 0;">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${codigoQR}" style="width: 100%; height: 100%;">
                    </div>
                    <div style="background: #E67E22; color: white; text-align: center; padding: 5px; border-radius: 4px; font-size: 9pt; font-weight: bold;">5 VISITAS = 6ta GRATIS</div>
                </div>
            </div>
        </div>

        <div style="margin-top: 30px; text-align: center; font-size: 9pt; color: #999; border-top: 1px solid #ddd; padding-top: 10px;">
            <p>El Rincón de Mariana | WhatsApp: 0412-9354244 | Instagram: @elrincondemariana.ve</p>
            <p>Guatire, Edo. Miranda, Venezuela</p>
        </div>
    `;
    
    document.body.appendChild(pdfContent);
    
    await new Promise(r => setTimeout(r, 1500));
    
    try {
        const canvas = await html2canvas(pdfContent, { 
            scale: 2, 
            useCORS: true,
            logging: false
        });
        
        const imgData = canvas.toDataURL('image/png');
        
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'letter');
        pdf.addImage(imgData, 'PNG', 0, 0, 216, 279);
        
        pdf.save(`Tarjeta-Fidelidad-${cedula}.pdf`);
        
        alert('✅ ¡PDF generado exitosamente! Revisa tu carpeta de descargas.');
        
    } catch (error) {
        console.error('Error al generar PDF:', error);
        alert('❌ Error al generar el PDF: ' + error.message);
    } finally {
        document.body.removeChild(pdfContent);
    }
}
