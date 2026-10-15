/* ========================================
   CONFIGURACIÓN DE SUPABASE
   El Rincón de Mariana
   ======================================== */

const SUPABASE_URL = 'https://nwuqdmbqlpmiyxiqdxmc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_yxX1XgJScGe_klA8IucS0w_Viy6Q0bc';

// Esperar a que la librería cargue y crear el cliente correctamente
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('✅ Supabase conectado correctamente');
console.log('URL:', SUPABASE_URL);
