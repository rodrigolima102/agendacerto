import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

/**
 * Rota para iniciar OAuth com Google
 * GET /api/google/auth
 * 
 * Gera state para CSRF protection e redireciona para Google
 */
export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = `${request.nextUrl.origin}/api/google/callback`;
    
    if (!clientId) {
      return NextResponse.json(
        { error: 'Google Client ID not configured' },
        { status: 500 }
      );
    }

    // Gerar state aleatório
    const state = generateRandomState();
    
    // Salvar state em cookie
    const cookieStore = await cookies();
    cookieStore.set('google_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutos
      path: '/',
    });

    // Construir URL de autorização
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/calendar');
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');
    authUrl.searchParams.set('state', state);

    console.log('🔑 [OAuth Init] Iniciando OAuth com Google');
    console.log('  - redirect_uri:', redirectUri);
    console.log('  - response_type: code');
    console.log('  - access_type: offline');
    console.log('  - prompt: consent');
    console.log('  - state: gerado');

    return NextResponse.redirect(authUrl.toString());

  } catch (error) {
    console.error('❌ [OAuth Init] Erro:', error);
    return NextResponse.json(
      { error: 'Failed to initiate OAuth' },
      { status: 500 }
    );
  }
}

function generateRandomState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

