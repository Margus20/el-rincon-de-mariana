/* ========================================
   CONFIGURACIÓN DE SUPABASE
   El Rincón de Mariana
   ======================================== */

const SUPABASE_URL = 'https://nwuqdmbqlpmiyxiqdxmc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_yxX1XgJScGe_klA8IucS0w_Viy6Q0bc';

// Inicializar el cliente de Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('✅ Supabase conectado correctamente');
