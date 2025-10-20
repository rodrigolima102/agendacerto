import { NextRequest, NextResponse } from 'next/server';

// ----------------------------------------------------------------------

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '');

    if (!accessToken) {
      return NextResponse.json(
        { message: 'Access token is required' },
        { status: 401 }
      );
    }

    const { eventId, calendarId, event } = await request.json();

    if (!eventId || !calendarId || !event) {
      return NextResponse.json(
        { message: 'Event ID, calendar ID and event data are required' },
        { status: 400 }
      );
    }

    // Fazer requisição para Google Calendar API
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Google Calendar API error:', errorData);
      return NextResponse.json(
        { message: 'Failed to update event in Google Calendar' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      event: data,
    });

  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
