import { Heading, VStack } from '@chakra-ui/react';

import CalendarHeader from './CalendarHeader.tsx';
import MonthEventView from './MonthEventView.tsx';
import WeekEventView from './WeekEventView.tsx';
import { Event } from '../types.ts';

interface CalendarViewProps {
  view: 'week' | 'month';
  setView: (view: 'week' | 'month') => void;
  navigate: (direction: 'prev' | 'next') => void;
  currentDate: Date;
  filteredEvents: Event[];
  notifiedEvents: string[];
  holidays: Record<string, string>;
}

const CalendarView = ({
  view,
  currentDate,
  filteredEvents,
  notifiedEvents,
  holidays,
  setView,
  navigate,
}: CalendarViewProps) => (
  <VStack flex={1} spacing={5} align='stretch'>
    <Heading>일정 보기</Heading>
    <CalendarHeader view={view} onViewChange={setView} onNavigate={navigate} />

    {view === 'week' && (
      <WeekEventView
        currentDate={currentDate}
        filteredEvents={filteredEvents}
        notifiedEvents={notifiedEvents}
      />
    )}
    {view === 'month' && (
      <MonthEventView
        currentDate={currentDate}
        filteredEvents={filteredEvents}
        notifiedEvents={notifiedEvents}
        holidays={holidays}
      />
    )}
  </VStack>
);

export default CalendarView;
