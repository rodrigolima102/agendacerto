'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Alert from '@mui/material/Alert';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

import { Iconify } from 'src/components/iconify';
import { googleAuthService } from 'src/lib/google-auth';
import type { GoogleAuthTokens, GoogleCalendarEvent, GoogleUser } from 'src/types/google-auth';

// ----------------------------------------------------------------------

export default function AgendaTestPage() {
  const searchParams = useSearchParams();
  const [tokens, setTokens] = useState<GoogleAuthTokens | null>(null);
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [newCalendarName, setNewCalendarName] = useState('');
  const [creatingCalendar, setCreatingCalendar] = useState(false);
  const [calendars, setCalendars] = useState<Array<{
    id: string;
    summary: string;
    description: string;
    primary: boolean;
    accessRole: string;
    backgroundColor: string;
    foregroundColor: string;
  }>>([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState<string>('primary');
  const [loadingCalendars, setLoadingCalendars] = useState(false);

      useEffect(() => {
        console.log('AgendaTestPage: useEffect executado');
        // Verificar se há tokens salvos
        const savedTokens = googleAuthService.getTokens();
        console.log('AgendaTestPage: tokens encontrados:', !!savedTokens);
        if (savedTokens) {
          setTokens(savedTokens);
          // Define usuário padrão sem chamar API
          setUser({
            id: 'connected',
            email: 'usuario@google.com',
            name: 'Usuário Google',
            picture: undefined,
          });
          
          // Inicia o auto-refresh se não estiver rodando
          googleAuthService.startAutoRefresh();
        }

    // Verificar se veio do callback
    const connected = searchParams.get('connected');
    if (connected === 'true') {
      setShowSuccessMessage(true);
      // Remove a mensagem após 5 segundos
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  }, [searchParams]);

  // Carregar dados quando tokens estiverem disponíveis
  useEffect(() => {
    console.log('AgendaTestPage: tokens mudaram:', !!tokens);
    if (tokens) {
      console.log('AgendaTestPage: carregando calendários e eventos');
      loadCalendars(tokens.access_token);
      loadTomorrowEvents(tokens.access_token);
    }
  }, [tokens]);

  // Recarregar eventos quando o calendário selecionado mudar
  useEffect(() => {
    if (tokens && selectedCalendarId) {
      loadTomorrowEvents();
    }
  }, [selectedCalendarId, tokens]);

  const loadCalendars = async (accessToken?: string) => {
    const token = accessToken || tokens?.access_token;
    if (!token) return;

    try {
      setLoadingCalendars(true);

      const response = await fetch('/api/calendar/list-calendars', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error loading calendars:', errorData.message);
        return;
      }

      const data = await response.json();
      setCalendars(data.calendars || []);
    } catch (error) {
      console.error('Error loading calendars:', error);
    } finally {
      setLoadingCalendars(false);
    }
  };

  const loadTomorrowEvents = async (accessToken?: string) => {
    const token = accessToken || tokens?.access_token;
    if (!token) return;

    try {
      setLoading(true);
      setError('');

      // Calcular data de amanhã
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const endOfTomorrow = new Date(tomorrow);
      endOfTomorrow.setHours(23, 59, 59, 999);

      const timeMin = tomorrow.toISOString();
      const timeMax = endOfTomorrow.toISOString();

      const response = await fetch(`/api/calendar/list?timeMin=${timeMin}&timeMax=${timeMax}&calendarId=${selectedCalendarId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to load events');
      }

      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Falha ao carregar eventos');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Limpar tokens
    googleAuthService.clearTokens();
    
    // Limpar estado
    setTokens(null);
    setUser(null);
    setEvents([]);
    setError('');
    setShowSuccessMessage(false);
    
    // Redirecionar para login
    window.location.href = '/auth/jwt/sign-in';
  };

  const handleCreateCalendar = async () => {
    if (!newCalendarName.trim() || !tokens) return;

    try {
      setCreatingCalendar(true);
      setError('');

      const response = await fetch('/api/calendar/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: newCalendarName.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao criar calendário');
      }

      const data = await response.json();
      setNewCalendarName('');
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);
      
      // Recarregar calendários e eventos após criar calendário
      loadCalendars();
      loadTomorrowEvents();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Falha ao criar calendário');
    } finally {
      setCreatingCalendar(false);
    }
  };

  const formatDateTime = (dateTime?: string) => {
    if (!dateTime) return 'Horário não definido';
    return new Date(dateTime).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateTime?: string) => {
    if (!dateTime) return '';
    return new Date(dateTime).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return formatDate(tomorrow.toISOString());
  };

  if (!tokens) {
    return (
      <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Não conectado ao Google Calendar
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Faça login primeiro para visualizar sua agenda.
            </Typography>
            <Button
              variant="contained"
              onClick={() => window.location.href = '/auth/jwt/sign-in'}
              startIcon={<Iconify icon="logos:google" />}
            >
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        🧪 Teste de Agenda - Amanhã
      </Typography>

      {/* Mensagem de sucesso do callback */}
      {showSuccessMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          ✅ Google Calendar conectado com sucesso! Agora você pode visualizar sua agenda.
        </Alert>
      )}

      {/* Card para criar nova agenda */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            📅 Criar Nova Agenda
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
            <TextField
              fullWidth
              label="Nome da Agenda"
              value={newCalendarName}
              onChange={(e) => setNewCalendarName(e.target.value)}
              placeholder="Ex: Agenda Pessoal, Trabalho, etc."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:calendar-fill" />
                  </InputAdornment>
                ),
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCreateCalendar();
                }
              }}
            />
            <Button
              variant="contained"
              onClick={handleCreateCalendar}
              disabled={!newCalendarName.trim() || creatingCalendar}
              startIcon={<Iconify icon="eva:plus-fill" />}
            >
              {creatingCalendar ? 'Criando...' : 'Criar'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Seletor de calendários */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            📋 Selecionar Agenda
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Escolha uma agenda</InputLabel>
            <Select
              value={selectedCalendarId}
              onChange={(e) => setSelectedCalendarId(e.target.value)}
              label="Escolha uma agenda"
              disabled={loadingCalendars}
            >
              {calendars.map((calendar) => (
                <MenuItem key={calendar.id} value={calendar.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: calendar.backgroundColor,
                      }}
                    />
                    <Typography>
                      {calendar.summary}
                      {calendar.primary && (
                        <Chip label="Principal" size="small" sx={{ ml: 1 }} />
                      )}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {loadingCalendars && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Carregando agendas...
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Informações do usuário */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  bgcolor: 'grey.200',
                }}
              >
                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                    }}
                  >
                    <Iconify icon="eva:person-fill" width={24} />
                  </Box>
                )}
              </Box>
              <Box>
                <Typography variant="h6">{user?.name || 'Usuário'}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
              <Chip label="Conectado" color="success" size="small" />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={() => window.location.href = '/test/calendar'}
                startIcon={<Iconify icon="eva:calendar-fill" />}
                size="small"
              >
                Agenda Completa
              </Button>
              <Button
                variant="outlined"
                onClick={() => window.location.href = '/agenda/share'}
                startIcon={<Iconify icon="eva:share-fill" />}
                size="small"
              >
                Compartilhar
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={handleLogout}
                startIcon={<Iconify icon="eva:log-out-fill" />}
                size="small"
              >
                Sair
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Status de carregamento */}
      {loading && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <LinearProgress sx={{ flex: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Carregando agenda de amanhã...
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Erro */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Lista de eventos */}
      {events.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Agenda de Amanhã - {getTomorrowDate()} ({events.length} eventos)
            </Typography>
            
            <List>
              {events.map((event, index) => (
                <div key={event.id || index}>
                  <ListItem sx={{ py: 2 }}>
                    <ListItemIcon>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1,
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Iconify icon="eva:calendar-fill" width={20} />
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {event.summary || 'Sem título'}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            🕐 {formatDateTime(event.start?.dateTime || event.start?.date)}
                          </Typography>
                          {event.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              📝 {event.description}
                            </Typography>
                          )}
                          {event.location && (
                            <Typography variant="body2" color="text.secondary">
                              📍 {event.location}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < events.length - 1 && <Divider />}
                </div>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {events.length === 0 && !loading && !error && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Iconify icon="eva:calendar-outline" width={64} sx={{ color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              Agenda de Amanhã - {getTomorrowDate()}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Não há eventos agendados para amanhã.
            </Typography>
            <Button
              variant="outlined"
              onClick={() => loadTomorrowEvents()}
              startIcon={<Iconify icon="eva:refresh-fill" />}
            >
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Botão para tentar novamente quando há erro */}
      {error && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Iconify icon="eva:alert-circle-outline" width={64} sx={{ color: 'error.main', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              Erro ao carregar eventos
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {error}
            </Typography>
            <Button
              variant="contained"
              onClick={() => loadTomorrowEvents()}
              startIcon={<Iconify icon="eva:refresh-fill" />}
            >
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
