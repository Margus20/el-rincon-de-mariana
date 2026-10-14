/* ========================================
   CARGA DEL MENÚ - El Rincón de Mariana
   Lee los datos desde data/menu.json
   ======================================== */

document.addEventListener('DOMContentLoaded', function() {
    cargarMenu();
});

async function cargarMenu() {
    const contenedor = document.getElementById('menu-container');
    
    // Cargar datos del menú
    const datos = await cargarDatos('data/menu.json');
    
    if (!datos || !datos.categorias) {
        contenedor.innerHTML = '<p class="cargando">⚠️ No se pudo cargar el menú. Intenta más tarde.</p>';
        return;
    }
    
    // Limpiar contenedor
    contenedor.innerHTML = '';
    
    // Crear cada categoría
    datos.categorias.forEach(categoria => {
        const divCategoria = document.createElement('div');
        divCategoria.className = 'categoria';
        
        // Icono de la categoría
        const divIcono = document.createElement('div');
        divIcono.className = 'categoria-icono';
        divIcono.textContent = categoria.icono;
        divCategoria.appendChild(divIcono);
        
        // Título de la categoría
        const h3 = document.createElement('h3');
        h3.textContent = categoria.nombre;
        divCategoria.appendChild(h3);
        
        // Items de la categoría
        categoria.items.forEach(item => {
            const divItem = document.createElement('div');
            divItem.className = 'item';
            
            const divInfo = document.createElement('div');
            divInfo.className = 'item-info';
            
            const divNombre = document.createElement('div');
            divNombre.className = 'item-nombre';
            divNombre.textContent = item.nombre;
            divInfo.appendChild(divNombre);
            
            if (item.descripcion) {
                const divDesc = document.createElement('div');
                divDesc.className = 'item-desc';
                divDesc.textContent = item.descripcion;
                divInfo.appendChild(divDesc);
            }
            
            const divPrecio = document.createElement('div');
            divPrecio.className = 'item-precio';
            divPrecio.textContent = item.precio;
            
            divItem.appendChild(divInfo);
            divItem.appendChild(divPrecio);
            divCategoria.appendChild(divItem);
        });
        
        contenedor.appendChild(divCategoria);
    });
    
    console.log('✅ Menú cargado: ' + datos.categorias.length + ' categorías');
}
