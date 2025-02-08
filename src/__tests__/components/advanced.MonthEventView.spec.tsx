import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';

import MonthEventView from '../../components/MonthEventView.tsx';
import { Event } from '../../types.ts';
import { formatMonth } from '../../utils/dateUtils.ts';

const mockEvents: Event[] = [
  {
    id: '1',
    title: '테스트 이벤트 1',
    date: '2024-04-18',
    startTime: '10:00',
    endTime: '11:00',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  },
  {
    id: '2',
    title: '테스트 이벤트 2',
    date: '2024-04-19',
    startTime: '14:00',
    endTime: '15:00',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  },
];

const mockHolidays: Record<string, string> = {
  '2024-04-18': '휴일 1',
};

describe('<MonthEventView />', () => {
  it('현재 날짜에 해당하는 월과 요일이 올바르게 표시되는가', () => {
    const currentDate = new Date('2024-04-20');
    render(
      <ChakraProvider>
        <MonthEventView
          currentDate={currentDate}
          filteredEvents={[]}
          notifiedEvents={[]}
          holidays={{}}
        />
      </ChakraProvider>,
    );

    const expectedMonth = formatMonth(currentDate);
    expect(screen.getByText(expectedMonth)).toBeInTheDocument();

    const weekDays = ['월', '화', '수', '목', '금', '토', '일'];
    weekDays.forEach((day) => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  it('필터링된 이벤트가 올바르게 표시되는가', () => {
    const currentDate = new Date('2024-04-20');
    render(
      <ChakraProvider>
        <MonthEventView
          currentDate={currentDate}
          filteredEvents={mockEvents}
          notifiedEvents={[]}
          holidays={{}}
        />
      </ChakraProvider>,
    );

    expect(screen.getByText('테스트 이벤트 1')).toBeInTheDocument();
    expect(screen.getByText('테스트 이벤트 2')).toBeInTheDocument();
  });

  it('알림 설정된 이벤트는 BellIcon과 함께 표시되는가', () => {
    const currentDate = new Date('2024-04-20');
    render(
      <ChakraProvider>
        <MonthEventView
          currentDate={currentDate}
          filteredEvents={mockEvents}
          notifiedEvents={['1']}
          holidays={{}}
        />
      </ChakraProvider>,
    );
    expect(screen.getByTestId('BellIcon')).toBeVisible();
  });

  it('휴일이 올바르게 표시되는가', () => {
    const currentDate = new Date('2024-04-18');
    render(
      <ChakraProvider>
        <MonthEventView
          currentDate={currentDate}
          filteredEvents={[]}
          notifiedEvents={[]}
          holidays={mockHolidays}
        />
      </ChakraProvider>,
    );
    expect(screen.getByText('휴일 1')).toBeInTheDocument();
  });
});
