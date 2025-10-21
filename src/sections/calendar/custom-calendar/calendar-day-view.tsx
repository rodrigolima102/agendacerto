'use client';

import type { ICalendarEvent } from 'src/types/calendar';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  events: ICalendarEvent[];
  selectedDate: Date;
  onClickEvent?: (eventId: string) => void;
};

export function CalendarDayView({ events, selectedDate, onClickEvent }: Props) {
  const getEventsForDate = () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return events
      .filter((event) => {
        const eventStart = new Date(event.start);
        const eventDate = eventStart.toISOString().split('T')[0];
        return eventDate === dateStr;
      })
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  };

  const formatDateTime = (dateString: string | number) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = () => {
    const isToday = selectedDate.toDateString() === new Date().toDateString();
    const isTomorrow =
      selectedDate.toDateString() ===
      new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString();

    return {
      formatted: selectedDate.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      isToday,
      isTomorrow,
    };
  };

  const dateInfo = formatDate();
  const dayEvents = getEventsForDate();

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Typography variant="h5" sx={{ textTransform: 'capitalize' }}>
          {dateInfo.formatted}
        </Typography>
        {dateInfo.isToday && <Chip label="Hoje" color="success" size="small" />}
        {dateInfo.isTomorrow && <Chip label="Amanhã" color="primary" size="small" />}
      </Box>

      {dayEvents.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {dayEvents.map((event, index) => (
            <Card
              key={event.id}
              onClick={() => onClickEvent?.(event.id)}
              sx={{
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <ListItem
                sx={{
                  py: 2.5,
                  px: 3,
                  borderLeft: `6px solid ${event.color}`,
                }}
              >
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: event.color,
                    mr: 2,
                    flexShrink: 0,
                  }}
                />

                <ListItemText
                  primary={
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {event.title || 'Sem título'}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      {event.allDay ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Iconify icon="eva:clock-outline" width={18} />
                          <Typography variant="body2" color="primary.main" fontWeight={600}>
                            Dia inteiro
                          </Typography>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Iconify icon="eva:clock-outline" width={18} />
                          <Typography variant="body2" color="text.secondary">
                            {formatDateTime(event.start)} - {formatDateTime(event.end)}
                          </Typography>
                        </Box>
                      )}

                      {event.description && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1, whiteSpace: 'pre-line' }}
                        >
                          {event.description}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>

              {index < dayEvents.length - 1 && <Divider />}
            </Card>
          ))}
        </Box>
      ) : (
        <Card sx={{ p: 6, textAlign: 'center' }}>
          <Iconify
            icon="eva:calendar-outline"
            width={64}
            sx={{ color: 'text.disabled', mb: 2, mx: 'auto' }}
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nenhum evento agendado
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Este dia está livre
          </Typography>
        </Card>
      )}
    </Box>
  );
}


