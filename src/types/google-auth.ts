// ----------------------------------------------------------------------

export interface GoogleAuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  expires_at?: number;
}

// ----------------------------------------------------------------------

export interface GoogleCalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  location?: string;
  htmlLink?: string;
  created?: string;
  updated?: string;
}

// ----------------------------------------------------------------------

export interface GoogleCalendarListResponse {
  items: GoogleCalendarEvent[];
  nextPageToken?: string;
}

// ----------------------------------------------------------------------

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
}
