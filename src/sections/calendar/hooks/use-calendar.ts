import type { Breakpoint } from '@mui/material/styles';
import type { ICalendarView, ICalendarRange } from 'src/types/calendar';

import { useRef, useState, useCallback } from 'react';

import useMediaQuery from '@mui/material/useMediaQuery';

// ----------------------------------------------------------------------

export type DateNavigationAction = 'today' | 'prev' | 'next';

export type UseCalendarReturn = {
  openForm: boolean;
  view: ICalendarView;
  title: string;
  selectedEventId: string;
  selectedRange: ICalendarRange | null;
  selectedDate: Date;
  currentMonth: Date;
  calendarRef: React.RefObject<any>;
  onOpenForm: () => void;
  onCloseForm: () => void;
  onClickEvent: (eventId: string) => void;
  onSelectRange: (start: Date, end: Date) => void;
  onChangeView: (view: ICalendarView) => void;
  onClickEventInFilters: (eventId: string) => void;
  onDateNavigation: (action: DateNavigationAction) => void;
  onSelectDate: (date: Date) => void;
};

export type UseCalendarProps = {
  breakpoint?: Breakpoint;
  defaultMobileView?: ICalendarView;
  defaultDesktopView?: ICalendarView;
};

export function useCalendar({
  breakpoint = 'sm',
  defaultMobileView = 'listWeek',
  defaultDesktopView = 'dayGridMonth',
}: UseCalendarProps = {}): UseCalendarReturn {
  const calendarRef = useRef<any>(null);
  const smUp = useMediaQuery((theme) => theme.breakpoints.up(breakpoint));

  const [openForm, setOpenForm] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [selectedRange, setSelectedRange] = useState<ICalendarRange>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const [view, setView] = useState<ICalendarView>(defaultDesktopView);

  const onOpenForm = useCallback(() => {
    setOpenForm(true);
  }, []);

  const onCloseForm = useCallback(() => {
    setOpenForm(false);
    setSelectedRange(null);
    setSelectedEventId('');
  }, []);

  const onChangeView = useCallback((newView: ICalendarView) => {
    setView(newView);
  }, []);

  const onSelectDate = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const getTitle = useCallback(() => {
    switch (view) {
      case 'dayGridMonth':
        return currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      
      case 'timeGridWeek': {
        const startOfWeek = new Date(selectedDate);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        
        return `${startOfWeek.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} - ${endOfWeek.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}`;
      }
      
      case 'timeGridDay':
        return selectedDate.toLocaleDateString('pt-BR', { 
          weekday: 'long', 
          day: '2-digit', 
          month: 'long', 
          year: 'numeric' 
        });
      
      default:
        return currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    }
  }, [view, currentMonth, selectedDate]);

  const onDateNavigation = useCallback(
    (action: DateNavigationAction) => {
      switch (action) {
        case 'today': {
          const today = new Date();
          setSelectedDate(today);
          setCurrentMonth(today);
          break;
        }
        case 'prev': {
          if (view === 'dayGridMonth') {
            const newMonth = new Date(currentMonth);
            newMonth.setMonth(newMonth.getMonth() - 1);
            setCurrentMonth(newMonth);
          } else if (view === 'timeGridWeek') {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() - 7);
            setSelectedDate(newDate);
          } else if (view === 'timeGridDay') {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() - 1);
            setSelectedDate(newDate);
          }
          break;
        }
        case 'next': {
          if (view === 'dayGridMonth') {
            const newMonth = new Date(currentMonth);
            newMonth.setMonth(newMonth.getMonth() + 1);
            setCurrentMonth(newMonth);
          } else if (view === 'timeGridWeek') {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() + 7);
            setSelectedDate(newDate);
          } else if (view === 'timeGridDay') {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() + 1);
            setSelectedDate(newDate);
          }
          break;
        }
        default:
          console.warn(`Unknown action: ${action}`);
      }
    },
    [view, currentMonth, selectedDate]
  );

  const onSelectRange = useCallback(
    (start: Date, end: Date) => {
      onOpenForm();
      setSelectedRange({ 
        start: start.toISOString(), 
        end: end.toISOString() 
      });
    },
    [onOpenForm]
  );

  const onClickEvent = useCallback(
    (eventId: string) => {
      onOpenForm();
      setSelectedEventId(eventId);
    },
    [onOpenForm]
  );

  const onClickEventInFilters = useCallback(
    (eventId: string) => {
      if (eventId) {
        onOpenForm();
        setSelectedEventId(eventId);
      }
    },
    [onOpenForm]
  );

  const title = getTitle();

  return {
    calendarRef,
    /********/
    view,
    title,
    /********/
    onClickEvent,
    onChangeView,
    onSelectRange,
    onDateNavigation,
    /********/
    openForm,
    onOpenForm,
    onCloseForm,
    /********/
    selectedRange,
    selectedEventId,
    /********/
    onClickEventInFilters,
    /********/
    selectedDate,
    currentMonth,
    onSelectDate,
  };
}
