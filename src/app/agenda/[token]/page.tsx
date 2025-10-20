'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
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
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';

import { Iconify } from 'src/components/iconify';
import type { GoogleCalendarEvent } from 'src/types/google-auth';

// ----------------------------------------------------------------------

export default function PublicAgendaPage() {
  const params = useParams();
  const token = params.token as string;
  
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });
  const [calendarInfo, setCalendarInfo] = useState<{
    calendarId: string;
    timeRange: { timeMin: string; timeMax: string };
  } | null>(null);

  useEffect(() => {
    if (token) {
      loadPublicEvents();
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadEventsForMonth();
    }
  }, [currentMonth, token]);

  const loadPublicEvents = async () => {
    try {
      setLoading(true);
      setError('');

      // Calcular período de 7 dias a partir de hoje
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      
      const timeMin = today.toISOString();
      const timeMax = nextWeek.toISOString();

      const response = await fetch(
        `/api/calendar/public?publicToken=${token}&timeMin=${timeMin}&timeMax=${timeMax}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao carregar eventos');
      }

      const data = await response.json();
      setEvents(data.events || []);
      setCalendarInfo({
        calendarId: data.calendarId,
        timeRange: data.timeRange,
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Falha ao carregar eventos');
    } finally {
      setLoading(false);
    }
  };

  const loadEventsForMonth = async () => {
    try {
      setLoading(true);
      setError('');

      // Calcular início e fim do mês
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const timeMin = startOfMonth.toISOString();
      const timeMax = endOfMonth.toISOString();

      const response = await fetch(
        `/api/calendar/public?publicToken=${token}&timeMin=${timeMin}&timeMax=${timeMax}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao carregar eventos');
      }

      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Falha ao carregar eventos');
    } finally {
      setLoading(false);
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

  const getDateRange = () => {
    if (!calendarInfo) return '';
    const start = new Date(calendarInfo.timeRange.timeMin);
    const end = new Date(calendarInfo.timeRange.timeMax);
    return `${start.toLocaleDateString('pt-BR')} - ${end.toLocaleDateString('pt-BR')}`;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      const eventDate = event.start?.dateTime ? 
        new Date(event.start.dateTime).toISOString().split('T')[0] :
        event.start?.date;
      return eventDate === dateStr;
    });
  };

  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const selectedDateEvents = getEventsForDate(selectedDate);

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
        📅 Agenda Pública
      </Typography>

      {/* Erro */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Calendário */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              {/* Cabeçalho do calendário */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">
                  {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      const today = new Date();
                      setSelectedDate(today);
                      setCurrentMonth(today);
                    }}
                    startIcon={<Iconify icon="eva:calendar-fill" />}
                  >
                    Hoje
                  </Button>
                  <IconButton onClick={() => navigateMonth('prev')} size="small">
                    <Iconify icon="eva:arrow-ios-back-fill" />
                  </IconButton>
                  <IconButton onClick={() => navigateMonth('next')} size="small">
                    <Iconify icon="eva:arrow-ios-forward-fill" />
                  </IconButton>
                </Box>
              </Box>

              {/* Dias da semana */}
              <Grid container sx={{ mb: 1 }}>
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                  <Grid item xs key={day}>
                    <Typography variant="body2" sx={{ textAlign: 'center', fontWeight: 600, py: 1 }}>
                      {day}
                    </Typography>
                  </Grid>
                ))}
              </Grid>

              {/* Dias do calendário */}
              <Grid container>
                {getCalendarDays().map((day, index) => {
                  const dayEvents = getEventsForDate(day);
                  const hasEvents = dayEvents.length > 0;
                  
                  return (
                    <Grid item xs key={index}>
                      <Paper
                        elevation={isSelected(day) ? 3 : 0}
                        sx={{
                          p: 1,
                          m: 0.5,
                          minHeight: 80,
                          cursor: 'pointer',
                          border: isToday(day) ? '2px solid' : '1px solid',
                          borderColor: isToday(day) ? 'primary.main' : 'divider',
                          bgcolor: isSelected(day) ? 'primary.main' : 
                                  isToday(day) ? 'primary.light' : 'background.paper',
                          color: isSelected(day) ? 'primary.contrastText' : 
                                 isCurrentMonth(day) ? 'text.primary' : 'text.disabled',
                          '&:hover': {
                            bgcolor: isSelected(day) ? 'primary.dark' : 'action.hover',
                          },
                        }}
                        onClick={() => setSelectedDate(day)}
                      >
                        <Typography variant="body2" sx={{ fontWeight: isToday(day) ? 600 : 400 }}>
                          {day.getDate()}
                        </Typography>
                        
                        {/* Indicador de eventos */}
                        {hasEvents && (
                          <Box sx={{ mt: 0.5 }}>
                            {dayEvents.slice(0, 2).map((event, eventIndex) => (
                              <Box
                                key={eventIndex}
                                sx={{
                                  bgcolor: isSelected(day) ? 'rgba(255,255,255,0.3)' : 'primary.main',
                                  color: isSelected(day) ? 'primary.contrastText' : 'primary.contrastText',
                                  borderRadius: 0.5,
                                  px: 0.5,
                                  py: 0.25,
                                  mb: 0.25,
                                  fontSize: '0.7rem',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {event.summary || 'Evento'}
                              </Box>
                            ))}
                            {dayEvents.length > 2 && (
                              <Typography variant="caption" sx={{ fontSize: '0.6rem' }}>
                                +{dayEvents.length - 2} mais
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Eventos do dia selecionado */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="h6">
                  {formatDate(selectedDate.toISOString())}
                </Typography>
                {selectedDate.toDateString() === new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString() && (
                  <Chip label="Amanhã" color="primary" size="small" />
                )}
                {selectedDate.toDateString() === new Date().toDateString() && (
                  <Chip label="Hoje" color="success" size="small" />
                )}
              </Box>
              
              {loading && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <LinearProgress sx={{ flex: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Carregando...
                  </Typography>
                </Box>
              )}

              {selectedDateEvents.length > 0 ? (
                <List>
                  {selectedDateEvents.map((event, index) => (
                    <div key={event.id || index}>
                      <ListItem sx={{ py: 1.5, px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: 'primary.main',
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {event.summary || 'Sem título'}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                🕐 {formatDateTime(event.start?.dateTime || event.start?.date)}
                              </Typography>
                              {event.location && (
                                <Typography variant="body2" color="text.secondary">
                                  📍 {event.location}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < selectedDateEvents.length - 1 && <Divider />}
                    </div>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Iconify icon="eva:calendar-outline" width={48} sx={{ color: 'text.secondary', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Nenhum evento neste dia
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
