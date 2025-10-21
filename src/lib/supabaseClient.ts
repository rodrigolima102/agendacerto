import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase - usando variáveis de ambiente quando disponíveis
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tqsibusymtsvpihnyieo.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxc2lidXN5bXRzdnBpaG55aWVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4OTM5MDUsImV4cCI6MjA3NjQ2OTkwNX0.So7QymisJXxTqb-w2lx1_8NSvKrxFcnSEdxIL8SrfdU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
