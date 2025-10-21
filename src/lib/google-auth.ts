import type { GoogleAuthTokens, GoogleCalendarEvent, GoogleCalendarListResponse, GoogleUser } from 'src/types/google-auth';

// ----------------------------------------------------------------------

export const GOOGLE_CONFIG = {
  clientId: process.env.GOOGLE_CLIENT_ID || 'your_google_client_id_here',
  scope: 'https://www.googleapis.com/auth/calendar',
  accessType: 'offline',
  prompt: 'consent',
  redirectUri: 'http://localhost:8082/api/auth/callback/google',
} as const;

// ----------------------------------------------------------------------

export class GoogleAuthService {
  private static instance: GoogleAuthService;
  private refreshInterval: NodeJS.Timeout | null = null;

  static getInstance(): GoogleAuthService {
    if (!GoogleAuthService.instance) {
      GoogleAuthService.instance = new GoogleAuthService();
    }
    return GoogleAuthService.instance;
  }

  // ----------------------------------------------------------------------

  /**
   * Inicia o fluxo OAuth com PKCE
   */
  async initiateOAuth(): Promise<string> {
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);
    
    // Armazena o code_verifier temporariamente
    sessionStorage.setItem('google_oauth_code_verifier', codeVerifier);
    
    const params = new URLSearchParams({
      client_id: GOOGLE_CONFIG.clientId,
      redirect_uri: GOOGLE_CONFIG.redirectUri,
      response_type: 'code',
      scope: GOOGLE_CONFIG.scope,
      access_type: GOOGLE_CONFIG.accessType,
      prompt: GOOGLE_CONFIG.prompt,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  // ----------------------------------------------------------------------

  /**
   * Troca o código de autorização por tokens
   */
  async exchangeCodeForTokens(code: string): Promise<GoogleAuthTokens> {
    const codeVerifier = sessionStorage.getItem('google_oauth_code_verifier');
    
    if (!codeVerifier) {
      throw new Error('Code verifier not found');
    }

    const response = await fetch('/api/auth/callback/google/tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        codeVerifier,
        redirectUri: GOOGLE_CONFIG.redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to exchange code for tokens');
    }

    const tokens = await response.json();
    
    // Adiciona timestamp de expiração
    tokens.expires_at = Date.now() + (tokens.expires_in * 1000);
    
    // Limpa o code_verifier
    sessionStorage.removeItem('google_oauth_code_verifier');
    
    return tokens;
  }

  // ----------------------------------------------------------------------

  /**
   * Atualiza o access token usando o refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<GoogleAuthTokens> {
    const response = await fetch('/api/auth/callback/google/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh access token');
    }

    const tokens = await response.json();
    tokens.expires_at = Date.now() + (tokens.expires_in * 1000);
    
    return tokens;
  }

  // ----------------------------------------------------------------------

  /**
   * Obtém informações do usuário
   */
  async getUserInfo(accessToken: string): Promise<GoogleUser> {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        console.error('Google UserInfo API error:', response.status, response.statusText);
        // Retorna dados mockados se falhar
        return {
          id: 'unknown',
          email: 'usuario@exemplo.com',
          name: 'Usuário',
          picture: undefined,
        };
      }

      return response.json();
    } catch (error) {
      console.error('Error getting user info:', error);
      // Retorna dados mockados se falhar
      return {
        id: 'unknown',
        email: 'usuario@exemplo.com',
        name: 'Usuário',
        picture: undefined,
      };
    }
  }

  // ----------------------------------------------------------------------

  /**
   * Lista eventos do Google Calendar
   */
  async listEvents(accessToken: string, calendarId: string = 'primary'): Promise<GoogleCalendarEvent[]> {
    const response = await fetch(`/api/calendar/list?calendarId=${calendarId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to list events');
    }

    const data: GoogleCalendarListResponse = await response.json();
    return data.items || [];
  }

  // ----------------------------------------------------------------------

  /**
   * Cria um evento no Google Calendar
   */
  async createEvent(event: Partial<GoogleCalendarEvent>, accessToken: string): Promise<GoogleCalendarEvent> {
    const response = await fetch('/api/calendar/upsert-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create event');
    }

    return response.json();
  }

  // ----------------------------------------------------------------------

  /**
   * Atualiza um evento no Google Calendar
   */
  async updateEvent(eventId: string, event: Partial<GoogleCalendarEvent>, accessToken: string, calendarId: string = 'primary'): Promise<GoogleCalendarEvent> {
    const response = await fetch('/api/calendar/update-event', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        eventId,
        calendarId,
        event,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update event');
    }

    const data = await response.json();
    return data.event;
  }

  // ----------------------------------------------------------------------

  /**
   * Exclui um evento do Google Calendar
   */
  async deleteEvent(eventId: string, accessToken: string, calendarId: string = 'primary'): Promise<void> {
    const response = await fetch(`/api/calendar/delete-event?eventId=${eventId}&calendarId=${calendarId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete event');
    }
  }

  // ----------------------------------------------------------------------

  /**
   * Armazena tokens no localStorage
   */
  saveTokens(tokens: GoogleAuthTokens): void {
    localStorage.setItem('google_calendar_tokens', JSON.stringify(tokens));
    
    // Inicia o refresh automático se tiver refresh_token
    if (tokens.refresh_token) {
      this.startAutoRefresh();
    }
  }

  // ----------------------------------------------------------------------

  /**
   * Recupera tokens do localStorage
   */
  getTokens(): GoogleAuthTokens | null {
    try {
      const saved = localStorage.getItem('google_calendar_tokens');
      if (!saved) return null;

      const tokens = JSON.parse(saved);

      // Verifica se o token expirou
      if (tokens.expires_at && Date.now() >= tokens.expires_at) {
        // Se expirou, tenta fazer refresh automaticamente
        if (tokens.refresh_token) {
          this.refreshTokensInBackground(tokens.refresh_token);
        } else {
          this.clearTokens();
          return null;
        }
      }

      return tokens;
    } catch (error) {
      console.error('Error parsing saved tokens:', error);
      this.clearTokens();
      return null;
    }
  }

  /**
   * Refresh automático de tokens em background
   */
  private async refreshTokensInBackground(refreshToken: string): Promise<void> {
    try {
      console.log('🔄 Refreshing Google tokens in background...');
      const newTokens = await this.refreshAccessToken(refreshToken);
      
      // Salva os novos tokens
      this.saveTokens(newTokens);
      
      console.log('✅ Google tokens refreshed successfully');
    } catch (error) {
      console.error('❌ Failed to refresh Google tokens:', error);
      // Se falhar, limpa os tokens para forçar novo login
      this.clearTokens();
    }
  }

  // ----------------------------------------------------------------------

  /**
   * Remove tokens do localStorage
   */
  clearTokens(): void {
    localStorage.removeItem('google_calendar_tokens');
    this.stopAutoRefresh();
  }

  /**
   * Inicia o refresh automático de tokens
   */
  startAutoRefresh(): void {
    // Para qualquer intervalo existente
    this.stopAutoRefresh();
    
    // Verifica tokens a cada 5 minutos
    this.refreshInterval = setInterval(() => {
      const tokens = this.getTokens();
      if (tokens && tokens.refresh_token) {
        // Se o token expira em menos de 10 minutos, faz refresh
        const timeUntilExpiry = tokens.expires_at - Date.now();
        if (timeUntilExpiry < 10 * 60 * 1000) { // 10 minutos
          this.refreshTokensInBackground(tokens.refresh_token);
        }
      }
    }, 5 * 60 * 1000); // 5 minutos

    console.log('🔄 Auto-refresh started for Google tokens');
  }

  /**
   * Para o refresh automático de tokens
   */
  stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
      console.log('⏹️ Auto-refresh stopped for Google tokens');
    }
  }

  // ----------------------------------------------------------------------

  /**
   * Gera code verifier para PKCE
   */
  private generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, Array.from(array)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  // ----------------------------------------------------------------------

  /**
   * Gera code challenge para PKCE
   */
  private async generateCodeChallenge(codeVerifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(digest))))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }
}

// ----------------------------------------------------------------------

export const googleAuthService = GoogleAuthService.getInstance();
