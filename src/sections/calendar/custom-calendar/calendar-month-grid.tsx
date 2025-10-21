'use client';

import type { ICalendarEvent } from 'src/types/calendar';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

type Props = {
  events: ICalendarEvent[];
  selectedDate: Date;
  currentMonth: Date;
  onSelectDate: (date: Date) => void;
  onClickEvent?: (eventId: string) => void;
};

export function CalendarMonthGrid({
  events,
  selectedDate,
  currentMonth,
  onSelectDate,
  onClickEvent,
}: Props) {
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
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

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter((event) => {
      const eventStart = new Date(event.start);
      const eventDate = eventStart.toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => date.toDateString() === selectedDate.toDateString();

  const isCurrentMonth = (date: Date) => date.getMonth() === currentMonth.getMonth();

  return (
    <Box>
      {/* Dias da semana */}
      <Grid container sx={{ mb: 1 }}>
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
          <Grid item xs key={day}>
            <Typography
              variant="body2"
              sx={{ textAlign: 'center', fontWeight: 600, py: 1, color: 'text.secondary' }}
            >
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
                  minHeight: 100,
                  cursor: 'pointer',
                  border: isToday(day) ? '2px solid' : '1px solid',
                  borderColor: isToday(day) ? 'primary.main' : 'divider',
                  bgcolor: isSelected(day)
                    ? 'primary.main'
                    : isToday(day)
                      ? 'primary.lighter'
                      : 'background.paper',
                  color: isSelected(day)
                    ? 'primary.contrastText'
                    : isCurrentMonth(day)
                      ? 'text.primary'
                      : 'text.disabled',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: isSelected(day) ? 'primary.dark' : 'action.hover',
                    transform: 'translateY(-2px)',
                    boxShadow: 2,
                  },
                }}
                onClick={() => onSelectDate(day)}
              >
                <Typography variant="body2" sx={{ fontWeight: isToday(day) ? 700 : 400, mb: 0.5 }}>
                  {day.getDate()}
                </Typography>

                {/* Indicador de eventos */}
                {hasEvents && (
                  <Box sx={{ mt: 0.5 }}>
                    {dayEvents.slice(0, 3).map((event, eventIndex) => (
                      <Box
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onClickEvent?.(event.id);
                        }}
                        sx={{
                          bgcolor: isSelected(day) ? 'rgba(255,255,255,0.3)' : event.color,
                          color: 'common.white',
                          borderRadius: 0.5,
                          px: 0.5,
                          py: 0.25,
                          mb: 0.25,
                          fontSize: '0.7rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          cursor: 'pointer',
                          '&:hover': {
                            opacity: 0.8,
                          },
                        }}
                      >
                        {event.title || 'Evento'}
                      </Box>
                    ))}
                    {dayEvents.length > 3 && (
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          color: isSelected(day) ? 'inherit' : 'primary.main',
                        }}
                      >
                        +{dayEvents.length - 3} mais
                      </Typography>
                    )}
                  </Box>
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}


