import type { SWRConfiguration } from 'swr';
import type { ICalendarEvent, IGoogleCalendar } from 'src/types/calendar';

import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';

import axios, { fetcher, endpoints } from 'src/lib/axios';
import { googleAuthService } from 'src/lib/google-auth';

// ----------------------------------------------------------------------

const enableServer = false;

const CALENDAR_ENDPOINT = endpoints.calendar;

const swrOptions: SWRConfiguration = {
  revalidateIfStale: enableServer,
  revalidateOnFocus: enableServer,
  revalidateOnReconnect: enableServer,
};

// ----------------------------------------------------------------------

type EventsData = {
  events: ICalendarEvent[];
};

export function useGetEvents() {
  // Verificar se há token do Google disponível
  const tokens = googleAuthService.getTokens();
  const hasGoogleToken = !!tokens?.access_token;

  // Usar endpoint diferente baseado na disponibilidade do token
  const endpoint = hasGoogleToken ? `${CALENDAR_ENDPOINT}/list` : CALENDAR_ENDPOINT;
  
  // Configurar headers com token se disponível
  const fetcherWithAuth = async (url: string) => {
    if (hasGoogleToken && tokens?.access_token) {
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      // Garantir que todos os eventos tenham calendarId
      if (data.events) {
        data.events = data.events.map((event: any) => ({
          ...event,
          calendarId: event.calendarId || event.organizer?.email || 'primary',
        }));
      }
      
      return data;
    }
    
    // Fallback para fetcher normal se não houver token
    return fetcher(url);
  };

  const { data, isLoading, error, isValidating } = useSWR<EventsData>(
    hasGoogleToken ? endpoint : null, // Só fazer requisição se houver token
    fetcherWithAuth,
    {
      ...swrOptions,
    }
  );

  const memoizedValue = useMemo(() => {
    const events = data?.events.map((event) => ({ ...event, textColor: event.color }));

    return {
      events: events || [],
      eventsLoading: isLoading,
      eventsError: error,
      eventsValidating: isValidating,
      eventsEmpty: !isLoading && !isValidating && !data?.events.length,
    };
  }, [data?.events, error, isLoading, isValidating]);

  return memoizedValue;
}

// ----------------------------------------------------------------------

type CalendarsData = {
  success: boolean;
  calendars: IGoogleCalendar[];
};

export function useGetCalendars() {
  const tokens = googleAuthService.getTokens();
  const hasGoogleToken = !!tokens?.access_token;

  const fetchCalendars = async (url: string) => {
    if (!hasGoogleToken || !tokens?.access_token) {
      return { success: false, calendars: [] };
    }

    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    return res.json();
  };

  const { data, isLoading, error, isValidating } = useSWR<CalendarsData>(
    hasGoogleToken ? `${CALENDAR_ENDPOINT}/list-calendars` : null,
    fetchCalendars,
    {
      ...swrOptions,
      revalidateOnFocus: false, // Não revalidar ao focar - calendários não mudam com frequência
    }
  );

  const memoizedValue = useMemo(() => ({
    calendars: data?.calendars || [],
    calendarsLoading: isLoading,
    calendarsError: error,
    calendarsValidating: isValidating,
  }), [data?.calendars, error, isLoading, isValidating]);

  return memoizedValue;
}

// ----------------------------------------------------------------------

export async function createEvent(eventData: ICalendarEvent) {
  /**
   * Work on server
   */
  if (enableServer) {
    const data = { eventData };
    await axios.post(CALENDAR_ENDPOINT, data);
  }

  /**
   * Work in local
   */
  mutate(
    CALENDAR_ENDPOINT,
    (currentData) => {
      const currentEvents: ICalendarEvent[] = currentData?.events;

      const events = [...currentEvents, eventData];

      return { ...currentData, events };
    },
    false
  );
}

// ----------------------------------------------------------------------

export async function updateEvent(eventData: Partial<ICalendarEvent>) {
  /**
   * Work on server
   */
  if (enableServer) {
    const data = { eventData };
    await axios.put(CALENDAR_ENDPOINT, data);
  }

  /**
   * Work in local
   */
  mutate(
    CALENDAR_ENDPOINT,
    (currentData) => {
      const currentEvents: ICalendarEvent[] = currentData?.events;

      const events = currentEvents.map((event) =>
        event.id === eventData.id ? { ...event, ...eventData } : event
      );

      return { ...currentData, events };
    },
    false
  );
}

// ----------------------------------------------------------------------

export async function deleteEvent(eventId: string) {
  /**
   * Work on server
   */
  if (enableServer) {
    const data = { eventId };
    await axios.patch(CALENDAR_ENDPOINT, data);
  }

  /**
   * Work in local
   */
  mutate(
    CALENDAR_ENDPOINT,
    (currentData) => {
      const currentEvents: ICalendarEvent[] = currentData?.events;

      const events = currentEvents.filter((event) => event.id !== eventId);

      return { ...currentData, events };
    },
    false
  );
}
