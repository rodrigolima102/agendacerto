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

    // Buscar lista de calendários
    const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Google Calendar API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      
      let errorMessage = 'Failed to fetch calendars';
      if (response.status === 401) {
        errorMessage = 'Token expirado ou inválido. Faça login novamente.';
      } else if (response.status === 403) {
        errorMessage = 'Sem permissão para acessar calendários.';
      }
      
      return NextResponse.json(
        { message: errorMessage, details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Filtrar e formatar calendários
    const calendars = (data.items || []).map((calendar: any) => ({
      id: calendar.id,
      summary: calendar.summary,
      description: calendar.description || '',
      primary: calendar.primary || false,
      accessRole: calendar.accessRole,
      backgroundColor: calendar.backgroundColor || '#4285f4',
      foregroundColor: calendar.foregroundColor || '#ffffff',
    }));

    return NextResponse.json({
      success: true,
      calendars,
    });

  } catch (error) {
    console.error('Error fetching calendars:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
