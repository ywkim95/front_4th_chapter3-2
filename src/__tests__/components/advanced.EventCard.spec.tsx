import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import EventCard from '../../components/EventCard';
import { Event } from '../../types';

describe('EventCard', () => {
  const mockEditEvent = vi.fn();
  const mockDeleteEvent = vi.fn();
  const mockEvent: Event = {
    id: '1',
    title: '기존 회의',
    date: '2024-10-15',
    startTime: '09:00',
    endTime: '10:00',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  const renderComponent = (event: Event = mockEvent, isNotified: boolean = false) =>
    render(
      <ChakraProvider>
        <EventCard
          event={event}
          isNotified={isNotified}
          editEvent={mockEditEvent}
          deleteEvent={mockDeleteEvent}
        />
      </ChakraProvider>
    );

  it('이벤트 정보를 올바르게 표시한다.', () => {
    renderComponent();
    expect(screen.getByText(mockEvent.title)).toBeInTheDocument();
    expect(screen.getByText(mockEvent.date)).toBeInTheDocument();
    expect(screen.getByText(`${mockEvent.startTime} - ${mockEvent.endTime}`)).toBeInTheDocument();
    expect(screen.getByText(mockEvent.description)).toBeInTheDocument();
    expect(screen.getByText(mockEvent.location)).toBeInTheDocument();
    expect(screen.getByText(`카테고리: ${mockEvent.category}`)).toBeInTheDocument();
  });

  it('알림 여부에 따라 BellIcon을 표시하거나 표시하지 않는다.', async () => {
    const { rerender } = renderComponent(mockEvent, false);
    expect(screen.queryByTestId('BellIcon')).not.toBeInTheDocument();

    rerender(
      <ChakraProvider>
        <EventCard
          event={mockEvent}
          isNotified={true}
          editEvent={mockEditEvent}
          deleteEvent={mockDeleteEvent}
        />
      </ChakraProvider>
    );
    expect(await screen.findByTestId('BellIcon')).toBeInTheDocument();
  });

  it('수정 버튼 클릭 시, editEvent 콜백을 호출한다.', async () => {
    renderComponent();
    const user = userEvent.setup({ delay: null });
    await user.click(screen.getByRole('button', { name: /edit event/i }));
    expect(mockEditEvent).toHaveBeenCalledWith(mockEvent);
  });

  it('삭제 버튼 클릭 시, deleteEvent 콜백을 호출한다.', async () => {
    renderComponent();
    const user = userEvent.setup({ delay: null });
    await user.click(screen.getByRole('button', { name: /delete event/i }));
    expect(mockDeleteEvent).toHaveBeenCalledWith(mockEvent.id);
  });

  it('반복 간격이 있는 이벤트는 반복 간격을 표시한다.', () => {
    const mockEventWithRepeat: Event = {
      ...mockEvent,
      repeat: { type: 'daily', interval: 1 },
    };
    renderComponent(mockEventWithRepeat);
    const eventCard = within(screen.getByTestId('event card'));

    expect(eventCard.getByText(/1일마다/)).toBeInTheDocument();
  });
});
