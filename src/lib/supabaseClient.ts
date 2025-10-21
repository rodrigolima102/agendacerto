import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase - hardcoded para páginas estáticas
const supabaseUrl = 'https://tqsibusymtsvpihnyieo.supabase.co'
const supabaseAnonKey = 'sb_publishable_yCnml2-JPc_uySkMiSasMg_eUKbMzhl'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
