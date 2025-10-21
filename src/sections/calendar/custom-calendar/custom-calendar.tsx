'use client';

import type { ICalendarEvent, ICalendarView } from 'src/types/calendar';

import Box from '@mui/material/Box';

import { CalendarDayView } from './calendar-day-view';
import { CalendarWeekView } from './calendar-week-view';
import { CalendarMonthGrid } from './calendar-month-grid';

// ----------------------------------------------------------------------

type Props = {
  view: ICalendarView;
  events: ICalendarEvent[];
  selectedDate: Date;
  currentMonth: Date;
  onSelectDate: (date: Date) => void;
  onClickEvent?: (eventId: string) => void;
};

export function CustomCalendar({
  view,
  events,
  selectedDate,
  currentMonth,
  onSelectDate,
  onClickEvent,
}: Props) {
  const renderView = () => {
    switch (view) {
      case 'dayGridMonth':
        return (
          <CalendarMonthGrid
            events={events}
            selectedDate={selectedDate}
            currentMonth={currentMonth}
            onSelectDate={onSelectDate}
            onClickEvent={onClickEvent}
          />
        );

      case 'timeGridWeek':
        return (
          <CalendarWeekView
            events={events}
            selectedDate={selectedDate}
            onClickEvent={onClickEvent}
          />
        );

      case 'timeGridDay':
        return (
          <CalendarDayView
            events={events}
            selectedDate={selectedDate}
            onClickEvent={onClickEvent}
          />
        );

      default:
        return (
          <CalendarMonthGrid
            events={events}
            selectedDate={selectedDate}
            currentMonth={currentMonth}
            onSelectDate={onSelectDate}
            onClickEvent={onClickEvent}
          />
        );
    }
  };

  return <Box sx={{ width: '100%', height: '100%' }}>{renderView()}</Box>;
}


