import type { UseSetStateReturn } from 'minimal-shared/hooks';
import type { IDatePickerControl } from 'src/types/common';
import type { ICalendarEvent, ICalendarFilters, IGoogleCalendar } from 'src/types/calendar';

import { useCallback } from 'react';
import { orderBy } from 'es-toolkit';

import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import CircularProgress from '@mui/material/CircularProgress';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { fDate, fDateTime } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ColorPicker } from 'src/components/color-utils';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  canReset: boolean;
  dateError: boolean;
  onClose: () => void;
  colorOptions: string[];
  events: ICalendarEvent[];
  onClickEvent: (eventId: string) => void;
  filters: UseSetStateReturn<ICalendarFilters>;
  calendars: IGoogleCalendar[];
  calendarsLoading: boolean;
};

export function CalendarFilters({
  open,
  events,
  onClose,
  filters,
  canReset,
  dateError,
  colorOptions,
  onClickEvent,
  calendars,
  calendarsLoading,
}: Props) {
  const { state: currentFilters, setState: updateFilters, resetState: resetFilters } = filters;

  const handleFilterColors = useCallback(
    (newValue: string | string[]) => {
      updateFilters({ colors: newValue as string[] });
    },
    [updateFilters]
  );

  const handleFilterStartDate = useCallback(
    (newValue: IDatePickerControl) => {
      updateFilters({ startDate: newValue });
    },
    [updateFilters]
  );

  const handleFilterEndDate = useCallback(
    (newValue: IDatePickerControl) => {
      updateFilters({ endDate: newValue });
    },
    [updateFilters]
  );

  const handleToggleCalendar = useCallback(
    (calendarId: string) => {
      const currentIds = currentFilters.calendarIds;
      const newIds = currentIds.includes(calendarId)
        ? currentIds.filter((id) => id !== calendarId)
        : [...currentIds, calendarId];
      
      updateFilters({ calendarIds: newIds });
    },
    [currentFilters.calendarIds, updateFilters]
  );

  const renderHead = () => (
    <>
      <Box
        sx={{
          py: 2,
          pr: 1,
          pl: 2.5,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Filters
        </Typography>

        <Tooltip title="Reset">
          <IconButton onClick={() => resetFilters()}>
            <Badge color="error" variant="dot" invisible={!canReset}>
              <Iconify icon="solar:restart-bold" />
            </Badge>
          </IconButton>
        </Tooltip>

        <IconButton onClick={onClose}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </Box>

      <Divider sx={{ borderStyle: 'dashed' }} />
    </>
  );

  const renderColors = () => (
    <Box
      sx={{
        my: 3,
        px: 2.5,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Colors
      </Typography>
      <ColorPicker
        options={colorOptions}
        value={currentFilters.colors}
        onChange={handleFilterColors}
      />
    </Box>
  );

  const renderDateRange = () => (
    <Box
      sx={{
        mb: 3,
        px: 2.5,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
        Range
      </Typography>

      <DatePicker
        label="Start date"
        value={currentFilters.startDate}
        onChange={handleFilterStartDate}
        sx={{ mb: 2.5 }}
      />

      <DatePicker
        label="End date"
        value={currentFilters.endDate}
        onChange={handleFilterEndDate}
        slotProps={{
          textField: {
            error: dateError,
            helperText: dateError ? 'End date must be later than start date' : null,
          },
        }}
      />
    </Box>
  );

  const renderCalendars = () => (
    <Box
      sx={{
        mb: 3,
        px: 2.5,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
        Calendars {calendarsLoading && <CircularProgress size={16} sx={{ ml: 1 }} />}
      </Typography>

      {calendarsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : calendars.length === 0 ? (
        <Typography variant="body2" sx={{ color: 'text.secondary', py: 1 }}>
          No calendars available
        </Typography>
      ) : (
        <Box component="ul" sx={{ p: 0, m: 0 }}>
          {calendars.map((calendar) => (
            <ListItemButton
              key={calendar.id}
              onClick={() => handleToggleCalendar(calendar.id)}
              sx={{ 
                py: 1,
                px: 1.5,
                borderRadius: 1,
                mb: 0.5,
              }}
            >
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  backgroundColor: calendar.backgroundColor,
                  mr: 1.5,
                  flexShrink: 0,
                }}
              />
              <ListItemText
                primary={calendar.summary}
                secondary={calendar.primary ? 'Primary' : null}
                slotProps={{
                  primary: {
                    sx: { 
                      typography: 'body2',
                      fontWeight: calendar.primary ? 600 : 400,
                    },
                  },
                  secondary: {
                    sx: { typography: 'caption' },
                  },
                }}
              />
              <Checkbox
                size="small"
                checked={currentFilters.calendarIds.includes(calendar.id)}
                sx={{ p: 0 }}
              />
            </ListItemButton>
          ))}
        </Box>
      )}
    </Box>
  );

  const renderEvents = () => (
    <>
      <Typography variant="subtitle2" sx={{ px: 2.5, mb: 1 }}>
        Events ({events.length})
      </Typography>

      <Box component="ul">
        {orderBy(events, ['end'], ['desc']).map((event) => (
          <li key={event.id}>
            <ListItemButton
              onClick={() => onClickEvent(`${event.id}`)}
              sx={[
                (theme) => ({ py: 1.5, borderBottom: `dashed 1px ${theme.vars.palette.divider}` }),
              ]}
            >
              <Box
                sx={{
                  top: 16,
                  left: 0,
                  width: 0,
                  height: 0,
                  position: 'absolute',
                  borderRight: '10px solid transparent',
                  borderTop: `10px solid ${event.color}`,
                }}
              />

              <ListItemText
                primary={
                  event.allDay
                    ? fDate(event.start)
                    : `${fDateTime(event.start)} - ${fDateTime(event.end)}`
                }
                secondary={event.title}
                slotProps={{
                  primary: {
                    sx: { typography: 'caption', color: 'text.disabled' },
                  },
                  secondary: {
                    sx: { mt: 0.5, color: 'text.primary', typography: 'subtitle2' },
                  },
                }}
              />
            </ListItemButton>
          </li>
        ))}
      </Box>
    </>
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: { invisible: true },
        paper: { sx: { width: 320 } },
      }}
    >
      {renderHead()}

      <Scrollbar>
        {renderCalendars()}
        {renderColors()}
        {renderDateRange()}
        {renderEvents()}
      </Scrollbar>
    </Drawer>
  );
}
