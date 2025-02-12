import { Event, RepeatType } from '../types.ts';

/**
 * 주어진 년도와 월의 일수를 반환합니다.
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * 주어진 날짜가 속한 주의 모든 날짜를 반환합니다.
 */
export function getWeekDates(date: Date): Date[] {
  const day = date.getDay();
  const diff = date.getDate() - day;
  const sunday = new Date(date.setDate(diff));
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const nextDate = new Date(sunday);
    nextDate.setDate(sunday.getDate() + i);
    weekDates.push(nextDate);
  }
  return weekDates;
}

export function getWeeksAtMonth(currentDate: Date) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month + 1);
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const weeks = [];

  const initWeek = () => Array(7).fill(null);

  let week: Array<number | null> = initWeek();

  for (let i = 0; i < firstDayOfMonth; i++) {
    week[i] = null;
  }

  for (const day of days) {
    const dayIndex = (firstDayOfMonth + day - 1) % 7;

    week[dayIndex] = day;
    if (dayIndex === 6 || day === daysInMonth) {
      weeks.push(week);
      week = initWeek();
    }
  }

  return weeks;
}

export function getEventsForDay(events: Event[], date: number): Event[] {
  return events.filter((event) => new Date(event.date).getDate() === date);
}

export function formatWeek(targetDate: Date) {
  const dayOfWeek = targetDate.getDay();
  const diffToThursday = 4 - dayOfWeek;
  const thursday = new Date(targetDate);
  thursday.setDate(targetDate.getDate() + diffToThursday);

  const year = thursday.getFullYear();
  const month = thursday.getMonth() + 1;

  const firstDayOfMonth = new Date(thursday.getFullYear(), thursday.getMonth(), 1);

  const firstThursday = new Date(firstDayOfMonth);
  firstThursday.setDate(1 + ((4 - firstDayOfMonth.getDay() + 7) % 7));

  const MS_PER_WEEK = 1000 * 60 * 60 * 24 * 7;
  const weekNumber: number =
    Math.floor((thursday.getTime() - firstThursday.getTime()) / MS_PER_WEEK) + 1;

  return `${year}년 ${month}월 ${weekNumber}주`;
}

/**
 * 주어진 날짜의 월 정보를 "YYYY년 M월" 형식으로 반환합니다.
 */
export function formatMonth(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return `${year}년 ${month}월`;
}

/**
 * 주어진 날짜가 특정 범위 내에 있는지 확인합니다.
 */
export function isDateInRange(date: Date, rangeStart: Date, rangeEnd: Date): boolean {
  return date >= rangeStart && date <= rangeEnd;
}

export function fillZero(value: number, size = 2) {
  return String(value).padStart(size, '0');
}

export function formatDate(currentDate: Date, day?: number) {
  return [
    currentDate.getFullYear(),
    fillZero(currentDate.getMonth() + 1),
    fillZero(day ?? currentDate.getDate()),
  ].join('-');
}

export function updateDate(direction: 'prev' | 'next', view: 'week' | 'month', prevDate: Date) {
  const newDate = new Date(prevDate);
  if (view === 'week') {
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
  } else if (view === 'month') {
    newDate.setDate(1); // 항상 1일로 설정
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
  }
  return newDate;
}

export function getDateUnit(dateType: RepeatType) {
  switch (dateType) {
    case 'daily':
      return '일';
    case 'weekly':
      return '주';
    case 'monthly':
      return '개월';
    case 'yearly':
      return '년';
    default:
      return null;
  }
}

export function getRepeatText(repeat: Omit<RepeatType, 'none'>) {
  switch (repeat) {
    case 'daily':
      return '매일';
    case 'weekly':
      return '매주';
    case 'monthly':
      return '매월';
    case 'yearly':
      return '매년';
  }
}

export function getAddedDate(date: Date, interval: number, dateType: RepeatType) {
  const newDate = new Date(date);
  if (dateType === 'daily') {
    newDate.setDate(date.getDate() + interval);
    return newDate;
  } else if (dateType === 'weekly') {
    newDate.setDate(date.getDate() + interval * 7);
    return newDate;
  } else if (dateType === 'monthly') {
    newDate.setMonth(date.getMonth() + interval);

    const originalDate = date.getDate();
    if (newDate.getDate() !== originalDate) {
      newDate.setDate(0);
    }

    return newDate;
  } else if (dateType === 'yearly') {
    newDate.setFullYear(date.getFullYear() + interval);
    return newDate;
  } else {
    return newDate;
  }
}
