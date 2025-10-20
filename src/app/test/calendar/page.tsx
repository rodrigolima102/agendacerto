'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import Alert from '@mui/material/Alert';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

import { Iconify } from 'src/components/iconify';
import { EventModal } from 'src/components/event-modal/event-modal';
import { googleAuthService } from 'src/lib/google-auth';
import type { GoogleAuthTokens, GoogleCalendarEvent, GoogleUser } from 'src/types/google-auth';

// ----------------------------------------------------------------------

type ViewMode = 'month' | 'week' | 'day';

export default function CalendarPage() {
  const [tokens, setTokens] = useState<GoogleAuthTokens | null>(null);
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
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
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<GoogleCalendarEvent | null>(null);

  useEffect(() => {
    // Verificar se há tokens salvos
    const savedTokens = googleAuthService.getTokens();
    if (savedTokens) {
      setTokens(savedTokens);
      setUser({
        id: 'connected',
        email: 'usuario@google.com',
        name: 'Usuário Google',
        picture: undefined,
      });
      loadCalendars(savedTokens.access_token);
      loadEvents();
      
      // Inicia o auto-refresh se não estiver rodando
      googleAuthService.startAutoRefresh();
    }
  }, []);

  useEffect(() => {
    if (tokens) {
      loadEvents();
    }
  }, [currentDate, viewMode, selectedCalendarId, tokens]);

  const loadCalendars = async (accessToken?: string) => {
    const token = accessToken || tokens?.access_token;
    if (!token) return;

    try {
      setLoadingCalendars(true);
      const response = await fetch('/api/calendar/list-calendars', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCalendars(data.calendars || []);
      }
    } catch (error) {
      console.error('Error loading calendars:', error);
    } finally {
      setLoadingCalendars(false);
    }
  };

  const loadEvents = async () => {
    if (!tokens) return;

    try {
      setLoading(true);
      setError('');

      const { timeMin, timeMax } = getDateRange();
      const response = await fetch(
        `/api/calendar/list?timeMin=${timeMin}&timeMax=${timeMax}&calendarId=${selectedCalendarId}`,
        {
          headers: { 'Authorization': `Bearer ${tokens.access_token}` },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to load events');
      }

          const data = await response.json();
          console.log('Loaded events:', data.events);
          setEvents(data.events || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Falha ao carregar eventos');
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = () => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    switch (viewMode) {
      case 'day':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'week':
        const dayOfWeek = start.getDay();
        start.setDate(start.getDate() - dayOfWeek);
        start.setHours(0, 0, 0, 0);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
      case 'month':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(end.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        break;
    }

    return {
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
    };
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch (viewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setCurrentDate(newDate);
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    console.log(`Looking for events on: ${dateStr}`);
    console.log(`All events:`, events);
    
    const dayEvents = events.filter(event => {
      const eventDate = event.start?.dateTime ? 
        new Date(event.start.dateTime).toISOString().split('T')[0] :
        event.start?.date;
      console.log(`Event date: ${eventDate}, Looking for: ${dateStr}`);
      return eventDate === dateStr;
    });
    console.log(`Events for ${dateStr}:`, dayEvents);
    return dayEvents;
  };

  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDay = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  const getWeekDays = () => {
    const start = new Date(currentDate);
    const dayOfWeek = start.getDay();
    start.setDate(start.getDate() - dayOfWeek);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const formatDateTime = (dateTime?: string) => {
    if (!dateTime) return 'Horário não definido';
    return new Date(dateTime).toLocaleString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatEventTime = (dateTime?: string) => {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    
    // Se for um evento de dia inteiro
    if (dateTime.includes('T') === false) {
      return 'Dia inteiro';
    }
    
    return date.toLocaleString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleEventClick = (event: GoogleCalendarEvent) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedEvent(null);
  };

  const handleEventSave = async (updatedEvent: Partial<GoogleCalendarEvent>) => {
    if (!tokens || !selectedEvent?.id) return;

    try {
      await googleAuthService.updateEvent(
        selectedEvent.id,
        updatedEvent,
        tokens.access_token,
        selectedCalendarId
      );
      
      // Recarregar eventos
      loadEvents();
      handleModalClose();
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  };

  const handleEventDelete = async (eventId: string) => {
    if (!tokens) return;

    try {
      await googleAuthService.deleteEvent(eventId, tokens.access_token, selectedCalendarId);
      
      // Recarregar eventos
      loadEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  };

  if (!tokens) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Você não está conectado ao Google Calendar.
        </Typography>
        <Button variant="contained" onClick={() => (window.location.href = '/auth/jwt/sign-in')}>
          Ir para Login
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">
          📅 Agenda Completa
        </Typography>
        <Button
          variant="outlined"
          onClick={() => window.location.href = '/auth/jwt/sign-in'}
          startIcon={<Iconify icon="eva:arrow-back-fill" />}
        >
          Voltar
        </Button>
      </Box>

      {/* Controles */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            {/* Navegação de data */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={() => navigateDate('prev')} size="small">
                <Iconify icon="eva:arrow-ios-back-fill" />
              </IconButton>
              <Typography variant="h6" sx={{ minWidth: 200, textAlign: 'center' }}>
                {viewMode === 'day' && formatDate(currentDate)}
                {viewMode === 'week' && `Semana de ${formatDate(getWeekDays()[0])}`}
                {viewMode === 'month' && currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </Typography>
              <IconButton onClick={() => navigateDate('next')} size="small">
                <Iconify icon="eva:arrow-ios-forward-fill" />
              </IconButton>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setCurrentDate(new Date())}
                startIcon={<Iconify icon="eva:calendar-fill" />}
              >
                Hoje
              </Button>
            </Box>

            {/* Modo de visualização */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant={viewMode === 'month' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setViewMode('month')}
              >
                Mês
              </Button>
              <Button
                variant={viewMode === 'week' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setViewMode('week')}
              >
                Semana
              </Button>
              <Button
                variant={viewMode === 'day' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setViewMode('day')}
              >
                Dia
              </Button>
            </Box>
          </Box>

          {/* Seletor de calendário */}
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Agenda</InputLabel>
            <Select
              value={selectedCalendarId}
              onChange={(e) => setSelectedCalendarId(e.target.value)}
              label="Agenda"
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
                    <Typography component="div">
                      {calendar.summary}
                      {calendar.primary && <Chip label="Principal" size="small" sx={{ ml: 1 }} />}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {/* Erro */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Visualização */}
      {loading && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <LinearProgress sx={{ flex: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Carregando eventos...
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Visualização do calendário */}
      {viewMode === 'month' && (
        <Card>
          <CardContent sx={{ p: 0 }}>
            {/* Dias da semana */}
            <Box sx={{ display: 'flex', borderBottom: '1px solid', borderColor: 'divider' }}>
              {['DOM.', 'SEG.', 'TER.', 'QUA.', 'QUI.', 'SEX.', 'SÁB.'].map((day) => (
                <Box
                  key={day}
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    borderRight: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': { borderRight: 'none' },
                  }}
                >
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      textAlign: 'center', 
                      fontWeight: 600, 
                      py: 2,
                      color: 'text.secondary',
                      fontSize: '0.875rem'
                    }}
                  >
                    {day}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Dias do calendário */}
            <Box sx={{ position: 'relative' }}>
              {/* Grid de dias */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                {getCalendarDays().map((day, index) => {
                  const isCurrentMonthDay = isCurrentMonth(day);
                  const isTodayDay = isToday(day);
                  const dayEvents = getEventsForDate(day);
                  
                  return (
                    <Box
                      key={index}
                      sx={{
                        flex: '0 0 14.285%', // 100% / 7 dias
                        minHeight: 100,
                        borderRight: '1px solid',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        p: 1,
                        position: 'relative',
                        bgcolor: isTodayDay ? 'primary.light' : 'background.paper',
                        '&:hover': {
                          bgcolor: isTodayDay ? 'primary.light' : 'action.hover',
                        },
                      }}
                    >
                      {/* Número do dia */}
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: isTodayDay ? 600 : 400,
                          color: isCurrentMonthDay ? 'text.primary' : 'text.disabled',
                          mb: 0.5,
                          fontSize: '0.875rem'
                        }}
                      >
                        {day.getDate()}
                      </Typography>
                      
                      {/* Eventos dentro de cada dia */}
                      {dayEvents.slice(0, 3).map((event, eventIndex) => {
                        const eventTime = event.start?.dateTime || event.start?.date;
                        const timeStr = eventTime ? formatEventTime(eventTime) : '';
                        const eventTitle = event.summary || 'Sem título';
                        
                        // Cores do DS - usar cores diferentes para evitar conflito com fundo do dia atual
                        const eventColors = [
                          { bg: 'primary.main', hover: 'primary.dark', text: 'primary.contrastText' },
                          { bg: 'secondary.main', hover: 'secondary.dark', text: 'secondary.contrastText' },
                          { bg: 'success.main', hover: 'success.dark', text: 'success.contrastText' },
                          { bg: 'warning.main', hover: 'warning.dark', text: 'warning.contrastText' },
                          { bg: 'error.main', hover: 'error.dark', text: 'error.contrastText' },
                          { bg: 'info.main', hover: 'info.dark', text: 'info.contrastText' },
                        ];
                        
                        const colorIndex = eventIndex % eventColors.length;
                        const eventColor = eventColors[colorIndex];
                        
                        return (
                          <Box
                            key={eventIndex}
                            onClick={() => handleEventClick(event)}
                            sx={{
                              width: '100%',
                              height: 16,
                              bgcolor: eventColor.bg,
                              color: eventColor.text,
                              borderRadius: 0.5,
                              px: 0.5,
                              mb: 0.25,
                              fontSize: '11px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              '&:hover': {
                                bgcolor: eventColor.hover,
                              },
                            }}
                          >
                            {timeStr && `${timeStr} `}{eventTitle}
                          </Box>
                        );
                      })}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Visualização semanal */}
      {viewMode === 'week' && (
        <Card>
          <CardContent sx={{ p: 0 }}>
            {/* Cabeçalho da semana */}
            <Box sx={{ display: 'flex', borderBottom: '1px solid', borderColor: 'divider' }}>
              {/* Coluna de horários (esquerda) - mesmo tamanho das outras */}
              <Box sx={{ flex: 1, borderRight: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" sx={{ p: 1, color: 'text.secondary', fontSize: '0.75rem', textAlign: 'center', display: 'block' }}>
                  GMT-03
                </Typography>
              </Box>
              
              {/* Dias da semana */}
              {getWeekDays().map((day, index) => (
                <Box
                  key={index}
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    borderRight: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': { borderRight: 'none' },
                  }}
                >
                  <Box sx={{ textAlign: 'center', py: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem' }}>
                      {day.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase()}.
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {day.getDate()}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Grade de horários */}
            <Box sx={{ display: 'flex', minHeight: 1200 }}>
              {/* Coluna de horários - mesmo tamanho das outras */}
              <Box sx={{ flex: 1, borderRight: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                {Array.from({ length: 24 }, (_, hour) => (
                  <Box
                    key={hour}
                    sx={{
                      height: 50,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'background.paper',
                    }}
                  >
                    <Typography variant="caption" sx={{ fontSize: '0.9rem', color: 'text.secondary', fontWeight: 500 }}>
                      {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Grade de eventos */}
              <Box sx={{ flex: 7, position: 'relative', bgcolor: 'background.paper' }}>
                {/* Grid com CSS Grid para linhas retas */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gridTemplateRows: 'repeat(24, 50px)',
                    height: '100%',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  {/* Células da grade */}
                  {Array.from({ length: 24 * 7 }, (_, index) => {
                    const hour = Math.floor(index / 7);
                    const day = index % 7;
                    
                    return (
                      <Box
                        key={index}
                        sx={{
                          borderRight: day < 6 ? '1px solid' : 'none',
                          borderBottom: hour < 23 ? '1px solid' : 'none',
                          borderColor: 'divider',
                          bgcolor: 'background.paper',
                        }}
                      />
                    );
                  })}
                </Box>

                {/* Eventos posicionados */}
                {getWeekDays().map((day, dayIndex) => {
                  const dayEvents = getEventsForDate(day);
                  const dayWidth = 100 / 7; // 7 dias da semana
                  const dayLeft = dayIndex * dayWidth;

                  return dayEvents.map((event, eventIndex) => {
                    const eventStart = event.start?.dateTime || event.start?.date;
                    const eventEnd = event.end?.dateTime || event.end?.date;
                    
                    if (!eventStart) return null;

                    const startDate = new Date(eventStart);
                    const endDate = eventEnd ? new Date(eventEnd) : new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hora padrão
                    
                    const startHour = startDate.getHours();
                    const startMinute = startDate.getMinutes();
                    const endHour = endDate.getHours();
                    const endMinute = endDate.getMinutes();
                    
                    const startTime = startHour + startMinute / 60;
                    const endTime = endHour + endMinute / 60;
                    const duration = endTime - startTime;
                    
                    const top = startTime * 50; // 50px por hora, sem margem adicional
                    
                    // Altura proporcional ao tempo
                    let height = duration * 50; // 50px por hora
                    let minHeight = 80; // Altura mínima aumentada para eventos muito pequenos
                    
                    // Para eventos muito pequenos (menos de 30 minutos), usar altura mínima
                    if (duration < 0.5) { // 30 minutos = 0.5 horas
                      height = minHeight;
                    }
                    
                    // Calcular largura e posição para sobreposição
                    const totalEventsInSlot = dayEvents.filter(e => {
                      const eStart = e.start?.dateTime || e.start?.date;
                      if (!eStart) return false;
                      const eStartDate = new Date(eStart);
                      const eStartTime = eStartDate.getHours() + eStartDate.getMinutes() / 60;
                      return Math.abs(eStartTime - startTime) < 0.25; // Eventos no mesmo slot de 15 minutos
                    }).length;
                    
                    const eventWidth = totalEventsInSlot > 1 ? `${dayWidth / totalEventsInSlot}%` : `${dayWidth}%`;
                    const eventLeft = totalEventsInSlot > 1 ? 
                      `${dayLeft + (dayWidth / totalEventsInSlot) * eventIndex}%` : 
                      `${dayLeft}%`;
                    
                    const eventTime = formatEventTime(eventStart);
                    const eventTitle = event.summary || 'Sem título';
                    
                    // Ajustar espaçamento e fonte para eventos pequenos
                    const isSmallEvent = duration < 0.5; // Menos de 30 minutos
                    const paddingX = isSmallEvent ? 1 : 1.5; // Padding horizontal
                    const paddingY = isSmallEvent ? 0.25 : 0.5; // Padding vertical mínimo para ficar quase colado
                    const titleFontSize = isSmallEvent ? '13px' : '14px'; // Aumentado para eventos pequenos
                    const timeFontSize = isSmallEvent ? '11px' : '12px'; // Aumentado para eventos pequenos
                    const titleLineHeight = isSmallEvent ? '16px' : '18px'; // Line-height maior que fontSize
                    const timeLineHeight = isSmallEvent ? '14px' : '16px'; // Line-height maior que fontSize
                    const titleMarginBottom = isSmallEvent ? '3px' : '4px';

                    return (
                      <Box
                        key={`${dayIndex}-${eventIndex}`}
                        onClick={() => handleEventClick(event)}
                        sx={{
                          position: 'absolute',
                          left: eventLeft,
                          top: top,
                          width: eventWidth,
                          height: height,
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                          borderRadius: 1,
                          px: paddingX,
                          py: paddingY,
                          fontSize: 'inherit', // Removido fontSize conflitante
                          overflow: 'visible', // Mudado para visible para debug
                          cursor: 'pointer',
                          border: '1px solid',
                          borderColor: 'primary.dark',
                          margin: '1px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'flex-start',
                          alignItems: 'flex-start',
                          zIndex: 100 + eventIndex, // Z-index mais alto
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            bgcolor: 'primary.dark',
                            zIndex: 999,
                            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                            transform: 'translateY(-1px)',
                          },
                        }}
                      >
                        <div style={{ 
                          fontWeight: 600, 
                          fontSize: titleFontSize,
                          lineHeight: titleLineHeight,
                          marginBottom: titleMarginBottom,
                          color: 'white',
                          overflow: 'visible', // Mudado para visible para debug
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          width: '100%',
                          minHeight: titleLineHeight, // Altura mínima garantida
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          {eventTitle}
                        </div>
                        <div style={{ 
                          fontSize: timeFontSize,
                          lineHeight: timeLineHeight,
                          color: 'white',
                          opacity: 0.9,
                          overflow: 'visible', // Mudado para visible para debug
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          width: '100%',
                          minHeight: timeLineHeight, // Altura mínima garantida
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          {eventTime}
                        </div>
                      </Box>
                    );
                  });
                })}
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Visualização diária */}
      {viewMode === 'day' && (
        <Card>
          <CardContent sx={{ p: 0 }}>
            {/* Cabeçalho do dia */}
            <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {currentDate.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase()}. {currentDate.getDate()}
              </Typography>
              <Typography variant="caption" sx={{ ml: 2, color: 'text.secondary' }}>
                GMT-03
              </Typography>
            </Box>

            {/* Grade de horários */}
            <Box sx={{ display: 'flex', minHeight: 1200 }}>
              {/* Coluna de horários - mesma largura das outras */}
              <Box sx={{ flex: 1, borderRight: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                {Array.from({ length: 24 }, (_, hour) => (
                  <Box
                    key={hour}
                    sx={{
                      height: 50,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'background.paper',
                    }}
                  >
                    <Typography variant="caption" sx={{ fontSize: '0.9rem', color: 'text.secondary', fontWeight: 500 }}>
                      {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Área de eventos */}
              <Box sx={{ flex: 7, position: 'relative', bgcolor: 'background.paper' }}>
                {/* Linhas de horário */}
                {Array.from({ length: 24 }, (_, hour) => (
                  <Box
                    key={hour}
                    sx={{
                      height: 50,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      position: 'relative',
                    }}
                  />
                ))}

                {/* Eventos posicionados */}
                {events.map((event, eventIndex) => {
                  const eventStart = event.start?.dateTime || event.start?.date;
                  const eventEnd = event.end?.dateTime || event.end?.date;
                  
                  if (!eventStart) return null;

                  const startDate = new Date(eventStart);
                  const endDate = eventEnd ? new Date(eventEnd) : new Date(startDate.getTime() + 60 * 60 * 1000);
                  
                  const startHour = startDate.getHours();
                  const startMinute = startDate.getMinutes();
                  const endHour = endDate.getHours();
                  const endMinute = endDate.getMinutes();
                  
                  const startTime = startHour + startMinute / 60;
                  const endTime = endHour + endMinute / 60;
                  const duration = endTime - startTime;
                  
                  const top = startTime * 50; // 50px por hora
                  const height = duration * 50; // 50px por hora
                  
                  const eventTime = formatEventTime(eventStart);
                  const eventTitle = event.summary || 'Sem título';
                  
                  // Cores do DS - usar cores diferentes para evitar conflito
                  const eventColors = [
                    { bg: 'primary.main', hover: 'primary.dark', text: 'primary.contrastText' },
                    { bg: 'secondary.main', hover: 'secondary.dark', text: 'secondary.contrastText' },
                    { bg: 'success.main', hover: 'success.dark', text: 'success.contrastText' },
                    { bg: 'warning.main', hover: 'warning.dark', text: 'warning.contrastText' },
                    { bg: 'error.main', hover: 'error.dark', text: 'error.contrastText' },
                    { bg: 'info.main', hover: 'info.dark', text: 'info.contrastText' },
                  ];
                  
                  const colorIndex = eventIndex % eventColors.length;
                  const eventColor = eventColors[colorIndex];

                  return (
                    <Box
                      key={eventIndex}
                      onClick={() => handleEventClick(event)}
                      sx={{
                        position: 'absolute',
                        left: 8,
                        right: 8,
                        top: top,
                        height: height,
                        bgcolor: eventColor.bg,
                        color: eventColor.text,
                        borderRadius: 1,
                        px: 1,
                        py: 0.5,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        zIndex: eventIndex + 1,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          bgcolor: eventColor.hover,
                          zIndex: 999,
                          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                          transform: 'translateY(-1px)',
                        },
                      }}
                    >
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600, 
                          fontSize: '0.875rem',
                          lineHeight: 1.2,
                          color: eventColor.text,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          flex: 1,
                        }}
                      >
                        {eventTitle}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontSize: '0.75rem',
                          lineHeight: 1.2,
                          color: eventColor.text,
                          opacity: 0.9,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          ml: 1,
                        }}
                      >
                        {eventTime}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Modal de edição de evento */}
      <EventModal
        open={modalOpen}
        event={selectedEvent}
        onClose={handleModalClose}
        onSave={handleEventSave}
        onDelete={handleEventDelete}
        calendars={calendars}
        selectedCalendarId={selectedCalendarId}
        onCalendarChange={setSelectedCalendarId}
        allEvents={events}
      />
    </Box>
  );
}
