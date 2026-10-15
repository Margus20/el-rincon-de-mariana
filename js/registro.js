/* ========================================
   SISTEMA DE REGISTRO - El Rincón de Mariana
   GENERA IMAGEN PNG DE ALTA CALIDAD
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
    btnSubmit.innerHTML = '⏳ Generando Certificado...';
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
        
        // Generar IMAGEN PNG
        const imagenURL = await generarImagenCertificado(nombre, cedula, codigoQR);
        
        // Mostrar resultado en web
        document.getElementById('formulario-registro').style.display = 'none';
        const resultado = document.getElementById('resultado-registro');
        resultado.style.display = 'block';
        
        document.getElementById('qr-cliente-nombre').textContent = nombre;
        document.getElementById('qr-cliente-codigo').textContent = codigoQR;
        document.getElementById('qr-cliente-cedula').textContent = cedula;
        
        const qrURL = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${codigoQR}`;
        document.getElementById('qr-imagen').innerHTML = `<img src="${qrURL}" style="width: 200px; height: 200px;">`;
        
        // Mostrar botón para descargar la imagen
        const btnDescargar = document.getElementById('btn-descargar-imagen');
        if (btnDescargar) {
            btnDescargar.href = imagenURL;
            btnDescargar.download = `Certificado-${cedula}.png`;
        }

    } catch (error) {
        alert('❌ Error: ' + error.message);
        btnSubmit.innerHTML = textoOriginal;
        btnSubmit.disabled = false;
    }
}

async function generarImagenCertificado(nombre, cedula, codigoQR) {
    const certDiv = document.createElement('div');
    certDiv.id = 'certificado-imagen';
    
    // Dimensiones fijas: 1200px ancho x 1600px alto (proporción 3:4)
    certDiv.style.cssText = `
        position: fixed;
        left: -9999px;
        top: 0;
        width: 1200px;
        height: 1600px;
        padding: 60px;
        background: white;
        color: #333;
        font-family: 'Georgia', serif;
        box-sizing: border-box;
    `;

    const fechaHoy = new Date().toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric' });
    const numeroCert = 'ERM-' + cedula + '-' + Date.now().toString(36).toUpperCase().substring(0, 6);

    certDiv.innerHTML = `
        <!-- MARCO DOBLE -->
        <div style="border: 10px double #E67E22; padding: 30px; height: 100%; box-sizing: border-box; position: relative;">
            <div style="border: 3px solid #5D4037; padding: 25px; height: 100%; box-sizing: border-box; position: relative;">
                
                <!-- ESQUINAS -->
                <div style="position: absolute; top: 15px; left: 15px; width: 40px; height: 40px; border-top: 4px solid #E67E22; border-left: 4px solid #E67E22;"></div>
                <div style="position: absolute; top: 15px; right: 15px; width: 40px; height: 40px; border-top: 4px solid #E67E22; border-right: 4px solid #E67E22;"></div>
                <div style="position: absolute; bottom: 15px; left: 15px; width: 40px; height: 40px; border-bottom: 4px solid #E67E22; border-left: 4px solid #E67E22;"></div>
                <div style="position: absolute; bottom: 15px; right: 15px; width: 40px; height: 40px; border-bottom: 4px solid #E67E22; border-right: 4px solid #E67E22;"></div>

                <!-- ENCABEZADO -->
                <div style="text-align: center; border-bottom: 3px double #E67E22; padding-bottom: 20px; margin-bottom: 30px;">
                    <img src="https://i.postimg.cc/BnVpksfg/1000405763-removebg-preview.png" 
                         style="width: 120px; height: 120px; object-fit: contain; margin-bottom: 10px;">
                    <h1 style="color: #E67E22; font-size: 52px; margin: 10px 0; letter-spacing: 5px; text-transform: uppercase; font-weight: bold;">
                        El Rincón de Mariana
                    </h1>
                    <p style="font-style: italic; color: #666; font-size: 22px; margin: 5px 0; border-top: 2px solid #E67E22; border-bottom: 2px solid #E67E22; display: inline-block; padding: 5px 30px;">
                        ¡El sabor que provoca!
                    </p>
                </div>

                <!-- TÍTULO -->
                <div style="text-align: center; margin: 30px 0;">
                    <h2 style="color: #5D4037; font-size: 42px; letter-spacing: 8px; text-transform: uppercase; margin-bottom: 15px; font-weight: bold;">
                        Certificado de Membresía
                    </h2>
                    <div style="width: 300px; height: 3px; background: linear-gradient(to right, transparent, #E67E22, transparent); margin: 10px auto;"></div>
                    <p style="color: #999; font-size: 18px; margin-top: 10px; letter-spacing: 2px;">N° ${numeroCert}</p>
                </div>

                <!-- CUERPO -->
                <div style="text-align: justify; font-size: 20px; line-height: 1.7; margin: 30px 60px;">
                    <p style="margin-bottom: 20px; text-indent: 50px;">
                        Por medio del presente documento oficial, <strong style="color: #E67E22;">El Rincón de Mariana</strong>, 
                        establecimiento dedicado a la gastronomía, hace constar que el ciudadano(a):
                    </p>
                    
                    <div style="background: linear-gradient(135deg, #FFF8E7 0%, #F5E6D3 100%); 
                                border: 2px solid #E67E22; 
                                border-radius: 10px; 
                                padding: 25px; 
                                margin: 25px 0;
                                text-align: center;">
                        <h3 style="color: #5D4037; font-size: 38px; margin: 0 0 10px 0; letter-spacing: 2px;">
                            ${nombre.toUpperCase()}
                        </h3>
                        <p style="margin: 5px 0; font-size: 20px; color: #666;">
                            <strong>Cédula de Identidad:</strong> <span style="color: #E67E22; font-size: 24px; font-weight: bold;">${cedula}</span>
                        </p>
                    </div>

                    <p style="margin-bottom: 20px;">
                        Ha sido registrado(a) exitosamente en nuestro <strong style="color: #E67E22;">Programa de Fidelización Digital</strong>, 
                        quedando acreditado(a) como miembro oficial de nuestro club de beneficios.
                    </p>

                    <div style="background: #f9f9f9; border-left: 6px solid #E67E22; padding: 20px; margin: 25px 0;">
                        <h4 style="color: #5D4037; margin: 0 0 15px 0; font-size: 24px; border-bottom: 2px solid #E67E22; padding-bottom: 8px;">
                            📋 Beneficios del Programa:
                        </h4>
                        <ul style="margin: 0; padding-left: 30px; line-height: 2; font-size: 18px;">
                            <li>Acumule puntos por cada compra de <strong style="color: #E67E22;">$10 o más</strong></li>
                            <li>Al completar <strong style="color: #E67E22;">5 visitas válidas</strong>, su <strong style="color: #E67E22;">6ta visita es GRATIS</strong></li>
                            <li>Consumo máximo del beneficio: hasta <strong style="color: #E67E22;">$10</strong></li>
                            <li>Si su consumo excede $10, solo paga la diferencia</li>
                            <li>Acceso a promociones especiales para miembros</li>
                        </ul>
                    </div>

                    <p style="margin-bottom: 20px;">
                        Este certificado debe ser impreso, recortado por la línea punteada inferior y plastificado. 
                        El código QR es <strong>único, personal e intransferible</strong>, y está permanentemente 
                        asociado a su número de cédula de identidad.
                    </p>
                </div>

                <!-- FECHA Y FIRMA -->
                <div style="margin-top: 40px; margin-bottom: 40px;">
                    <div style="display: flex; justify-content: space-between; padding: 0 60px;">
                        <div style="text-align: center; width: 300px;">
                            <p style="border-top: 2px solid #5D4037; padding-top: 10px; font-size: 16px; color: #666;">
                                Guatire, ${fechaHoy}
                            </p>
                        </div>
                        <div style="text-align: center; width: 300px;">
                            <img src="https://i.postimg.cc/BnVpksfg/1000405763-removebg-preview.png" 
                                 style="width: 50px; height: 50px; object-fit: contain; opacity: 0.3;">
                            <p style="border-top: 2px solid #5D4037; padding-top: 10px; font-size: 16px; color: #666; margin-top: 5px;">
                                El Rincón de Mariana<br>Autorizado
                            </p>
                        </div>
                    </div>
                </div>

                <!-- LÍNEA DE CORTE -->
                <div style="border-top: 3px dashed #999; margin: 40px 0 25px 0; position: relative;">
                    <span style="position: absolute; top: -12px; left: 50%; transform: translateX(-50%); 
                                 background: white; padding: 0 20px; color: #999; font-size: 14px; font-weight: bold; letter-spacing: 2px;">
                        ✂ RECORTAR POR LA LÍNEA PUNTEADA ✂
                    </span>
                </div>

                <!-- CARNET -->
                <div style="display: flex; justify-content: center; margin-top: 25px;">
                    <div style="width: 500px; height: 280px; border: 3px solid #E67E22; border-radius: 15px; 
                                display: flex; overflow: hidden; 
                                background: linear-gradient(135deg, #FFF8E7 0%, #F5E6D3 50%, #fff 100%); 
                                box-shadow: 0 8px 20px rgba(230, 126, 34, 0.3);">
                        
                        <div style="flex: 0 0 40%; background: linear-gradient(135deg, #E67E22 0%, #D35400 100%); 
                                    display: flex; flex-direction: column; align-items: center; justify-content: center; 
                                    padding: 15px; border-right: 2px solid rgba(255,255,255,0.3);">
                            <img src="https://i.postimg.cc/BnVpksfg/1000405763-removebg-preview.png" 
                                 style="width: 120px; height: 120px; object-fit: contain; filter: brightness(0) invert(1);">
                            <h4 style="color: white; font-size: 20px; 
                                       text-align: center; margin-top: 10px; font-weight: bold;">
                                El Rincón<br>de Mariana
                            </h4>
                        </div>

                        <div style="flex: 1; padding: 20px; display: flex; flex-direction: column; justify-content: space-between;">
                            <div style="font-size: 16px; color: #333; line-height: 1.6;">
                                <p style="margin: 5px 0;">
                                    <strong style="color: #E67E22; font-size: 14px;">TITULAR:</strong><br>
                                    <span style="font-size: 20px; font-weight: bold;">${nombre}</span>
                                </p>
                                <p style="margin: 5px 0;">
                                    <strong style="color: #E67E22; font-size: 14px;">CÉDULA:</strong> ${cedula}
                                </p>
                                <p style="margin: 5px 0; font-family: monospace; font-size: 12px;">
                                    <strong style="color: #E67E22;">ID:</strong> ${codigoQR}
                                </p>
                            </div>
                            
                            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 10px;">
                                <div style="background: linear-gradient(135deg, #E67E22 0%, #D35400 100%); 
                                            color: white; padding: 8px 15px; border-radius: 8px; 
                                            font-size: 14px; font-weight: bold; text-align: center;">
                                    5 VISITAS<br>=<br>6ta GRATIS
                                </div>
                                <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${codigoQR}" 
                                     style="width: 120px; height: 120px; border: 1px solid #ddd; border-radius: 5px;">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- FOOTER -->
                <div style="text-align: center; font-size: 14px; color: #999; margin-top: 30px; 
                            border-top: 1px solid #ddd; padding-top: 15px;">
                    <p style="margin: 5px 0;">
                        <strong>El Rincón de Mariana</strong> | WhatsApp: 0412-9354244 / 0416-7017155
                    </p>
                    <p style="margin: 5px 0;">
                        Instagram: @elrincondemariana.ve | Guatire, Edo. Miranda, Venezuela
                    </p>
                    <p style="margin: 10px 0 0 0; font-style: italic; font-size: 12px;">
                        Documento generado electrónicamente - Válido sin enmiendas ni tachaduras
                    </p>
                </div>

            </div>
        </div>
    `;

    document.body.appendChild(certDiv);
    await new Promise(r => setTimeout(r, 2000));

    try {
        const canvas = await html2canvas(certDiv, { 
            scale: 1,
            useCORS: true, 
            logging: false,
            backgroundColor: '#ffffff',
            width: 1200,
            height: 1600
        });
        
        // Convertir a imagen PNG
        const imagenURL = canvas.toDataURL('image/png');
        
        document.body.removeChild(certDiv);
        
        return imagenURL;
        
    } catch (e) {
        console.error('Error:', e);
        document.body.removeChild(certDiv);
        throw e;
    }
}
