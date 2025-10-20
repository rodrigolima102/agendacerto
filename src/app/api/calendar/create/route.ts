import { NextRequest, NextResponse } from 'next/server';

// ----------------------------------------------------------------------

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '');

    if (!accessToken) {
      return NextResponse.json(
        { message: 'Access token is required' },
        { status: 401 }
      );
    }

    const { summary, description } = await request.json();

    if (!summary) {
      return NextResponse.json(
        { message: 'Calendar name is required' },
        { status: 400 }
      );
    }

    // Criar calendário no Google Calendar
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary,
        description: description || '',
        timeZone: 'America/Sao_Paulo',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Google Calendar API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      
      let errorMessage = 'Failed to create calendar';
      if (response.status === 401) {
        errorMessage = 'Token expirado ou inválido. Faça login novamente.';
      } else if (response.status === 403) {
        errorMessage = 'Sem permissão para criar calendários.';
      }
      
      return NextResponse.json(
        { message: errorMessage, details: errorData },
        { status: response.status }
      );
    }

    const calendar = await response.json();
    
    return NextResponse.json({
      success: true,
      calendar: {
        id: calendar.id,
        summary: calendar.summary,
        description: calendar.description,
        timeZone: calendar.timeZone,
      },
    });

  } catch (error) {
    console.error('Error creating calendar:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
