import { NextRequest, NextResponse } from 'next/server';

// ----------------------------------------------------------------------

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.redirect(new URL('/test/agenda?error=oauth_error', request.url));
    }

    if (!code) {
      console.error('No authorization code found');
      return NextResponse.redirect(new URL('/test/agenda?error=no_code', request.url));
    }

    // Redirecionar para a página de callback do frontend
    return NextResponse.redirect(new URL(`/auth/callback/google?code=${code}`, request.url));

  } catch (error) {
    console.error('Error processing Google callback:', error);
    return NextResponse.redirect(new URL('/test/agenda?error=callback_error', request.url));
  }
}
