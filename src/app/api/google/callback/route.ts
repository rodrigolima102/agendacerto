import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
}

/**
 * Rota de callback do OAuth2 do Google
 * GET /api/google/callback?code=xxx&state=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    console.log('📨 [Google Callback] Recebido');
    console.log('  - code:', code ? 'Presente' : 'Ausente');
    console.log('  - state:', state ? 'Presente' : 'Ausente');

    // Verificar erro
    if (error) {
      console.error('❌ [Google Callback] Erro do Google:', error);
      return NextResponse.redirect(
        new URL(`/auth/jwt/sign-in?error=${error}`, request.url)
      );
    }

    if (!code) {
      console.error('❌ [Google Callback] Code não fornecido');
      return NextResponse.redirect(
        new URL('/auth/jwt/sign-in?error=no_code', request.url)
      );
    }

    // Verificar state (CSRF protection)
    const cookieStore = await cookies();
    const savedState = cookieStore.get('google_oauth_state')?.value;

    if (state && savedState && state !== savedState) {
      console.error('❌ [Google Callback] State inválido');
      cookieStore.delete('google_oauth_state');
      return NextResponse.redirect(
        new URL('/auth/jwt/sign-in?error=invalid_state', request.url)
      );
    }

    // Limpar state
    if (savedState) {
      cookieStore.delete('google_oauth_state');
    }

    console.log('🔄 [Google Callback] Trocando code por tokens...');

    // Trocar code por tokens
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
    const redirectUri = `${request.nextUrl.origin}/api/google/callback`;

    if (!clientId || !clientSecret) {
      console.error('❌ [Google Callback] Credenciais não configuradas');
      return NextResponse.redirect(
        new URL('/auth/jwt/sign-in?error=missing_credentials', request.url)
      );
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
      console.error('❌ [Google Callback] Erro ao trocar tokens:', errorData);
      return NextResponse.redirect(
        new URL('/auth/jwt/sign-in?error=token_exchange_failed', request.url)
      );
    }

    const tokens: GoogleTokenResponse = await tokenResponse.json();

    console.log('✅ [Google Callback] Tokens recebidos');
    console.log('  - access_token: Presente');
    console.log('  - refresh_token:', tokens.refresh_token ? 'Presente ✅' : 'Ausente');
    console.log('  - expires_in:', tokens.expires_in, 's');

    // Salvar tokens em cookie temporário para o frontend acessar
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

    // Chamar N8N webhook diretamente (não crítico)
    try {
      console.log('🚀 [Google Callback] Chamando webhook N8N...');
      
      const n8nWebhookUrl = 'https://rodrigolima102.app.n8n.cloud/webhook/3c817931-bb7c-482c-af62-bf407db639c3';
      
      const n8nResponse = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          googleAccessToken: tokens.access_token,
        }),
      });

      console.log('📅 [Google Callback] N8N Status:', n8nResponse.status);

      if (n8nResponse.ok) {
        const n8nData = await n8nResponse.text();
        console.log('✅ [Google Callback] Webhook N8N respondeu:', n8nData.substring(0, 100));
      } else {
        console.warn('⚠️ [Google Callback] Webhook N8N retornou erro (não crítico):', n8nResponse.status);
      }
    } catch (n8nError) {
      console.warn('⚠️ [Google Callback] Erro ao chamar N8N (não crítico):', n8nError);
    }

    // Redirecionar para página de sucesso
    return NextResponse.redirect(
      new URL('/auth/jwt/sign-in?connected=true', request.url)
    );

  } catch (error) {
    console.error('💥 [Google Callback] Erro:', error);
    return NextResponse.redirect(
      new URL('/auth/jwt/sign-in?error=callback_error', request.url)
    );
  }
}

