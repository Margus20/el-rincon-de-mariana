/* ========================================
   FUNCIONES PRINCIPALES - El Rincón de Mariana
   ======================================== */

// Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🍔 El Rincón de Mariana - Página cargada');
    
    // Inicializar menú móvil
    inicializarMenuMovil();
    
    // Scroll suave para los enlaces del menú
    inicializarScrollSuave();
});

// Menú móvil (hamburguesa)
function inicializarMenuMovil() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('activo');
        });
        
        // Cerrar menú al hacer clic en un enlace
        const enlaces = navLinks.querySelectorAll('a');
        enlaces.forEach(enlace => {
            enlace.addEventListener('click', function() {
                navLinks.classList.remove('activo');
            });
        });
    }
}

// Scroll suave
function inicializarScrollSuave() {
    const enlaces = document.querySelectorAll('a[href^="#"]');
    enlaces.forEach(enlace => {
        enlace.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId !== '#' && document.querySelector(targetId)) {
                e.preventDefault();
                document.querySelector(targetId).scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Función para cargar datos JSON
async function cargarDatos(url) {
    try {
        const respuesta = await fetch(url);
        if (!respuesta.ok) {
            throw new Error('Error al cargar: ' + respuesta.status);
        }
        return await respuesta.json();
    } catch (error) {
        console.error('Error cargando ' + url + ':', error);
        return null;
    }
}
