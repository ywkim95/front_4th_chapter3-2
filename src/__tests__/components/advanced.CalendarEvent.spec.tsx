import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';

import CalendarEvent from '../../components/CalendarEvent';
import { Event } from '../../types';

describe('CalendarEvent', () => {
  const mockEvent: Event = {
    id: '1',
    title: '기존 회의',
    date: '2025-02-15',
    startTime: '09:00',
    endTime: '10:00',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };
  const renderComponent = (isNotified: boolean, event: Event = mockEvent) =>
    render(
      <ChakraProvider>
        <CalendarEvent event={event} isNotified={isNotified} />
      </ChakraProvider>
    );

  it('알림이 없을 때, BellIcon을 표시하지 않는다.', () => {
    renderComponent(false);
    expect(screen.getByText('기존 회의')).toBeInTheDocument();
  });

  it('알림이 있을 때, BellIcon을 표시한다.', () => {
    renderComponent(true);
    expect(screen.getByText('기존 회의')).toBeInTheDocument();
    expect(screen.getByTestId('BellIcon')).toBeInTheDocument();
  });

  it('반복 일정이 있을 때, 반복 정보를 표시한다.', () => {
    const repeatEvent: Event = {
      ...mockEvent,
      repeat: { type: 'daily', interval: 1 },
    };
    renderComponent(false, repeatEvent);
    expect(screen.getByText('기존 회의')).toBeInTheDocument();
    expect(screen.getByTestId('repeat-info')).toBeInTheDocument();
  });
});
