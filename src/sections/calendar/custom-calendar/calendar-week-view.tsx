'use client';

import type { ICalendarEvent } from 'src/types/calendar';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

// ----------------------------------------------------------------------

type Props = {
  events: ICalendarEvent[];
  selectedDate: Date;
  onClickEvent?: (eventId: string) => void;
};

export function CalendarWeekView({ events, selectedDate, onClickEvent }: Props) {
  const getWeekDays = () => {
    const days = [];
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(day.getDate() + i);
      days.push(day);
    }

    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter((event) => {
      const eventStart = new Date(event.start);
      const eventDate = eventStart.toISOString().split('T')[0];
      return eventDate === dateStr;
    }).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const formatTime = (dateString: string | number) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const weekDays = getWeekDays();

  return (
    <Grid container spacing={1}>
      {weekDays.map((day) => {
        const dayEvents = getEventsForDate(day);
        const isTodayDate = isToday(day);

        return (
          <Grid item xs={12} sm={6} md key={day.toISOString()}>
            <Paper
              sx={{
                p: 2,
                height: '100%',
                minHeight: 400,
                border: isTodayDate ? '2px solid' : '1px solid',
                borderColor: isTodayDate ? 'primary.main' : 'divider',
                bgcolor: isTodayDate ? 'primary.lighter' : 'background.paper',
              }}
            >
              <Box sx={{ mb: 2, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: isTodayDate ? 700 : 500,
                    color: isTodayDate ? 'primary.main' : 'text.primary',
                  }}
                >
                  {day.getDate()}
                </Typography>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {dayEvents.length > 0 ? (
                  dayEvents.map((event) => (
                    <Paper
                      key={event.id}
                      elevation={1}
                      onClick={() => onClickEvent?.(event.id)}
                      sx={{
                        p: 1.5,
                        cursor: 'pointer',
                        borderLeft: `4px solid ${event.color}`,
                        '&:hover': {
                          bgcolor: 'action.hover',
                          transform: 'translateX(4px)',
                          transition: 'all 0.2s',
                        },
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {event.title || 'Sem título'}
                      </Typography>
                      {!event.allDay && (
                        <Typography variant="caption" color="text.secondary">
                          {formatTime(event.start)} - {formatTime(event.end)}
                        </Typography>
                      )}
                      {event.allDay && (
                        <Typography variant="caption" color="primary.main">
                          Dia inteiro
                        </Typography>
                      )}
                    </Paper>
                  ))
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: 'center', py: 4 }}
                  >
                    Nenhum evento
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
}


