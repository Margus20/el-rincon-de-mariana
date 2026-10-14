/* ========================================
   INTEGRACIÓN WHATSAPP - El Rincón de Mariana
   ======================================== */

// NÚMEROS REALES DEL NEGOCIO
const NUMERO_WHATSAPP_1 = '584129354244';
const NUMERO_WHATSAPP_2 = '584167017155';

// Usamos el primero como principal
const NUMERO_WHATSAPP = NUMERO_WHATSAPP_1;

// Mensaje predeterminado
const MENSAJE_DEFAULT = '¡Hola! Quiero hacer un pedido en El Rincón de Mariana 🍔';

document.addEventListener('DOMContentLoaded', function() {
    configurarWhatsApp();
    cargarPromos();
});

function configurarWhatsApp() {
    const mensaje = encodeURIComponent(MENSAJE_DEFAULT);
    const enlace = `https://wa.me/${NUMERO_WHATSAPP}?text=${mensaje}`;
    
    const btnWhatsapp = document.getElementById('btn-whatsapp');
    if (btnWhatsapp) {
        btnWhatsapp.href = enlace;
    }
    
    const floatWhatsapp = document.getElementById('whatsapp-float');
    if (floatWhatsapp) {
        floatWhatsapp.href = enlace;
    }
    
    console.log('✅ WhatsApp configurado: ' + NUMERO_WHATSAPP);
}

async function cargarPromos() {
    const contenedor = document.getElementById('promos-container');
    if (!contenedor) return;
    
    const datos = await cargarDatos('data/promos.json');
    
    if (!datos || !datos.promociones) {
        contenedor.innerHTML = '<p class="cargando">⚠️ No hay promociones disponibles.</p>';
        return;
    }
    
    contenedor.innerHTML = '';
    
    datos.promociones.forEach(promo => {
        const divPromo = document.createElement('div');
        divPromo.className = 'promo-card';
        
        const divIcono = document.createElement('div');
        divIcono.className = 'promo-icono';
        divIcono.textContent = promo.icono;
        divPromo.appendChild(divIcono);
        
        const h4 = document.createElement('h4');
        h4.textContent = promo.titulo;
        divPromo.appendChild(h4);
        
        const p = document.createElement('p');
        p.textContent = promo.descripcion;
        divPromo.appendChild(p);
        
        if (promo.precio) {
            const spanPrecio = document.createElement('span');
            spanPrecio.className = 'promo-precio';
            spanPrecio.textContent = promo.precio;
            divPromo.appendChild(spanPrecio);
        }
        
        contenedor.appendChild(divPromo);
    });
    
    console.log('✅ Promociones cargadas: ' + datos.promociones.length);
}
