alert("DIAGNÓSTICO: El JavaScript se está cargando correctamente");

const API_URL = "https://nwuqdmbqlpmiyxiqdxmc.supabase.co";
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53dXFkbWJxbHBtaXl4aXFkeG1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNjIzMDksImV4cCI6MjEwNzYzODMwOX0.3LVC7SwkHkDGRzdAzMMyHbwVi4m8bUFJwUizuRG15DE";
let userToken = "";
let clientesCache = [];
let html5QrCode = null;
let qrLibLoaded = false;

function mostrarError(txt) {
    const el = document.getElementById('errorMsg');
    if (el) { el.textContent = txt; el.style.display = 'block'; }
}

document.getElementById('btnEye').addEventListener('click', () => {
    const pwd = document.getElementById('password');
    pwd.type = pwd.type === 'password' ? 'text' : 'password';
    document.getElementById('btnEye').textContent = pwd.type === 'password' ? '👁️' : '🙈';
});

document.getElementById('btnLogin').addEventListener('click', async () => {
    const email = document.getElementById('email').value.trim().toLowerCase();
    const pass = document.getElementById('password').value.trim();
    const errDiv = document.getElementById('errorMsg');
    errDiv.style.display = 'none';

    if (!email || !pass) { mostrarError('Ingresa tu correo y contraseña.'); return; }

    const btn = document.getElementById('btnLogin');
    btn.disabled = true;
    btn.textContent = 'Verificando...';

    try {
        const res = await fetch(`${API_URL}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: { 'apikey': API_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, password: pass })
        });

        const data = await res.json();

        if (!res.ok) {
            mostrarError('Contraseña o correo incorrectos.');
            btn.disabled = false;
            btn.textContent = 'Ingresar al Panel';
            return;
        }

        userToken = data.access_token;
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('dashboardScreen').style.display = 'flex';
        document.getElementById('welcomeName').textContent = 'Hola, ' + email.split('@')[0];
        
        await cargarClientesCache();

    } catch (e) {
        mostrarError('Error de red al conectar.');
        btn.disabled = false;
        btn.textContent = 'Ingresar al Panel';
    }
});

document.getElementById('btnLogout').addEventListener('click', () => {
    location.reload();
});

function volverMenu() {
    document.getElementById('homeMenu').style.display = 'flex';
    document.getElementById('clientsView').style.display = 'none';
    document.getElementById('visitsView').style.display = 'none';
    document.getElementById('transactionsView').style.display = 'none';
    document.getElementById('searchView').style.display = 'none';
    document.getElementById('scannerView').style.display = 'none';
    if (html5QrCode) { detenerCamara(); }
}

document.querySelectorAll('.btnVolver').forEach(b => b.addEventListener('click', volverMenu));

function linkWA(telRaw, nombre, deuda) {
    if (!telRaw || telRaw === 'Sin teléfono') return '#';
    let tel = telRaw.replace(/\D/g, '');
    if (!tel.startsWith('58') && tel.length === 10) tel = '58' + tel;
    let msg = deuda > 0 
        ? `Hola ${nombre}, te saludamos de El Rincón de Mariana. Te recordamos que tienes un saldo pendiente de $${deuda.toFixed(2)}.`
        : `Hola ${nombre}, te saludamos de El Rincón de Mariana. Tu cuenta está totalmente al día. ¡Gracias!`;
    return `https://wa.me/${tel}?text=${encodeURIComponent(msg)}`;
}

async function cargarClientesCache() {
    try {
        const res = await fetch(`${API_URL}/rest/v1/clientes?select=id,nombre_y_apellido,nombre,cedula`, {
            headers: { 'apikey': API_KEY, 'Authorization': `Bearer ${userToken}` }
        });
        const data = await res.json();
        clientesCache = data || [];
        llenarSelectores();
    } catch (e) { console.error("Error cargando clientes", e); }
}

function llenarSelectores() {
    const opts = '<option value="">Seleccione un cliente</option>' + 
        clientesCache.map(c => `<option value="${c.id}">${c.nombre_y_apellido || c.nombre} (${c.cedula})</option>`).join('');
    document.getElementById('selectClienteVisita').innerHTML = opts;
    document.getElementById('selectClienteTrans').innerHTML = opts;
}

function generarTarjetaCliente(c) {
    const nom = c.nombre_y_apellido || c.nombre || 'Sin nombre';
    const tel = c.telefono || 'Sin teléfono';
    const ced = c.cedula || 'Sin cédula';
    const pts = c.puntos || 0;
    const deu = c.deuda_actual ? parseFloat(c.deuda_actual) : 0;
    const code = c.codigo_qr || `ERM-${ced}`;
    const qr = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(code)}`;
    const wa = linkWA(tel, nom, deu);

    let promoHTML = pts >= 5 
        ? `<div class="promo-badge">🎉 ¡Acreedor de Promoción! (6ta visita GRATIS)</div>`
        : `<div class="promo-pending">Visitas: ${pts}/5</div>`;

    return `
    <div class="client-card">
        <div class="client-main-row">
            <div class="client-info">
                <strong>${nom}</strong><br>
                <small><strong>Cédula:</strong> ${ced}</small><br>
                <small><strong>Teléfono:</strong> ${tel}</small><br>
                <small><strong>Deuda:</strong> $${deu.toFixed(2)}</small><br>
                ${promoHTML}
            </div>
            <div class="client-qr-box">
                <img src="${qr}" alt="QR">
                <div class="client-qr-code">${code}</div>
            </div>
        </div>
        ${tel !== 'Sin teléfono' ? `<a href="${wa}" target="_blank" class="btn-whatsapp">💬 Enviar Estado por WhatsApp</a>` : ''}
    </div>`;
}

async function cargarLibreriaQR() {
    if (qrLibLoaded) return true;
    try {
        await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/html5-qrcode';
            script.onload = () => { qrLibLoaded = true; resolve(); };
            script.onerror = reject;
            document.head.appendChild(script);
        });
        return true;
    } catch (e) {
        console.error("Error cargando librería QR", e);
        return false;
    }
}

document.getElementById('menuClientes').addEventListener('click', async () => {
    volverMenu();
    document.getElementById('homeMenu').style.display = 'none';
    document.getElementById('clientsView').style.display = 'block';
    const cont = document.getElementById('clientsListContainer');
    cont.innerHTML = 'Cargando clientes...';
    await cargarClientesCache();
    const res = await fetch(`${API_URL}/rest/v1/clientes?select=*&order=created_at.desc`, {
        headers: { 'apikey': API_KEY, 'Authorization': `Bearer ${userToken}` }
    });
    const data = await res.json();
    cont.innerHTML = data && data.length > 0 ? data.map(generarTarjetaCliente).join('') : '<p>No hay clientes.</p>';
});

document.getElementById('menuVisitas').addEventListener('click', async () => {
    volverMenu();
    document.getElementById('homeMenu').style.display = 'none';
    document.getElementById('visitsView').style.display = 'block';
    await cargarClientesCache();
    cargarHistorialVisitas();
});

async function cargarHistorialVisitas() {
    const cont = document.getElementById('visitsListContainer');
    cont.innerHTML = 'Cargando visitas...';
    try {
        const res = await fetch(`${API_URL}/rest/v1/visitas?select=*,clientes(nombre_y_apellido,nombre)&order=created_at.desc&limit=10`, {
            headers: { 'apikey': API_KEY, 'Authorization': `Bearer ${userToken}` }
        });
        const data = await res.json();
        if (!data || data.length === 0) { cont.innerHTML = '<p>No hay visitas registradas.</p>'; return; }
        
        cont.innerHTML = data.map(v => {
            const nom = v.clientes?.nombre_y_apellido || v.clientes?.nombre || 'Cliente ID: ' + v.cliente_id;
            return `<div class="data-item"><strong>${nom}</strong><br><small>Monto: $${v.monto_consumo || 0} | Notas: ${v.notas || 'Ninguna'}</small></div>`;
        }).join('');
    } catch (e) { cont.innerHTML = '<p style="color:red;">Error al cargar visitas.</p>'; }
}

document.getElementById('btnGuardarVisita').addEventListener('click', async () => {
    const clienteId = document.getElementById('selectClienteVisita').value;
    const monto = parseFloat(document.getElementById('montoVisita').value) || 0;
    const notas = document.getElementById('notasVisita').value;
    
    if (!clienteId) { alert('Selecciona un cliente'); return; }

    try {
        const res = await fetch(`${API_URL}/rest/v1/visitas`, {
            method: 'POST',
            headers: { 'apikey': API_KEY, 'Authorization': `Bearer ${userToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ cliente_id: parseInt(clienteId), monto_consumo: monto, notas: notas, es_valida: true, tipo: 'manual' })
        });
        if (res.ok) {
            alert('✅ Visita registrada con éxito');
            document.getElementById('montoVisita').value = '';
            document.getElementById('notasVisita').value = '';
            cargarHistorialVisitas();
        } else {
            alert('Error al guardar. Revisa los datos.');
        }
    } catch (e) { alert('Error de red: ' + e.message); }
});

document.getElementById('menuTransacciones').addEventListener('click', async () => {
    volverMenu();
    document.getElementById('homeMenu').style.display = 'none';
    document.getElementById('transactionsView').style.display = 'block';
    await cargarClientesCache();
    cargarHistorialTransacciones();
});

async function cargarHistorialTransacciones() {
    const cont = document.getElementById('transactionsListContainer');
    cont.innerHTML = 'Cargando movimientos...';
    try {
        const res = await fetch(`${API_URL}/rest/v1/transacciones?select=*,clientes(nombre_y_apellido,nombre)&order=created_at.desc&limit=10`, {
            headers: { 'apikey': API_KEY, 'Authorization': `Bearer ${userToken}` }
        });
        const data = await res.json();
        if (!data || data.length === 0) { cont.innerHTML = '<p>No hay movimientos registrados.</p>'; return; }
        
        cont.innerHTML = data.map(t => {
            const nom = t.clientes?.nombre_y_apellido || t.clientes?.nombre || 'Cliente ID: ' + t.cliente_id;
            const color = t.tipo === 'Abono' ? 'green' : 'red';
            return `<div class="data-item"><strong>${nom}</strong><br><small style="color:${color};font-weight:bold">${t.tipo}: $${t.monto}</small><br><small>${t.descripcion || ''}</small></div>`;
        }).join('');
    } catch (e) { cont.innerHTML = '<p style="color:red;">Error al cargar transacciones.</p>'; }
}

document.getElementById('btnGuardarTrans').addEventListener('click', async () => {
    const clienteId = document.getElementById('selectClienteTrans').value;
    const tipo = document.getElementById('tipoTransaccion').value;
    const monto = parseFloat(document.getElementById('montoTrans').value);
    const desc = document.getElementById('descTrans').value;
    
    if (!clienteId || !monto) { alert('Completa cliente y monto'); return; }

    try {
        const res = await fetch(`${API_URL}/rest/v1/transacciones`, {
            method: 'POST',
            headers: { 'apikey': API_KEY, 'Authorization': `Bearer ${userToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ cliente_id: clienteId, tipo: tipo, monto: monto, descripcion: desc })
        });
        if (res.ok) {
            alert('✅ Transacción registrada con éxito');
            document.getElementById('montoTrans').value = '';
            document.getElementById('descTrans').value = '';
            cargarHistorialTransacciones();
        } else {
            alert('Error al guardar. Revisa los datos.');
        }
    } catch (e) { alert('Error de red: ' + e.message); }
});

document.getElementById('menuBuscador').addEventListener('click', () => {
    volverMenu();
    document.getElementById('homeMenu').style.display = 'none';
    document.getElementById('searchView').style.display = 'block';
    document.getElementById('searchResultContainer').innerHTML = '';
    document.getElementById('cedulaInput').value = '';
});

document.getElementById('btnBuscarCedula').addEventListener('click', async () => {
    const cedula = document.getElementById('cedulaInput').value.trim();
    const cont = document.getElementById('searchResultContainer');
    if (!cedula) { cont.innerHTML = '<p style="color:red; text-align:center;">Ingresa una cédula</p>'; return; }
    
    cont.innerHTML = '<p style="text-align:center;">Buscando...</p>';
    try {
        const res = await fetch(`${API_URL}/rest/v1/clientes?cedula=eq.${encodeURIComponent(cedula)}&select=*`, {
            headers: { 'apikey': API_KEY, 'Authorization': `Bearer ${userToken}` }
        });
        const data = await res.json();
        if (!data || data.length === 0) {
            cont.innerHTML = '<p style="color:red; text-align:center;">❌ No se encontró ningún cliente con esa cédula</p>';
        } else {
            cont.innerHTML = generarTarjetaCliente(data[0]);
        }
    } catch (e) { cont.innerHTML = '<p style="color:red; text-align:center;">Error de conexión</p>'; }
});

document.getElementById('btnEscanearQR').addEventListener('click', async () => {
    volverMenu();
    document.getElementById('homeMenu').style.display = 'none';
    document.getElementById('scannerView').style.display = 'block';
    document.getElementById('scanResult').innerHTML = '';
    document.getElementById('reader').style.display = 'none';
});

document.getElementById('btnStartCamera').addEventListener('click', async () => {
    const ok = await cargarLibreriaQR();
    if (!ok) {
        document.getElementById('scanResult').innerHTML = '<span style="color:red">Error al cargar el escáner. Usa "Subir Imagen".</span>';
        return;
    }
    
    document.getElementById('reader').style.display = 'block';
    document.getElementById('scanResult').innerHTML = 'Iniciando cámara...';
    
    try {
        html5QrCode = new Html5Qrcode("reader");
        await html5QrCode.start(
            { facingMode: "environment" }, 
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
                detenerCamara();
                procesarQR(decodedText);
            },
            () => {}
        );
    } catch (err) {
        document.getElementById('scanResult').innerHTML = '<span style="color:red">No se pudo acceder a la cámara. Usa "Subir Imagen".</span>';
        document.getElementById('reader').style.display = 'none';
    }
});

document.getElementById('btnSelectImage').addEventListener('click', async () => {
    const ok = await cargarLibreriaQR();
    if (!ok) {
        document.getElementById('scanResult').innerHTML = '<span style="color:red">Error al cargar el escáner.</span>';
        return;
    }
    document.getElementById('qrFileInput').click();
});

document.getElementById('qrFileInput').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    document.getElementById('scanResult').innerHTML = 'Procesando imagen...';
    try {
        if (!html5QrCode) html5QrCode = new Html5Qrcode("reader");
        const decodedText = await html5QrCode.scanFile(file, true);
        procesarQR(decodedText);
    } catch (err) {
        document.getElementById('scanResult').innerHTML = '<span style="color:red">No se detectó un QR válido en la imagen</span>';
    }
    event.target.value = '';
});

function detenerCamara() {
    if (html5QrCode) {
        html5QrCode.stop().then(() => {
            html5QrCode.clear();
            html5QrCode = null;
            document.getElementById('reader').style.display = 'none';
        }).catch(() => {});
    }
}

function procesarQR(codigo) {
    document.getElementById('scanResult').innerHTML = `<span style="color:green">✅ QR leído: ${codigo}</span>`;
    document.getElementById('cedulaInput').value = codigo;
    setTimeout(() => {
        volverMenu();
        document.getElementById('homeMenu').style.display = 'none';
        document.getElementById('searchView').style.display = 'block';
        document.getElementById('btnBuscarCedula').click();
    }, 1500);
                      }
