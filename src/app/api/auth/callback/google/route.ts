import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// ----------------------------------------------------------------------

export const dynamic = 'force-dynamic';

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    console.log('📨 [Auth Callback] Recebido do Google');

    if (error) {
      console.error('❌ OAuth error:', error);
      return NextResponse.redirect(new URL('/auth/jwt/sign-in?error=oauth_error', request.url));
    }

    if (!code) {
      console.error('❌ No authorization code found');
      return NextResponse.redirect(new URL('/auth/jwt/sign-in?error=no_code', request.url));
    }

    // Validar state (CSRF protection)
    const cookieStore = await cookies();
    const savedState = cookieStore.get('google_oauth_state')?.value;

    if (state && savedState && state !== savedState) {
      console.error('❌ State inválido');
      cookieStore.delete('google_oauth_state');
      return NextResponse.redirect(new URL('/auth/jwt/sign-in?error=invalid_state', request.url));
    }

    if (savedState) {
      cookieStore.delete('google_oauth_state');
    }

    console.log('🔄 [Auth Callback] Trocando code por tokens...');

    // Trocar code por tokens NO SERVIDOR
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
    const redirectUri = `${request.nextUrl.origin}/api/auth/callback/google`;

    if (!clientId || !clientSecret) {
      console.error('❌ Credenciais não configuradas');
      return NextResponse.redirect(new URL('/auth/jwt/sign-in?error=missing_credentials', request.url));
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('❌ Erro ao trocar tokens:', errorData);
      return NextResponse.redirect(new URL('/auth/jwt/sign-in?error=token_exchange_failed', request.url));
    }

    const tokens: GoogleTokenResponse = await tokenResponse.json();

    console.log('✅ [Auth Callback] Tokens recebidos do Google');
    console.log('  - access_token:', tokens.access_token ? 'Presente' : 'Ausente');
    console.log('  - refresh_token:', tokens.refresh_token ? 'Presente ✅' : 'AUSENTE ❌');
    console.log('  - expires_in:', tokens.expires_in, 's');
    console.log('  - token_type:', tokens.token_type);
    console.log('  - scope:', tokens.scope);
    
    // Se não recebeu refresh_token, logar alerta
    if (!tokens.refresh_token) {
      console.warn('⚠️ [Auth Callback] REFRESH TOKEN NÃO FOI RETORNADO PELO GOOGLE!');
      console.warn('   Isso pode acontecer se:');
      console.warn('   1. O usuário já autorizou este app antes');
      console.warn('   2. Solução: Revogar acesso em https://myaccount.google.com/permissions');
      console.warn('   3. Ou esperar que o prompt=consent force novo consentimento');
    }

    // Salvar tokens em cookie para o frontend processar e chamar N8N
    cookieStore.set('google_tokens_temp', JSON.stringify({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
      expires_at: Date.now() + (tokens.expires_in * 1000),
    }), {
      httpOnly: false, // Precisa ser acessível pelo JS
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 120, // 2 minutos
      path: '/',
    });

    // Redirecionar para página de callback do frontend (para chamar N8N)
    return NextResponse.redirect(new URL(`/auth/callback/google?google_connected=true`, request.url));

  } catch (error) {
    console.error('💥 Error processing Google callback:', error);
    return NextResponse.redirect(new URL('/auth/jwt/sign-in?error=callback_error', request.url));
  }
}
