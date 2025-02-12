import { describe } from 'vitest';

import { Event, RepeatType } from '../../types';
import {
  fillZero,
  formatDate,
  formatMonth,
  formatWeek,
  getAddedDate,
  getDateUnit,
  getDaysInMonth,
  getEventsForDay,
  getRepeatText,
  getWeekDates,
  getWeeksAtMonth,
  isDateInRange,
} from '../../utils/dateUtils';

describe('getDaysInMonth', () => {
  it('1월은 31일 수를 반환한다', () => {
    const days = getDaysInMonth(2024, 1);
    expect(days).toBe(31);
  });

  it('4월은 30일 일수를 반환한다', () => {
    const days = getDaysInMonth(2024, 4);
    expect(days).toBe(30);
  });

  it('윤년의 2월에 대해 29일을 반환한다', () => {
    const days = getDaysInMonth(2024, 2);
    expect(days).toBe(29);
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    const days = getDaysInMonth(2025, 2);
    expect(days).toBe(28);
  });

  it('유효하지 않은 월에 대해 적절히 처리한다', () => {
    const days = getDaysInMonth(2024, 13);
    expect(days).toBe(31);
  });
});
/**
 * 컴퓨터의 날짜는 0부터, 즉 일요일부터 시작한다.
 */
describe('getWeekDates', () => {
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const date = new Date('2024-07-10');
    const weekDates = getWeekDates(date);
    expect(weekDates).toEqual([
      new Date('2024-07-07'),
      new Date('2024-07-08'),
      new Date('2024-07-09'),
      new Date('2024-07-10'),
      new Date('2024-07-11'),
      new Date('2024-07-12'),
      new Date('2024-07-13'),
    ]);
  });

  it('주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const date = new Date('2024-07-01');
    const weekDates = getWeekDates(date);
    expect(weekDates).toEqual([
      new Date('2024-06-30'),
      new Date('2024-07-01'),
      new Date('2024-07-02'),
      new Date('2024-07-03'),
      new Date('2024-07-04'),
      new Date('2024-07-05'),
      new Date('2024-07-06'),
    ]);
  });

  it('주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const date = new Date('2024-07-21');
    const weekDates = getWeekDates(date);
    expect(weekDates).toEqual([
      new Date('2024-07-21'),
      new Date('2024-07-22'),
      new Date('2024-07-23'),
      new Date('2024-07-24'),
      new Date('2024-07-25'),
      new Date('2024-07-26'),
      new Date('2024-07-27'),
    ]);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    const date = new Date('2024-12-31');
    const weekDates = getWeekDates(date);
    expect(weekDates).toEqual([
      new Date('2024-12-29'),
      new Date('2024-12-30'),
      new Date('2024-12-31'),
      new Date('2025-01-01'),
      new Date('2025-01-02'),
      new Date('2025-01-03'),
      new Date('2025-01-04'),
    ]);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    const date = new Date('2025-01-01');
    const weekDates = getWeekDates(date);
    expect(weekDates).toEqual([
      new Date('2024-12-29'),
      new Date('2024-12-30'),
      new Date('2024-12-31'),
      new Date('2025-01-01'),
      new Date('2025-01-02'),
      new Date('2025-01-03'),
      new Date('2025-01-04'),
    ]);
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    const date = new Date('2024-02-29');
    const weekDates = getWeekDates(date);
    expect(weekDates).toEqual([
      new Date('2024-02-25'),
      new Date('2024-02-26'),
      new Date('2024-02-27'),
      new Date('2024-02-28'),
      new Date('2024-02-29'),
      new Date('2024-03-01'),
      new Date('2024-03-02'),
    ]);
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    const date = new Date('2024-07-31');
    const weekDates = getWeekDates(date);
    expect(weekDates).toEqual([
      new Date('2024-07-28'),
      new Date('2024-07-29'),
      new Date('2024-07-30'),
      new Date('2024-07-31'),
      new Date('2024-08-01'),
      new Date('2024-08-02'),
      new Date('2024-08-03'),
    ]);
  });
});

describe('getWeeksAtMonth', () => {
  it('2024년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const currentDate = new Date('2024-07-01');
    const weeks = getWeeksAtMonth(currentDate);
    expect(weeks).toEqual([
      [null, 1, 2, 3, 4, 5, 6],
      [7, 8, 9, 10, 11, 12, 13],
      [14, 15, 16, 17, 18, 19, 20],
      [21, 22, 23, 24, 25, 26, 27],
      [28, 29, 30, 31, null, null, null],
    ]);
  });
});

describe('getEventsForDay', () => {
  const events: Event[] = [
    {
      id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      title: '팀 회의',
      date: '2025-02-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
    {
      id: '09702fb3-a478-40b3-905e-9ab3c8849dcd',
      title: '점심 약속',
      date: '2025-02-21',
      startTime: '12:30',
      endTime: '13:30',
      description: '동료와 점심 식사',
      location: '회사 근처 식당',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
  ];
  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const result = getEventsForDay(events, 1);
    expect(result).toEqual([events[0]]);
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const result = getEventsForDay(events, 2);
    expect(result).toEqual([]);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const result = getEventsForDay(events, 0);
    expect(result).toEqual([]);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const result = getEventsForDay(events, 32);
    expect(result).toEqual([]);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2024-07-15');
    const formattedWeek = formatWeek(date);
    expect(formattedWeek).toBe('2024년 7월 3주');
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2024-07-01');
    const formattedWeek = formatWeek(date);
    expect(formattedWeek).toBe('2024년 7월 1주');
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2024-07-31');
    const formattedWeek = formatWeek(date);
    expect(formattedWeek).toBe('2024년 8월 1주');
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2024-12-31');
    const formattedWeek = formatWeek(date);
    expect(formattedWeek).toBe('2025년 1월 1주');
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2024-02-29');
    const formattedWeek = formatWeek(date);
    expect(formattedWeek).toBe('2024년 2월 5주');
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-02-28');
    const formattedWeek = formatWeek(date);
    expect(formattedWeek).toBe('2025년 2월 4주');
  });
});

describe('formatMonth', () => {
  it("2024년 7월 10일을 '2024년 7월'로 반환한다", () => {
    const date = new Date('2024-07-10');
    const formattedMonth = formatMonth(date);
    expect(formattedMonth).toBe('2024년 7월');
  });
});

describe('isDateInRange', () => {
  const rangeStart = new Date('2024-07-01');
  const rangeEnd = new Date('2024-07-31');

  it('범위 내의 날짜 2024-07-10에 대해 true를 반환한다', () => {
    const date = new Date('2024-07-10');
    const result = isDateInRange(date, rangeStart, rangeEnd);
    expect(result).toBe(true);
  });

  it('범위의 시작일 2024-07-01에 대해 true를 반환한다', () => {
    const date = new Date('2024-07-01');
    const result = isDateInRange(date, rangeStart, rangeEnd);
    expect(result).toBe(true);
  });

  it('범위의 종료일 2024-07-31에 대해 true를 반환한다', () => {
    const date = new Date('2024-07-31');
    const result = isDateInRange(date, rangeStart, rangeEnd);
    expect(result).toBe(true);
  });

  it('범위 이전의 날짜 2024-06-30에 대해 false를 반환한다', () => {
    const date = new Date('2024-06-30');
    const result = isDateInRange(date, rangeStart, rangeEnd);
    expect(result).toBe(false);
  });

  it('범위 이후의 날짜 2024-08-01에 대해 false를 반환한다', () => {
    const date = new Date('2024-08-01');
    const result = isDateInRange(date, rangeStart, rangeEnd);
    expect(result).toBe(false);
  });

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    const result = isDateInRange(new Date('2024-07-10'), rangeEnd, rangeStart);
    expect(result).toBe(false);
  });
});

describe('fillZero', () => {
  test("5를 2자리로 변환하면 '05'를 반환한다", () => {
    const result = fillZero(5, 2);
    expect(result).toBe('05');
  });

  test("10을 2자리로 변환하면 '10'을 반환한다", () => {
    const result = fillZero(10, 2);
    expect(result).toBe('10');
  });

  test("3을 3자리로 변환하면 '003'을 반환한다", () => {
    const result = fillZero(3, 3);
    expect(result).toBe('003');
  });

  test("100을 2자리로 변환하면 '100'을 반환한다", () => {
    const result = fillZero(100, 2);
    expect(result).toBe('100');
  });

  test("0을 2자리로 변환하면 '00'을 반환한다", () => {
    const result = fillZero(0, 2);
    expect(result).toBe('00');
  });

  test("1을 5자리로 변환하면 '00001'을 반환한다", () => {
    const result = fillZero(1, 5);
    expect(result).toBe('00001');
  });

  test("소수점이 있는 3.14를 5자리로 변환하면 '03.14'를 반환한다", () => {
    const result = fillZero(3.14, 5);
    expect(result).toBe('03.14');
  });

  test('size 파라미터를 생략하면 기본값 2를 사용한다', () => {
    const result = fillZero(5);
    expect(result).toBe('05');
  });

  test('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    const result = fillZero(1234, 2);
    expect(result).toBe('1234');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    const currentDate = new Date('2024-07-10');
    const formattedDate = formatDate(currentDate);
    expect(formattedDate).toBe('2024-07-10');
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    const currentDate = new Date('2024-07-10');
    const formattedDate = formatDate(currentDate, 15);
    expect(formattedDate).toBe('2024-07-15');
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const currentDate = new Date('2024-02-10');
    const formattedDate = formatDate(currentDate);
    expect(formattedDate).toBe('2024-02-10');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const currentDate = new Date('2024-02-05');
    const formattedDate = formatDate(currentDate);
    expect(formattedDate).toBe('2024-02-05');
  });
});

describe('getDateUnit', () => {
  it('매일 반복에 대한 단위를 반환한다', () => {
    const result = getDateUnit('daily');
    expect(result).toBe('일');
  });
});

describe('getRepeatText', () => {
  it('매일 반복에 대한 텍스트를 반환한다', () => {
    const result = getRepeatText('daily');
    expect(result).toBe('매일');
  });
  it('매주 반복에 대한 텍스트를 반환한다', () => {
    const result = getRepeatText('weekly');
    expect(result).toBe('매주');
  });
});

describe('getAddedDate', () => {
  const date = new Date('2024-07-31');
  const interval = 1;
  it('반복 유형이 없을 경우 날짜를 그대로 반환한다.', () => {
    const type: RepeatType = 'none';
    const newDate = getAddedDate(date, interval, type);
    expect(newDate).toEqual(date);
  });
  it('다음 날의 날짜를 반환하려면 반복 유형이 "일"이 되어야 한다.', () => {
    const type: RepeatType = 'daily';
    const newDate = getAddedDate(date, interval, type);
    expect(newDate).toEqual(new Date('2024-08-01'));
  });
  it('다음 주의 날짜를 반환하려면 반복 유형이 "주"가 되어야 한다.', () => {
    const type: RepeatType = 'weekly';
    const newDate = getAddedDate(date, interval, type);
    expect(newDate).toEqual(new Date('2024-08-07'));
  });
  it('다음 달의 날짜를 반환하려면 반복 유형이 "월"이 되어야 한다.', () => {
    const type: RepeatType = 'monthly';
    const newDate = getAddedDate(date, interval, type);
    expect(newDate).toEqual(new Date('2024-08-31'));
  });
  it('다음 달의 날짜를 반환할 때, 다음 달이 이번 달보다 적은 날짜일 때 다음 달의 마지막 날을 반환한다.', () => {
    const date = new Date('2024-01-31');
    const type: RepeatType = 'monthly';
    const newDate = getAddedDate(date, interval, type);
    expect(newDate).toEqual(new Date('2024-02-29'));
  });
  it('다음 달의 날짜를 반환할 때, 다음 달이 이번 달보다 많은 날짜일 때 다음 달의 같은 날짜를 반환한다.', () => {
    const date = new Date('2024-04-30');
    const type: RepeatType = 'monthly';
    const newDate = getAddedDate(date, interval, type);
    expect(newDate).toEqual(new Date('2024-05-30'));
  });
  it('다음 해의 날짜를 반환하려면 반복 유형이 "년"이 되어야 한다.', () => {
    const type: RepeatType = 'yearly';
    const newDate = getAddedDate(date, interval, type);
    expect(newDate).toEqual(new Date('2025-07-31'));
  });
});
