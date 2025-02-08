import { beforeEach } from 'vitest';

import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

let event: Event;
beforeEach(() => {
  event = {
    id: '1',
    title: '기존 회의',
    date: '2024-07-01',
    startTime: '14:30',
    endTime: '15:30',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };
});

describe('parseDateTime', () => {
  it('2024-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const date = parseDateTime('2024-07-01', '14:30');
    expect(date).toEqual(new Date('2024-07-01T14:30'));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const date = parseDateTime('2024-07-32', '14:30');
    expect(date).toEqual(new Date('Invalid Date'));
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const date = parseDateTime('2024-07-01', '25:30');
    expect(date).toEqual(new Date('Invalid Date'));
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const date = parseDateTime('', '14:30');
    expect(date).toEqual(new Date('Invalid Date'));
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const dateRange = convertEventToDateRange(event);
    expect(dateRange).toEqual({
      start: new Date('2024-07-01T14:30'),
      end: new Date('2024-07-01T15:30'),
    });
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    event.date = '2024-07-32';
    const dateRange = convertEventToDateRange(event);
    expect(dateRange).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    event.startTime = '25:30';
    event.endTime = '26:30';
    const dateRange = convertEventToDateRange(event);
    expect(dateRange).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1 = {
      ...event,
      date: '2024-07-01',
      startTime: '14:00',
      endTime: '15:00',
    };
    const event2 = {
      ...event,
      date: '2024-07-01',
      startTime: '14:30',
      endTime: '15:30',
    };

    expect(isOverlapping(event1, event2)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1 = {
      ...event,
      date: '2024-07-01',
      startTime: '14:00',
      endTime: '15:00',
    };
    const event2 = {
      ...event,
      date: '2024-07-01',
      startTime: '15:00',
      endTime: '16:00',
    };

    expect(isOverlapping(event1, event2)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const events: Event[] = [
      {
        ...event,
        id: '2',
        date: '2024-07-01',
        startTime: '14:00',
        endTime: '15:00',
      },
      {
        ...event,
        id: '3',
        date: '2024-07-01',
        startTime: '15:30',
        endTime: '16:30',
      },
    ];

    const overlappingEvents = findOverlappingEvents(event, events);
    expect(overlappingEvents).toEqual([events[0]]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const events: Event[] = [
      {
        ...event,
        id: '2',
        date: '2024-07-01',
        startTime: '16:00',
        endTime: '17:00',
      },
      {
        ...event,
        id: '3',
        date: '2024-07-01',
        startTime: '17:00',
        endTime: '18:00',
      },
    ];

    const overlappingEvents = findOverlappingEvents(event, events);
    expect(overlappingEvents).toEqual([]);
  });
});
