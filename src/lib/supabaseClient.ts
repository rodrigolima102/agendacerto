import { createClient } from '@supabase/supabase-js'

// Para GitHub Pages, usar variáveis hardcoded ou de build time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tqsibusymtsvpihnyieo.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_yCnml2-JPc_uySkMiSasMg_eUKbMzhl'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
