import { beforeEach, describe } from 'vitest';

import { Event, EventForm } from '../../types';
import {
  calculateMaxEventCount,
  generateRepeatedEvents,
  getFilteredEvents,
} from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      date: '2024-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: 'event 1 description',
      location: 'event 1 location',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '이벤트 2',
      date: '2024-07-01',
      startTime: '12:00',
      endTime: '13:00',
      description: 'event 2 description',
      location: 'event 2 location',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '3',
      title: '이벤트 3',
      date: '2024-07-15',
      startTime: '09:00',
      endTime: '10:00',
      description: 'event 3 description',
      location: 'event 3 location',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '4',
      title: '이벤트 4',
      date: '2024-07-31',
      startTime: '12:00',
      endTime: '13:00',
      description: 'event 4 description',
      location: 'event 4 location',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const filteredEvents = getFilteredEvents(events, '이벤트 2', new Date('2024-07-01'), 'week');
    expect(filteredEvents).toEqual([events[1]]);
  });

  it('주간 뷰에서 2024-07-01 주의 이벤트만 반환한다', () => {
    const filteredEvents = getFilteredEvents(events, '', new Date('2024-07-01'), 'week');
    expect(filteredEvents).toEqual(events.slice(0, 2));
  });

  it('월간 뷰에서 2024년 7월의 모든 이벤트를 반환한다', () => {
    const filteredEvents = getFilteredEvents(events, '', new Date('2024-07-01'), 'month');
    expect(filteredEvents).toEqual(events);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const filteredEvents = getFilteredEvents(events, '이벤트', new Date('2024-07-01'), 'week');
    expect(filteredEvents).toEqual(events.slice(0, 2));
  });

  // @NOTE: 해당 테스트는 월간 뷰에서 적용을 해도 애매하다...
  // 다른 달의 이벤트가 포함되어 있을 수 있기 때문이다.
  // 또한 다른 달의 이벤트가 포함되어 있지않더라도 주간 뷰 필터링이 적용되면 전체 이벤트가 아닐 수도 있다.
  // 그렇게되면 상단의 '월간 뷰에서 2024년 7월의 모든 이벤트를 반환한다' 테스트와 중복되므로 제외한다.
  // it('검색어가 없을 때 모든 이벤트를 반환한다', () => {});

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const filteredEvents = getFilteredEvents(events, 'EVENT 2', new Date('2024-07-01'), 'week');
    expect(filteredEvents).toEqual([events[1]]);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const filteredEvents = getFilteredEvents(events, '', new Date('2024-07-31'), 'month');
    expect(filteredEvents).toEqual(events);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const filteredEvents = getFilteredEvents([], '', new Date('2024-07-01'), 'week');
    expect(filteredEvents).toEqual([]);
  });
});

describe('calculateMaxEventCount', () => {
  const eventData: Event = {
    id: '1',
    title: 'event title',
    date: '2024-07-01',
    startTime: '09:00',
    endTime: '10:00',
    description: 'event description',
    location: 'event location',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  beforeEach(() => {
    vi.setSystemTime(new Date('2024-07-01T00:00:00.000Z'));
  });

  it('반복 간격이 0이면 1을 반환한다.', () => {
    const eventCount = calculateMaxEventCount(eventData);
    expect(eventCount).toBe(1);
  });
  it('2025-06-30까지의 이벤트 개수를 반환하려면, 반복 유형이 매일이고 반복 간격이 1이며 종료일이 없어야 한다.', () => {
    const newEventData: Event = {
      ...eventData,
      repeat: { type: 'daily', interval: 1 },
    };
    const eventCount = calculateMaxEventCount(newEventData);
    expect(eventCount).toBe(365);
  });
  it('2025-04-30까지의 이벤트 개수를 반환하려면, 반복 유형이 매일이고 반복 간격이 1이며 종료일은 2025-04-30이어야 한다.', () => {
    const newEventData: Event = {
      ...eventData,
      repeat: { type: 'daily', interval: 1, endDate: '2025-04-30' },
    };
    const eventCount = calculateMaxEventCount(newEventData);
    expect(eventCount).toBe(304);
  });

  it('2025-04-30까지의 이벤트 개수를 반환하려면, 반복 유형이 매주이고 반복 간격이 1이며 종료일은 2025-04-30이어야 한다.', () => {
    const newEventData: Event = {
      ...eventData,
      repeat: { type: 'weekly', interval: 1, endDate: '2025-04-30' },
    };
    const eventCount = calculateMaxEventCount(newEventData);

    const startDate = new Date(newEventData.date);
    const endDate = new Date(`${newEventData.repeat.endDate as string}T23:59:59.000Z`);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
    expect(eventCount).toBe(diffWeeks);
  });
  it('2025-04-30까지의 이벤트 개수를 반환하려면, 반복 유형이 매월이고 반복 간격이 1이며 종료일은 2025-04-30이어야 한다.', () => {
    const newEventData: Event = {
      ...eventData,
      repeat: { type: 'monthly', interval: 1, endDate: '2025-04-30' },
    };
    const eventCount = calculateMaxEventCount(newEventData);

    const startDate = new Date(newEventData.date);
    const endDate = new Date(`${newEventData.repeat.endDate as string}T23:59:59.000Z`);
    const diffYears = endDate.getFullYear() - startDate.getFullYear();
    const diffMonths = diffYears * 12 + endDate.getMonth() - startDate.getMonth();
    expect(eventCount).toBe(diffMonths);
  });
  it('2025-04-30까지의 이벤트 개수를 반환하려면, 반복 유형이 매년이고 반복 간격이 1이며 종료일은 2025-04-30이어야 한다.', () => {
    const newEventData: Event = {
      ...eventData,
      repeat: { type: 'yearly', interval: 1, endDate: '2025-04-30' },
    };
    const eventCount = calculateMaxEventCount(newEventData);
    expect(eventCount).toBe(1);
  });
});

describe('generateRepeatedEvents', () => {
  const mockRepeatCount = 5;
  const mockEventForm: Omit<EventForm, 'repeat'> = {
    title: '새로운 회의',
    date: '2024-10-16',
    startTime: '09:00',
    endTime: '10:00',
    description: '새로운 팀 미팅',
    location: '회의실 A',
    category: '업무',
    notificationTime: 10,
  };
  it('반복 설정이 없는 이벤트는 자기 자신만을 반환한다.', () => {
    const newEventForm: EventForm = {
      ...mockEventForm,
      repeat: { type: 'none', interval: 0 },
    };

    const repeatedEvents = generateRepeatedEvents(newEventForm, 1);
    expect(repeatedEvents).toEqual([newEventForm]);
  });
  it('매일 반복 설정이 있는 이벤트는 반복 설정에 따라 이벤트 리스트를 반환한다.', () => {
    const newEventForm: EventForm = {
      ...mockEventForm,
      repeat: { type: 'daily', interval: 5 },
    };

    const repeatedEvents = generateRepeatedEvents(newEventForm, mockRepeatCount);
    expect(repeatedEvents).toHaveLength(5);
  });
  it('매주 반복 설정이 있는 이벤트는 반복 설정에 따라 이벤트 리스트를 반환한다.', () => {
    const newEventForm: EventForm = {
      ...mockEventForm,
      repeat: { type: 'weekly', interval: 3 },
    };

    const repeatedEvents = generateRepeatedEvents(newEventForm, mockRepeatCount);
    expect(repeatedEvents).toHaveLength(5);
  });
  it('매월 반복 설정이 있는 이벤트는 반복 설정에 따라 이벤트 리스트를 반환한다.', () => {
    const newEventForm: EventForm = {
      ...mockEventForm,
      repeat: { type: 'monthly', interval: 2 },
    };

    const repeatedEvents = generateRepeatedEvents(newEventForm, mockRepeatCount);
    expect(repeatedEvents).toHaveLength(5);
  });
  it('매년 반복 설정이 있는 이벤트는 반복 설정에 따라 이벤트 리스트를 반환한다.', () => {
    const newEventForm: EventForm = {
      ...mockEventForm,
      repeat: { type: 'yearly', interval: 1 },
    };

    const repeatedEvents = generateRepeatedEvents(newEventForm, mockRepeatCount);
    expect(repeatedEvents).toHaveLength(5);
  });
});
