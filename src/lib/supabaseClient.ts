import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase para Vercel (hardcoded para resolver problema de variáveis de ambiente)
const supabaseUrl = 'https://tqsibusymtsvpihnyieo.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxc2lidXN5bXRzdnBpaG55aWVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4OTM5MDUsImV4cCI6MjA3NjQ2OTkwNX0.So7QymisJXxTqb-w2lx1_8NSvKrxFcnSEdxIL8SrfdU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
