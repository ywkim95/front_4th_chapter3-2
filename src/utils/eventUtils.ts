import { Event, EventForm } from '../types';
import { getWeekDates, isDateInRange } from './dateUtils';
import { useEventForm } from '../hooks/useEventForm.ts';

function filterEventsByDateRange(events: Event[], start: Date, end: Date): Event[] {
  return events.filter((event) => {
    const eventDate = new Date(event.date);
    return isDateInRange(eventDate, start, end);
  });
}

function containsTerm(target: string, term: string) {
  return target.toLowerCase().includes(term.toLowerCase());
}

function searchEvents(events: Event[], term: string) {
  return events.filter(
    ({ title, description, location }) =>
      containsTerm(title, term) || containsTerm(description, term) || containsTerm(location, term)
  );
}

function filterEventsByDateRangeAtWeek(events: Event[], currentDate: Date) {
  const weekDates = getWeekDates(currentDate);
  return filterEventsByDateRange(events, weekDates[0], weekDates[6]);
}

function filterEventsByDateRangeAtMonth(events: Event[], currentDate: Date) {
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);
  return filterEventsByDateRange(events, monthStart, monthEnd);
}

export function getFilteredEvents(
  events: Event[],
  searchTerm: string,
  currentDate: Date,
  view: 'week' | 'month'
): Event[] {
  const searchedEvents = searchEvents(events, searchTerm);

  if (view === 'week') {
    return filterEventsByDateRangeAtWeek(searchedEvents, currentDate);
  }

  if (view === 'month') {
    return filterEventsByDateRangeAtMonth(searchedEvents, currentDate);
  }

  return searchedEvents;
}

export function getEventData(eventForm: ReturnType<typeof useEventForm>): Event | EventForm {
  return {
    id: eventForm.editingEvent ? eventForm.editingEvent.id : undefined,
    title: eventForm.title,
    date: eventForm.date,
    startTime: eventForm.startTime,
    endTime: eventForm.endTime,
    description: eventForm.description,
    location: eventForm.location,
    category: eventForm.category,
    repeat: {
      type: eventForm.isRepeating ? eventForm.repeatType : 'none',
      interval: eventForm.repeatInterval,
      endDate: eventForm.repeatEndDate || undefined,
    },
    notificationTime: eventForm.notificationTime,
  };
}

export function calculateMaxEventCount(eventData: Event | EventForm): number {
  const MAX_INTERVAL_DATE = '2025-06-30';
  if (eventData.repeat.type === 'none') {
    return 1;
  }
  const start = new Date();
  const end = new Date(eventData.repeat.endDate ?? MAX_INTERVAL_DATE);
  let count = 0;
  while (start < end) {
    count++;
    start.setDate(start.getDate() + eventData.repeat.interval);
    console.log(start);
  }

  return count;
}
