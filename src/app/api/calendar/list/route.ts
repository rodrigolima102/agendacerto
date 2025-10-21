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
    const specificCalendarId = searchParams.get('calendarId');
    const timeMin = searchParams.get('timeMin') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 dias atrás
    const timeMax = searchParams.get('timeMax') || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(); // 90 dias à frente

    // Se um calendário específico foi solicitado, buscar apenas dele
    if (specificCalendarId) {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(specificCalendarId)}/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`,
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
          { message: 'Failed to fetch events', details: errorData },
          { status: response.status }
        );
      }

      const data = await response.json();
      const eventsWithCalendarId = (data.items || []).map((event: any) => ({
        ...event,
        calendarId: specificCalendarId,
      }));

      return NextResponse.json({
        success: true,
        events: eventsWithCalendarId,
        nextPageToken: data.nextPageToken,
      });
    }

    // Buscar lista de calendários
    const calendarsResponse = await fetch(
      'https://www.googleapis.com/calendar/v3/users/me/calendarList',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!calendarsResponse.ok) {
      const errorData = await calendarsResponse.json();
      console.error('Error fetching calendars:', errorData);
      return NextResponse.json(
        { message: 'Failed to fetch calendars', details: errorData },
        { status: calendarsResponse.status }
      );
    }

    const calendarsData = await calendarsResponse.json();
    const calendars = calendarsData.items || [];

    // Buscar eventos de todos os calendários em paralelo
    const eventPromises = calendars.map(async (calendar: any) => {
      try {
        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendar.id)}/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          console.error(`Error fetching events from calendar ${calendar.id}`);
          return [];
        }

        const data = await response.json();
        // Adicionar calendarId e cor do calendário a cada evento
        return (data.items || []).map((event: any) => ({
          id: event.id,
          title: event.summary || 'No title',
          description: event.description || '',
          start: event.start?.dateTime || event.start?.date,
          end: event.end?.dateTime || event.end?.date,
          allDay: !event.start?.dateTime,
          color: calendar.backgroundColor || '#4285f4',
          calendarId: calendar.id,
          calendarName: calendar.summary,
        }));
      } catch (error) {
        console.error(`Error fetching events from calendar ${calendar.id}:`, error);
        return [];
      }
    });

    const eventsArrays = await Promise.all(eventPromises);
    const allEvents = eventsArrays.flat();

    return NextResponse.json({
      success: true,
      events: allEvents,
    });

  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
