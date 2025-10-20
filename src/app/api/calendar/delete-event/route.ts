import { NextRequest, NextResponse } from 'next/server';

// ----------------------------------------------------------------------

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest) {
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
    const eventId = searchParams.get('eventId');
    const calendarId = searchParams.get('calendarId') || 'primary';

    if (!eventId) {
      return NextResponse.json(
        { message: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Fazer requisição para Google Calendar API
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`,
      {
        method: 'DELETE',
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
        { message: 'Failed to delete event from Google Calendar' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
