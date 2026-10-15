/* ========================================
   SISTEMA DE REGISTRO - El Rincón de Mariana
   CERTIFICADO OFICIAL - SIN DISTORSIÓN
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
    btnSubmit.innerHTML = '⏳ Generando Certificado Oficial...';
    btnSubmit.disabled = true;
    
    try {
        const { data: clientesEncontrados } = await supabaseClient
            .from('clientes')
            .select('codigo_qr, puntos')
            .eq('cedula', cedula)
            .limit(1);
        
        let codigoQR;
        
        if (clientesEncontrados && clientesEncontrados.length > 0) {
            codigoQR = clientesEncontrados[0].codigo_qr;
        } else {
            codigoQR = 'ERM-' + cedula + '-' + Date.now().toString(36).toUpperCase();
            await supabaseClient.from('clientes').insert([{
                cedula, nombre_y_apellido: nombre, telefono,
                deuda_actual: 0, puntos: 0, codigo_qr: codigoQR
            }]);
        }
        
        await generarCertificadoOficial(nombre, cedula, codigoQR);
        
        document.getElementById('formulario-registro').style.display = 'none';
        const resultado = document.getElementById('resultado-registro');
        resultado.style.display = 'block';
        
        document.getElementById('qr-cliente-nombre').textContent = nombre;
        document.getElementById('qr-cliente-codigo').textContent = codigoQR;
        document.getElementById('qr-cliente-cedula').textContent = cedula;
        
        const qrURL = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${codigoQR}`;
        document.getElementById('qr-imagen').innerHTML = `<img src="${qrURL}" style="width: 200px; height: 200px;">`;

    } catch (error) {
        alert(' Error: ' + error.message);
        btnSubmit.innerHTML = textoOriginal;
        btnSubmit.disabled = false;
    }
}

async function generarCertificadoOficial(nombre, cedula, codigoQR) {
    const pdfDiv = document.createElement('div');
    pdfDiv.id = 'certificado-oficial';
    
    // CLAVE: Usar dimensiones exactas en PÍXELES (no mm) para evitar distorsión
    // Hoja carta: 216mm x 279mm = 816px x 1056px (a 96 DPI)
    // Usamos scale 2, así que multiplicamos por 2
    const anchoPx = 1632;  // 816 * 2
    const altoPx = 2112;   // 1056 * 2
    
    pdfDiv.style.cssText = `
        position: fixed; 
        left: -9999px; 
        top: 0;
        width: ${anchoPx}px;
        height: ${altoPx}px;
        padding: 60px;
        background: white; 
        color: #333;
        font-family: 'Georgia', 'Times New Roman', serif;
        box-sizing: border-box;
    `;

    const fechaHoy = new Date().toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric' });
    const numeroCertificado = 'ERM-' + cedula + '-' + Date.now().toString(36).toUpperCase().substring(0, 6);

    pdfDiv.innerHTML = `
        <!-- MARCO EXTERIOR -->
        <div style="border: 12px double #E67E22; padding: 40px; height: 100%; box-sizing: border-box; position: relative;">
            
            <!-- MARCO INTERIOR -->
            <div style="border: 4px solid #5D4037; padding: 30px; height: 100%; box-sizing: border-box; position: relative;">
                
                <!-- ESQUINAS DECORATIVAS -->
                <div style="position: absolute; top: 20px; left: 20px; width: 60px; height: 60px; border-top: 5px solid #E67E22; border-left: 5px solid #E67E22;"></div>
                <div style="position: absolute; top: 20px; right: 20px; width: 60px; height: 60px; border-top: 5px solid #E67E22; border-right: 5px solid #E67E22;"></div>
                <div style="position: absolute; bottom: 20px; left: 20px; width: 60px; height: 60px; border-bottom: 5px solid #E67E22; border-left: 5px solid #E67E22;"></div>
                <div style="position: absolute; bottom: 20px; right: 20px; width: 60px; height: 60px; border-bottom: 5px solid #E67E22; border-right: 5px solid #E67E22;"></div>

                <!-- ENCABEZADO -->
                <div style="text-align: center; border-bottom: 4px double #E67E22; padding-bottom: 30px; margin-bottom: 40px;">
                    <img src="https://i.postimg.cc/BnVpksfg/1000405763-removebg-preview.png" 
                         style="width: 180px; height: 180px; object-fit: contain; margin-bottom: 20px;">
                    <h1 style="color: #E67E22; font-family: 'Georgia', serif; font-size: 72px; margin: 20px 0; letter-spacing: 8px; text-transform: uppercase; font-weight: bold;">
                        El Rincón de Mariana
                    </h1>
                    <p style="font-style: italic; color: #666; font-size: 32px; margin: 10px 0; border-top: 2px solid #E67E22; border-bottom: 2px solid #E67E22; display: inline-block; padding: 10px 40px;">
                        ¡El sabor que provoca!
                    </p>
                </div>

                <!-- TÍTULO -->
                <div style="text-align: center; margin: 50px 0;">
                    <h2 style="color: #5D4037; font-size: 56px; letter-spacing: 10px; text-transform: uppercase; margin-bottom: 20px; font-weight: bold;">
                        Certificado de Membresía
                    </h2>
                    <div style="width: 400px; height: 4px; background: linear-gradient(to right, transparent, #E67E22, transparent); margin: 20px auto;"></div>
                    <p style="color: #999; font-size: 24px; margin-top: 20px; letter-spacing: 3px;">N° ${numeroCertificado}</p>
                </div>

                <!-- CUERPO -->
                <div style="text-align: justify; font-size: 26px; line-height: 1.8; margin: 40px 80px;">
                    <p style="margin-bottom: 30px; text-indent: 80px;">
                        Por medio del presente documento oficial, <strong style="color: #E67E22;">El Rincón de Mariana</strong>, 
                        establecimiento dedicado a la gastronomía, hace constar que el ciudadano(a):
                    </p>
                    
                    <div style="background: linear-gradient(135deg, #FFF8E7 0%, #F5E6D3 100%); 
                                border: 3px solid #E67E22; 
                                border-radius: 15px; 
                                padding: 40px; 
                                margin: 40px 0;
                                text-align: center;">
                        <h3 style="color: #5D4037; font-size: 48px; margin: 0 0 20px 0; font-family: 'Georgia', serif; letter-spacing: 3px;">
                            ${nombre.toUpperCase()}
                        </h3>
                        <p style="margin: 10px 0; font-size: 26px; color: #666;">
                            <strong>Cédula de Identidad:</strong> <span style="color: #E67E22; font-size: 30px; font-weight: bold;">${cedula}</span>
                        </p>
                    </div>

                    <p style="margin-bottom: 30px;">
                        Ha sido registrado(a) exitosamente en nuestro <strong style="color: #E67E22;">Programa de Fidelización Digital</strong>, 
                        quedando acreditado(a) como miembro oficial de nuestro club de beneficios.
                    </p>

                    <div style="background: #f9f9f9; border-left: 8px solid #E67E22; padding: 30px; margin: 40px 0;">
                        <h4 style="color: #5D4037; margin: 0 0 25px 0; font-size: 30px; border-bottom: 3px solid #E67E22; padding-bottom: 15px;">
                            📋 Beneficios del Programa:
                        </h4>
                        <ul style="margin: 0; padding-left: 40px; line-height: 2.2; font-size: 24px;">
                            <li>Acumule puntos por cada compra de <strong style="color: #E67E22;">$10 o más</strong></li>
                            <li>Al completar <strong style="color: #E67E22;">5 visitas válidas</strong>, su <strong style="color: #E67E22;">6ta visita es GRATIS</strong></li>
                            <li>Consumo máximo del beneficio: hasta <strong style="color: #E67E22;">$10</strong></li>
                            <li>Si su consumo excede $10, solo paga la diferencia</li>
                            <li>Acceso a promociones especiales para miembros</li>
                        </ul>
                    </div>

                    <p style="margin-bottom: 30px;">
                        Este certificado debe ser impreso, recortado por la línea punteada inferior y plastificado. 
                        El código QR es <strong>único, personal e intransferible</strong>, y está permanentemente 
                        asociado a su número de cédula de identidad.
                    </p>
                </div>

                <!-- FECHA Y FIRMA -->
                <div style="margin-top: 60px; margin-bottom: 80px;">
                    <div style="display: flex; justify-content: space-between; padding: 0 80px;">
                        <div style="text-align: center; width: 400px;">
                            <p style="border-top: 3px solid #5D4037; padding-top: 15px; font-size: 22px; color: #666;">
                                Guatire, ${fechaHoy}
                            </p>
                        </div>
                        <div style="text-align: center; width: 400px;">
                            <img src="https://i.postimg.cc/BnVpksfg/1000405763-removebg-preview.png" 
                                 style="width: 80px; height: 80px; object-fit: contain; opacity: 0.3;">
                            <p style="border-top: 3px solid #5D4037; padding-top: 15px; font-size: 22px; color: #666; margin-top: 10px;">
                                El Rincón de Mariana<br>Autorizado
                            </p>
                        </div>
                    </div>
                </div>

                <!-- LÍNEA DE CORTE -->
                <div style="border-top: 4px dashed #999; margin: 60px 0 40px 0; position: relative;">
                    <span style="position: absolute; top: -20px; left: 50%; transform: translateX(-50%); 
                                 background: white; padding: 0 30px; color: #999; font-size: 20px; font-weight: bold; letter-spacing: 2px;">
                        ✂ RECORTAR POR LA LÍNEA PUNTEADA ✂
                    </span>
                </div>

                <!-- CARNET -->
                <div style="display: flex; justify-content: center; margin-top: 40px;">
                    <div style="width: 600px; height: 380px; border: 4px solid #E67E22; border-radius: 20px; 
                                display: flex; overflow: hidden; 
                                background: linear-gradient(135deg, #FFF8E7 0%, #F5E6D3 50%, #fff 100%); 
                                box-shadow: 0 10px 30px rgba(230, 126, 34, 0.3);">
                        
                        <div style="flex: 0 0 40%; background: linear-gradient(135deg, #E67E22 0%, #D35400 100%); 
                                    display: flex; flex-direction: column; align-items: center; justify-content: center; 
                                    padding: 20px; border-right: 3px solid rgba(255,255,255,0.3);">
                            <img src="https://i.postimg.cc/BnVpksfg/1000405763-removebg-preview.png" 
                                 style="width: 200px; height: 200px; object-fit: contain; filter: brightness(0) invert(1);">
                            <h4 style="color: white; font-family: 'Georgia', serif; font-size: 28px; 
                                       text-align: center; margin-top: 15px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                                El Rincón<br>de Mariana
                            </h4>
                        </div>

                        <div style="flex: 1; padding: 25px; display: flex; flex-direction: column; justify-content: space-between;">
                            <div style="font-size: 22px; color: #333; line-height: 1.6;">
                                <p style="margin: 8px 0;">
                                    <strong style="color: #E67E22; font-size: 18px;">TITULAR:</strong><br>
                                    <span style="font-size: 26px; font-weight: bold;">${nombre}</span>
                                </p>
                                <p style="margin: 8px 0;">
                                    <strong style="color: #E67E22; font-size: 18px;">CÉDULA:</strong> <span style="font-size: 24px;">${cedula}</span>
                                </p>
                                <p style="margin: 8px 0; font-family: monospace; font-size: 16px;">
                                    <strong style="color: #E67E22;">ID:</strong> ${codigoQR}
                                </p>
                            </div>
                            
                            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 15px;">
                                <div style="background: linear-gradient(135deg, #E67E22 0%, #D35400 100%); 
                                            color: white; padding: 12px 20px; border-radius: 10px; 
                                            font-size: 20px; font-weight: bold; text-align: center;">
                                    5 VISITAS<br>=<br>6ta GRATIS
                                </div>
                                <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${codigoQR}" 
                                     style="width: 180px; height: 180px; border: 2px solid #ddd; border-radius: 8px;">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- FOOTER -->
                <div style="text-align: center; font-size: 18px; color: #999; margin-top: 40px; 
                            border-top: 2px solid #ddd; padding-top: 20px;">
                    <p style="margin: 8px 0;">
                        <strong>El Rincón de Mariana</strong> | WhatsApp: 0412-9354244 / 0416-7017155
                    </p>
                    <p style="margin: 8px 0;">
                        Instagram: @elrincondemariana.ve | Guatire, Edo. Miranda, Venezuela
                    </p>
                    <p style="margin: 15px 0 0 0; font-style: italic; font-size: 16px;">
                        Documento generado electrónicamente - Válido sin enmiendas ni tachaduras
                    </p>
                </div>

            </div>
        </div>
    `;

    document.body.appendChild(pdfDiv);
    await new Promise(r => setTimeout(r, 2000));

    try {
        const canvas = await html2canvas(pdfDiv, { 
            scale: 1,  // CLAVE: scale 1 porque ya usamos píxeles grandes
            useCORS: true, 
            logging: false,
            backgroundColor: '#ffffff',
            width: anchoPx,
            height: altoPx
        });
        
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'letter');
        
        // Agregar imagen manteniendo proporciones exactas
        pdf.addImage(imgData, 'PNG', 0, 0, 216, 279);
        pdf.save(`Certificado-Oficial-${cedula}.pdf`);
        
        alert('✅ ¡Certificado Oficial generado y descargado!');
        
    } catch (e) {
        console.error('Error:', e);
        alert(' Error al generar certificado');
    } finally {
        document.body.removeChild(pdfDiv);
    }
}
