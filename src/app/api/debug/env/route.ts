import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Em produção, mostra apenas variáveis públicas (NEXT_PUBLIC_*)
  // Em desenvolvimento, mostra todas (com valores sensíveis ocultados)
  const envVars: Record<string, string> = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NÃO DEFINIDA',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
      (isProduction ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...` : 'DEFINIDA (oculta)') : 
      'NÃO DEFINIDA',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'NÃO DEFINIDA',
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'NÃO DEFINIDA',
    NODE_ENV: process.env.NODE_ENV || 'NÃO DEFINIDA',
  };

  // Adiciona informações sensíveis apenas em desenvolvimento
  if (!isProduction) {
    envVars.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ? 'DEFINIDA (oculta)' : 'NÃO DEFINIDA';
    envVars.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ? 'DEFINIDA (oculta)' : 'NÃO DEFINIDA';
    envVars.N8N_API_KEY = process.env.N8N_API_KEY ? 'DEFINIDA (oculta)' : 'NÃO DEFINIDA';
    envVars.N8N_BASE_URL = process.env.N8N_BASE_URL || 'NÃO DEFINIDA';
  }

  return NextResponse.json({
    environment: isProduction ? 'production' : 'development',
    variables: envVars,
  });
}

