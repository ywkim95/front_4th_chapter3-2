import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';

import WeekEventView from '../../components/WeekEventView.tsx';
import { Event } from '../../types.ts';
import { formatWeek } from '../../utils/dateUtils.ts';

const mockEvents: Event[] = [
  {
    id: '1',
    title: '테스트 이벤트 1',
    date: '2024-03-18',
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
    date: '2024-03-19',
    startTime: '14:00',
    endTime: '15:00',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  },
];
describe('<WeekEventView />', () => {
  it('현재 날짜에 해당하는 주와 요일이 올바르게 표시되는가', () => {
    const currentDate = new Date('2024-03-20');
    render(
      <ChakraProvider>
        <WeekEventView currentDate={currentDate} filteredEvents={[]} notifiedEvents={[]} />
      </ChakraProvider>
    );

    const expectedWeek = formatWeek(currentDate);
    expect(screen.getByText(expectedWeek)).toBeInTheDocument();

    const weekDays = ['월', '화', '수', '목', '금', '토', '일'];
    weekDays.forEach((day) => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  it('필터링된 이벤트가 올바르게 표시되는가', () => {
    const currentDate = new Date('2024-03-20');
    render(
      <ChakraProvider>
        <WeekEventView currentDate={currentDate} filteredEvents={mockEvents} notifiedEvents={[]} />
      </ChakraProvider>
    );

    expect(screen.getByText('테스트 이벤트 1')).toBeInTheDocument();
    expect(screen.getByText('테스트 이벤트 2')).toBeInTheDocument();
  });

  it('알림 설정된 이벤트는 BellIcon과 함께 표시되는가', () => {
    const currentDate = new Date('2024-03-20');
    render(
      <ChakraProvider>
        <WeekEventView
          currentDate={currentDate}
          filteredEvents={mockEvents}
          notifiedEvents={['1']}
        />
      </ChakraProvider>
    );
    expect(screen.getByTestId('BellIcon')).toBeVisible();
  });
});
