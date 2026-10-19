// CONFIGURACIÓN
const API_URL = "https://nwuqdmbqlpmiyxiqdxmc.supabase.co";
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53dXFkbWJxbHBtaXl4aXFkeG1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNjIzMDksImV4cCI6MjEwNzYzODMwOX0.3LVC7SwkHkDGRzdAzMMyHbwVi4m8bUFJwUizuRG15DE";
let userToken = "";
let clientesCache = [];
let html5QrCode = null;

// ESPERAR A QUE EL DOM ESTÉ LISTO
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM cargado. Inicializando panel...");
    inicializarPanel();
});

function inicializarPanel() {
    try {
        // Ojito de contraseña
        document.getElementById('btnEye').addEventListener('click', function() {
            var pwd = document.getElementById('password');
            pwd.type = pwd.type === 'password' ? 'text' : 'password';
        });

        // Login
        document.getElementById('btnLogin').addEventListener('click', function() {
            iniciarSesion();
        });

        // Logout
        document.getElementById('btnLogout').addEventListener('click', function() {
            location.reload();
        });

        // Botones de volver
        var botonesVolver = document.querySelectorAll('.btnVolver');
        for (var i = 0; i < botonesVolver.length; i++) {
            botonesVolver[i].addEventListener('click', volverMenu);
        }

        // Menú principal
        document.getElementById('menuClientes').addEventListener('click', function() { verClientes(); });
        document.getElementById('menuVisitas').addEventListener('click', function() { verVisitas(); });
        document.getElementById('menuTransacciones').addEventListener('click', function() { verTransacciones(); });
        document.getElementById('menuBuscador').addEventListener('click', function() { verBuscador(); });
        document.getElementById('btnEscanearQR').addEventListener('click', function() { verEscaner(); });

        // Botones de acción
        document.getElementById('btnGuardarVisita').addEventListener('click', function() { guardarVisita(); });
        document.getElementById('btnGuardarTrans').addEventListener('click', function() { guardarTransaccion(); });
        document.getElementById('btnBuscarCedula').addEventListener('click', function() { buscarCedula(); });

        // Escáner QR
        document.getElementById('btnStartCamera').addEventListener('click', function() { iniciarCamara(); });
        document.getElementById('btnSelectImage').addEventListener('click', function() { document.getElementById('qrFileInput').click(); });
        document.getElementById('qrFileInput').addEventListener('change', function(e) { procesarImagenQR(e); });

        console.log("Panel inicializado correctamente");
    } catch (error) {
        console.error("Error al inicializar panel:", error);
    }
}

function mostrarError(txt) {
    var el = document.getElementById('errorMsg');
    if (el) {
        el.textContent = txt;
        el.style.display = 'block';
    }
}

async function iniciarSesion() {
    var email = document.getElementById('email').value.trim().toLowerCase();
    var pass = document.getElementById('password').value.trim();
    var errDiv = document.getElementById('errorMsg');
    errDiv.style.display = 'none';

    if (!email || !pass) {
        mostrarError('Ingresa tu correo y contraseña.');
        return;
    }

    var btn = document.getElementById('btnLogin');
    btn.disabled = true;
    btn.textContent = 'Verificando...';

    try {
        var res = await fetch(API_URL + '/auth/v1/token?grant_type=password', {
            method: 'POST',
            headers: { 'apikey': API_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, password: pass })
        });

        var data = await res.json();

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
        console.log("Sesión iniciada correctamente");

    } catch (e) {
        mostrarError('Error de red: ' + e.message);
        btn.disabled = false;
        btn.textContent = 'Ingresar al Panel';
    }
}

function volverMenu() {
    document.getElementById('homeMenu').style.display = 'flex';
    document.getElementById('clientsView').style.display = 'none';
    document.getElementById('visitsView').style.display = 'none';
    document.getElementById('transactionsView').style.display = 'none';
    document.getElementById('searchView').style.display = 'none';
    document.getElementById('scannerView').style.display = 'none';
    detenerCamara();
}

function linkWA(telRaw, nombre, deuda) {
    if (!telRaw || telRaw === 'Sin teléfono') return '#';
    var tel = telRaw.replace(/\D/g, '');
    if (!tel.startsWith('58') && tel.length === 10) tel = '58' + tel;
    var msg = deuda > 0 
        ? 'Hola ' + nombre + ', te saludamos de El Rincón de Mariana. Tienes un saldo pendiente de $' + deuda.toFixed(2) + '.'
        : 'Hola ' + nombre + ', tu cuenta está al día. ¡Gracias!';
    return 'https://wa.me/' + tel + '?text=' + encodeURIComponent(msg);
}

async function cargarClientesCache() {
    try {
        var res = await fetch(API_URL + '/rest/v1/clientes?select=id,nombre_y_apellido,nombre,cedula', {
            headers: { 'apikey': API_KEY, 'Authorization': 'Bearer ' + userToken }
        });
        var data = await res.json();
        clientesCache = data || [];
        llenarSelectores();
    } catch (e) { console.error("Error cargando clientes", e); }
}

function llenarSelectores() {
    var opts = '<option value="">Seleccione un cliente</option>';
    for (var i = 0; i < clientesCache.length; i++) {
        var c = clientesCache[i];
        var nombre = c.nombre_y_apellido || c.nombre || 'Sin nombre';
        opts += '<option value="' + c.id + '">' + nombre + ' (' + c.cedula + ')</option>';
    }
    document.getElementById('selectClienteVisita').innerHTML = opts;
    document.getElementById('selectClienteTrans').innerHTML = opts;
}

function generarTarjetaCliente(c) {
    var nom = c.nombre_y_apellido || c.nombre || 'Sin nombre';
    var tel = c.telefono || 'Sin teléfono';
    var ced = c.cedula || 'Sin cédula';
    var pts = c.puntos || 0;
    var deu = c.deuda_actual ? parseFloat(c.deuda_actual) : 0;
    var code = c.codigo_qr || ('ERM-' + ced);
    var qr = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + encodeURIComponent(code);
    var wa = linkWA(tel, nom, deu);
    var promoHTML = pts >= 5 
        ? '<div class="promo-badge"> ¡Promoción! (6ta visita GRATIS)</div>'
        : '<div class="promo-pending">Visitas: ' + pts + '/5</div>';

    var html = '<div class="client-card">';
    html += '<div class="client-main-row">';
    html += '<div class="client-info">';
    html += '<strong>' + nom + '</strong><br>';
    html += '<small><strong>Cédula:</strong> ' + ced + '</small><br>';
    html += '<small><strong>Teléfono:</strong> ' + tel + '</small><br>';
    html += '<small><strong>Deuda:</strong> $' + deu.toFixed(2) + '</small><br>';
    html += promoHTML;
    html += '</div>';
    html += '<div class="client-qr-box">';
    html += '<img src="' + qr + '" alt="QR">';
    html += '<div class="client-qr-code">' + code + '</div>';
    html += '</div>';
    html += '</div>';
    if (tel !== 'Sin teléfono') {
        html += '<a href="' + wa + '" target="_blank" class="btn-whatsapp">💬 Enviar Estado por WhatsApp</a>';
    }
    html += '</div>';
    return html;
}

function verClientes() {
    volverMenu();
    document.getElementById('homeMenu').style.display = 'none';
    document.getElementById('clientsView').style.display = 'block';
    var cont = document.getElementById('clientsListContainer');
    cont.innerHTML = 'Cargando clientes...';
    
    fetch(API_URL + '/rest/v1/clientes?select=*&order=created_at.desc', {
        headers: { 'apikey': API_KEY, 'Authorization': 'Bearer ' + userToken }
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
        if (data && data.length > 0) {
            var html = '';
            for (var i = 0; i < data.length; i++) {
                html += generarTarjetaCliente(data[i]);
            }
            cont.innerHTML = html;
        } else {
            cont.innerHTML = '<p>No hay clientes.</p>';
        }
    })
    .catch(function(e) { cont.innerHTML = '<p style="color:red;">Error: ' + e.message + '</p>'; });
}

function verVisitas() {
    volverMenu();
    document.getElementById('homeMenu').style.display = 'none';
    document.getElementById('visitsView').style.display = 'block';
    cargarClientesCache();
    cargarHistorialVisitas();
}

function cargarHistorialVisitas() {
    var cont = document.getElementById('visitsListContainer');
    cont.innerHTML = 'Cargando...';
    
    fetch(API_URL + '/rest/v1/visitas?select=*,clientes(nombre_y_apellido,nombre)&order=created_at.desc&limit=10', {
        headers: { 'apikey': API_KEY, 'Authorization': 'Bearer ' + userToken }
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
        if (!data || data.length === 0) { cont.innerHTML = '<p>No hay visitas.</p>'; return; }
        var html = '';
        for (var i = 0; i < data.length; i++) {
            var v = data[i];
            var nom = (v.clientes && v.clientes.nombre_y_apellido) || 'Cliente #' + v.cliente_id;
            html += '<div class="data-item"><strong>' + nom + '</strong><br><small>Monto: $' + (v.monto_consumo || 0) + ' | Notas: ' + (v.notas || 'Ninguna') + '</small></div>';
        }
        cont.innerHTML = html;
    })
    .catch(function(e) { cont.innerHTML = '<p style="color:red;">Error: ' + e.message + '</p>'; });
}

function guardarVisita() {
    var clienteId = document.getElementById('selectClienteVisita').value;
    var monto = parseFloat(document.getElementById('montoVisita').value) || 0;
    var notas = document.getElementById('notasVisita').value;
    
    if (!clienteId) { alert('Selecciona un cliente'); return; }

    fetch(API_URL + '/rest/v1/visitas', {
        method: 'POST',
        headers: { 'apikey': API_KEY, 'Authorization': 'Bearer ' + userToken, 'Content-Type': 'application/json' },
        body: JSON.stringify({ cliente_id: parseInt(clienteId), monto_consumo: monto, notas: notas, es_valida: true, tipo: 'manual' })
    })
    .then(function(res) {
        if (res.ok) {
            alert('✅ Visita registrada');
            document.getElementById('montoVisita').value = '';
            document.getElementById('notasVisita').value = '';
            cargarHistorialVisitas();
        } else {
            alert('Error al guardar');
        }
    })
    .catch(function(e) { alert('Error: ' + e.message); });
}

function verTransacciones() {
    volverMenu();
    document.getElementById('homeMenu').style.display = 'none';
    document.getElementById('transactionsView').style.display = 'block';
    cargarClientesCache();
    cargarHistorialTransacciones();
}

function cargarHistorialTransacciones() {
    var cont = document.getElementById('transactionsListContainer');
    cont.innerHTML = 'Cargando...';
    
    fetch(API_URL + '/rest/v1/transacciones?select=*,clientes(nombre_y_apellido,nombre)&order=created_at.desc&limit=10', {
        headers: { 'apikey': API_KEY, 'Authorization': 'Bearer ' + userToken }
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
        if (!data || data.length === 0) { cont.innerHTML = '<p>No hay movimientos.</p>'; return; }
        var html = '';
        for (var i = 0; i < data.length; i++) {
            var t = data[i];
            var nom = (t.clientes && t.clientes.nombre_y_apellido) || 'Cliente #' + t.cliente_id;
            var color = t.tipo === 'Abono' ? 'green' : 'red';
            html += '<div class="data-item"><strong>' + nom + '</strong><br><small style="color:' + color + ';font-weight:bold">' + t.tipo + ': $' + t.monto + '</small><br><small>' + (t.descripcion || '') + '</small></div>';
        }
        cont.innerHTML = html;
    })
    .catch(function(e) { cont.innerHTML = '<p style="color:red;">Error: ' + e.message + '</p>'; });
}

function guardarTransaccion() {
    var clienteId = document.getElementById('selectClienteTrans').value;
    var tipo = document.getElementById('tipoTransaccion').value;
    var monto = parseFloat(document.getElementById('montoTrans').value);
    var desc = document.getElementById('descTrans').value;
    
    if (!clienteId || !monto) { alert('Completa cliente y monto'); return; }

    fetch(API_URL + '/rest/v1/transacciones', {
        method: 'POST',
        headers: { 'apikey': API_KEY, 'Authorization': 'Bearer ' + userToken, 'Content-Type': 'application/json' },
        body: JSON.stringify({ cliente_id: clienteId, tipo: tipo, monto: monto, descripcion: desc })
    })
    .then(function(res) {
        if (res.ok) {
            alert('✅ Transacción registrada');
            document.getElementById('montoTrans').value = '';
            document.getElementById('descTrans').value = '';
            cargarHistorialTransacciones();
        } else {
            alert('Error al guardar');
        }
    })
    .catch(function(e) { alert('Error: ' + e.message); });
}

function verBuscador() {
    volverMenu();
    document.getElementById('homeMenu').style.display = 'none';
    document.getElementById('searchView').style.display = 'block';
    document.getElementById('searchResultContainer').innerHTML = '';
    document.getElementById('cedulaInput').value = '';
}

function buscarCedula() {
    var cedula = document.getElementById('cedulaInput').value.trim();
    var cont = document.getElementById('searchResultContainer');
    if (!cedula) { cont.innerHTML = '<p style="color:red; text-align:center;">Ingresa una cédula</p>'; return; }
    
    cont.innerHTML = '<p style="text-align:center;">Buscando...</p>';
    
    fetch(API_URL + '/rest/v1/clientes?cedula=eq.' + encodeURIComponent(cedula) + '&select=*', {
        headers: { 'apikey': API_KEY, 'Authorization': 'Bearer ' + userToken }
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
        if (!data || data.length === 0) {
            cont.innerHTML = '<p style="color:red; text-align:center;">❌ No se encontró cliente</p>';
        } else {
            cont.innerHTML = generarTarjetaCliente(data[0]);
        }
    })
    .catch(function(e) { cont.innerHTML = '<p style="color:red;">Error: ' + e.message + '</p>'; });
}

function verEscaner() {
    volverMenu();
    document.getElementById('homeMenu').style.display = 'none';
    document.getElementById('scannerView').style.display = 'block';
    document.getElementById('scanResult').innerHTML = '';
    document.getElementById('reader').style.display = 'none';
}

function iniciarCamara() {
    // Cargar librería QR dinámicamente
    if (typeof Html5Qrcode === 'undefined') {
        var script = document.createElement('script');
        script.src = 'https://unpkg.com/html5-qrcode';
        script.onload = function() { iniciarEscaneoReal(); };
        script.onerror = function() { document.getElementById('scanResult').innerHTML = '<span style="color:red">Error al cargar escáner</span>'; };
        document.head.appendChild(script);
    } else {
        iniciarEscaneoReal();
    }
}

function iniciarEscaneoReal() {
    document.getElementById('reader').style.display = 'block';
    document.getElementById('scanResult').innerHTML = 'Iniciando cámara...';
    
    try {
        html5QrCode = new Html5Qrcode("reader");
        html5QrCode.start(
            { facingMode: "environment" }, 
            { fps: 10, qrbox: { width: 250, height: 250 } },
            function(decodedText) {
                detenerCamara();
                procesarQR(decodedText);
            },
            function() {}
        ).catch(function(err) {
            document.getElementById('scanResult').innerHTML = '<span style="color:red">No se pudo acceder a la cámara</span>';
            document.getElementById('reader').style.display = 'none';
        });
    } catch (err) {
        document.getElementById('scanResult').innerHTML = '<span style="color:red">Error: ' + err.message + '</span>';
    }
}

function procesarImagenQR(event) {
    var file = event.target.files[0];
    if (!file) return;
    
    document.getElementById('scanResult').innerHTML = 'Procesando...';
    
    if (typeof Html5Qrcode === 'undefined') {
        var script = document.createElement('script');
        script.src = 'https://unpkg.com/html5-qrcode';
        script.onload = function() { escanearArchivo(file); };
        document.head.appendChild(script);
    } else {
        escanearArchivo(file);
    }
}

function escanearArchivo(file) {
    try {
        if (!html5QrCode) html5QrCode = new Html5Qrcode("reader");
        html5QrCode.scanFile(file, true)
            .then(function(decodedText) { procesarQR(decodedText); })
            .catch(function() { document.getElementById('scanResult').innerHTML = '<span style="color:red">No se detectó QR</span>'; });
    } catch (err) {
        document.getElementById('scanResult').innerHTML = '<span style="color:red">Error: ' + err.message + '</span>';
    }
}

function detenerCamara() {
    if (html5QrCode) {
        html5QrCode.stop().then(function() {
            html5QrCode.clear();
            html5QrCode = null;
            document.getElementById('reader').style.display = 'none';
        }).catch(function() {});
    }
}

function procesarQR(codigo) {
    document.getElementById('scanResult').innerHTML = '<span style="color:green">✅ QR leído: ' + codigo + '</span>';
    document.getElementById('cedulaInput').value = codigo;
    setTimeout(function() {
        volverMenu();
        document.getElementById('homeMenu').style.display = 'none';
        document.getElementById('searchView').style.display = 'block';
        buscarCedula();
    }, 1500);
}
