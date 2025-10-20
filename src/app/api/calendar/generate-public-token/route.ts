import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Simulando um banco de dados em memória (em produção, use um banco real)
// Usando uma variável global para compartilhar entre endpoints
declare global {
  var publicTokens: Map<string, {
    accessToken: string;
    expiresAt: number;
    createdAt: number;
  }> | undefined;
}

if (!global.publicTokens) {
  global.publicTokens = new Map();
}

const publicTokens = global.publicTokens;

// ----------------------------------------------------------------------

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { accessToken } = await request.json();

    if (!accessToken) {
      return NextResponse.json(
        { message: 'Access token is required' },
        { status: 400 }
      );
    }

    // Gerar token público seguro
    const publicToken = crypto.randomBytes(32).toString('hex');
    
    // Definir expiração (24 horas)
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000);
    
    // Armazenar mapeamento
    publicTokens.set(publicToken, {
      accessToken,
      expiresAt,
      createdAt: Date.now(),
    });

    // Token público gerado com sucesso

    return NextResponse.json({
      success: true,
      publicToken,
      expiresAt,
      expiresIn: '24 horas',
    });

  } catch (error) {
    console.error('Error generating public token:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ----------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publicToken = searchParams.get('token');

    if (!publicToken) {
      return NextResponse.json(
        { message: 'Public token is required' },
        { status: 400 }
      );
    }

    const tokenData = publicTokens.get(publicToken);
    
    if (!tokenData) {
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 404 }
      );
    }

    // Verificar se o token expirou
    if (Date.now() > tokenData.expiresAt) {
      publicTokens.delete(publicToken);
      return NextResponse.json(
        { message: 'Token expired' },
        { status: 410 }
      );
    }

    return NextResponse.json({
      success: true,
      accessToken: tokenData.accessToken,
      expiresAt: tokenData.expiresAt,
    });

  } catch (error) {
    console.error('Error validating public token:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
