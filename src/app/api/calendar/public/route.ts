import { NextRequest, NextResponse } from 'next/server';

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const calendarId = searchParams.get('calendarId') || 'primary';
    const timeMin = searchParams.get('timeMin') || new Date().toISOString();
    const timeMax = searchParams.get('timeMax') || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 dias
    const publicToken = searchParams.get('publicToken');

    if (!publicToken) {
      return NextResponse.json(
        { message: 'Public token is required' },
        { status: 400 }
      );
    }

    // Validar token público
    // Validando token público
    
    const tokenData = publicTokens.get(publicToken);
    
    if (!tokenData) {
      // Token não encontrado
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

    const accessToken = tokenData.accessToken;

    // Fazer requisição para Google Calendar API
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Google Calendar API error:', errorData);
      return NextResponse.json(
        { message: 'Failed to fetch events from Google Calendar' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Filtrar apenas informações públicas dos eventos
    const publicEvents = (data.items || []).map((event: any) => ({
      id: event.id,
      summary: event.summary || 'Sem título',
      description: event.description || '',
      start: event.start,
      end: event.end,
      location: event.location || '',
      htmlLink: event.htmlLink || '',
      // Remover informações sensíveis
      // Não incluir: attendees, creator, organizer, etc.
    }));

    return NextResponse.json({
      success: true,
      events: publicEvents,
      calendarId,
      timeRange: {
        timeMin,
        timeMax,
      },
    });

  } catch (error) {
    console.error('Error fetching public events:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
