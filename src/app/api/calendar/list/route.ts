import { NextRequest, NextResponse } from 'next/server';

// ----------------------------------------------------------------------

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '');

    if (!accessToken) {
      return NextResponse.json(
        { message: 'Access token is required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const calendarId = searchParams.get('calendarId') || 'primary';
    const timeMin = searchParams.get('timeMin') || new Date().toISOString();
    const timeMax = searchParams.get('timeMax') || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

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
      console.error('Google Calendar API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      
      let errorMessage = 'Failed to fetch events from Google Calendar';
      if (response.status === 401) {
        errorMessage = 'Token expirado ou inválido. Faça login novamente.';
      } else if (response.status === 403) {
        errorMessage = 'Sem permissão para acessar o calendário.';
      } else if (response.status === 404) {
        errorMessage = 'Calendário não encontrado.';
      }
      
      return NextResponse.json(
        { message: errorMessage, details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      events: data.items || [],
      nextPageToken: data.nextPageToken,
    });

  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
