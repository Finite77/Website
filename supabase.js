const SUPABASE_URL = "https://nszbltkbbqifpmbujgyf.supabase.co"
const SUPABASE_KEY = "sb_publishable_UuHtPB_LDvN3EQAYs2QGsA_cUmf2sAo";

window.supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);