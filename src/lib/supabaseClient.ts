import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase para Vercel (hardcoded para resolver problema de variáveis de ambiente)
const supabaseUrl = 'https://tqsibusymtsvpihnyieo.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxc2lidXN5bXRzdnBpaG55aWVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY5NzQ4MDAsImV4cCI6MjA1MjU1MDgwMH0.8K8vK8vK8vK8vK8vK8vK8vK8vK8vK8vK8vK8vK8vK8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
