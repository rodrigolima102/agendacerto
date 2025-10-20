'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';

import { Iconify } from 'src/components/iconify';
import type { GoogleCalendarEvent } from 'src/types/google-auth';

// ----------------------------------------------------------------------

type EventModalProps = {
  open: boolean;
  event: GoogleCalendarEvent | null;
  onClose: () => void;
  onSave: (event: Partial<GoogleCalendarEvent>) => Promise<void>;
  onDelete: (eventId: string) => Promise<void>;
  calendars: Array<{
    id: string;
    summary: string;
    description: string;
    primary: boolean;
    accessRole: string;
    backgroundColor: string;
    foregroundColor: string;
  }>;
  selectedCalendarId: string;
  onCalendarChange: (calendarId: string) => void;
  allEvents: GoogleCalendarEvent[];
};

export function EventModal({
  open,
  event,
  onClose,
  onSave,
  onDelete,
  calendars,
  selectedCalendarId,
  onCalendarChange,
  allEvents,
}: EventModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [calendarId, setCalendarId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Preencher campos quando o evento mudar
  useEffect(() => {
    if (event) {
      setTitle(event.summary || '');
      setDescription(event.description || '');
      setCalendarId(selectedCalendarId);

      // Processar data/hora de início
      if (event.start?.dateTime) {
        const startDateTime = new Date(event.start.dateTime);
        setStartDate(startDateTime.toISOString().split('T')[0]);
        setStartTime(startDateTime.toTimeString().slice(0, 5));
      } else if (event.start?.date) {
        setStartDate(event.start.date);
        setStartTime('09:00');
      }

      // Processar data/hora de fim
      if (event.end?.dateTime) {
        const endDateTime = new Date(event.end.dateTime);
        setEndDate(endDateTime.toISOString().split('T')[0]);
        setEndTime(endDateTime.toTimeString().slice(0, 5));
      } else if (event.end?.date) {
        setEndDate(event.end.date);
        setEndTime('10:00');
      }
    }
  }, [event, selectedCalendarId]);

  const checkTimeConflict = (startDateTime: Date, endDateTime: Date) => {
    // Filtrar eventos do mesmo calendário
    const calendarEvents = allEvents.filter(e => {
      // Se estamos editando um evento, excluir ele mesmo da verificação
      if (event?.id && e.id === event.id) return false;
      return true;
    });

    return calendarEvents.some(existingEvent => {
      const existingStart = existingEvent.start?.dateTime ? 
        new Date(existingEvent.start.dateTime) : 
        new Date(existingEvent.start?.date || '');
      
      const existingEnd = existingEvent.end?.dateTime ? 
        new Date(existingEvent.end.dateTime) : 
        new Date(existingEvent.end?.date || '');

      // Verificar se há sobreposição de horários
      return (
        (startDateTime >= existingStart && startDateTime < existingEnd) ||
        (endDateTime > existingStart && endDateTime <= existingEnd) ||
        (startDateTime <= existingStart && endDateTime >= existingEnd)
      );
    });
  };

  const handleSave = async () => {
    if (!startDate || !startTime || !endDate || !endTime) {
      setError('Data e horário são obrigatórios');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const startDateTime = new Date(`${startDate}T${startTime}:00`);
      const endDateTime = new Date(`${endDate}T${endTime}:00`);

      if (endDateTime <= startDateTime) {
        setError('Horário de fim deve ser posterior ao horário de início');
        return;
      }

      // Verificar conflito de horário
      if (checkTimeConflict(startDateTime, endDateTime)) {
        setError('Já existe um evento neste horário. Escolha outro horário.');
        return;
      }

      const updatedEvent: Partial<GoogleCalendarEvent> = {
        id: event?.id,
        summary: title.trim(),
        description: description.trim(),
        start: {
          dateTime: startDateTime.toISOString(),
        },
        end: {
          dateTime: endDateTime.toISOString(),
        },
      };

      await onSave(updatedEvent);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar evento');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!event?.id) return;

    if (window.confirm('Tem certeza que deseja excluir este evento?')) {
      try {
        setLoading(true);
        setError('');
        await onDelete(event.id);
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao excluir evento');
      } finally {
        setLoading(false);
      }
    }
  };

  const formatEventDate = (dateTime?: string) => {
    if (!dateTime) return '';
    return new Date(dateTime).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatEventTime = (dateTime?: string) => {
    if (!dateTime) return '';
    return new Date(dateTime).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: 0.5,
                bgcolor: 'primary.main',
              }}
            />
            <Typography variant="h6">
              {event ? 'Editar Evento' : 'Novo Evento'}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Informações do evento original */}
        {event && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Evento Original
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatEventDate(event.start?.dateTime || event.start?.date)} •{' '}
              {formatEventTime(event.start?.dateTime || event.start?.date)} –{' '}
              {formatEventTime(event.end?.dateTime || event.end?.date)}
            </Typography>
          </Box>
        )}

        {/* Título */}
        <TextField
          fullWidth
          label="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 2 }}
          placeholder="Nome do evento (opcional)"
        />

        {/* Descrição */}
        <TextField
          fullWidth
          label="Descrição"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={3}
          sx={{ mb: 2 }}
          placeholder="Descrição do evento (opcional)"
        />

        {/* Calendário */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Calendário</InputLabel>
          <Select
            value={calendarId}
            onChange={(e) => {
              setCalendarId(e.target.value);
              onCalendarChange(e.target.value);
            }}
            label="Calendário"
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

        {/* Data e horário de início */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Data de início"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ flex: 1 }}
          />
          <TextField
            label="Horário de início"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ flex: 1 }}
          />
        </Box>

        {/* Data e horário de fim */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Data de fim"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ flex: 1 }}
          />
          <TextField
            label="Horário de fim"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ flex: 1 }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          variant="outlined"
          color="error"
          onClick={handleDelete}
          disabled={loading || !event?.id}
          startIcon={<Iconify icon="eva:trash-2-fill" />}
        >
          Excluir
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading}
          startIcon={<Iconify icon="eva:checkmark-fill" />}
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
