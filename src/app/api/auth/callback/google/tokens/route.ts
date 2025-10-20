import { NextRequest, NextResponse } from 'next/server';

// ----------------------------------------------------------------------

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { code, codeVerifier, redirectUri } = await request.json();

    if (!code || !codeVerifier || !redirectUri) {
      return NextResponse.json(
        { message: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Configuração do Google OAuth
    const clientId = '1005292864367-ins3o5uel2istn3gmg37vrqv63t05lbj.apps.googleusercontent.com';
    const clientSecret = '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';

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { message: 'Google OAuth not configured' },
        { status: 500 }
      );
    }

    // Troca o código por tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      console.error('Google OAuth error:', error);
      return NextResponse.json(
        { message: 'Failed to exchange code for tokens' },
        { status: 400 }
      );
    }

    const tokens = await tokenResponse.json();

    return NextResponse.json({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
      token_type: tokens.token_type,
      scope: tokens.scope,
    });

  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
