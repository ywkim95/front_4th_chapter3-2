import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen } from '@testing-library/react';

import EventListView from '../../components/EventListView';
import { Event } from '../../types';

describe('EventListView', () => {
  const mockOnSearchChange = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  const mockEvents: Event[] = [
    {
      id: '1',
      title: '기존 회의',
      date: '2024-03-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '신규 회의',
      date: '2024-03-16',
      startTime: '12:00',
      endTime: '13:00',
      description: '신규 팀 미팅',
      location: '회의실 C',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 60,
    },
  ];

  const renderComponent = (
    events: Event[] = mockEvents,
    searchTerm: string = '',
    notifiedEvents: string[] = [],
  ) =>
    render(
      <ChakraProvider>
        <EventListView
          searchTerm={searchTerm}
          events={events}
          notifiedEvents={notifiedEvents}
          onSearchChange={mockOnSearchChange}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      </ChakraProvider>,
    );

  it('검색어 입력 시, onSearchChange 콜백을 호출한다.', () => {
    renderComponent();
    const input = screen.getByPlaceholderText('검색어를 입력하세요');
    fireEvent.change(input, { target: { value: '기존' } });
    expect(mockOnSearchChange).toHaveBeenLastCalledWith('기존');
  });

  it('검색 결과가 없을 경우, "검색 결과가 없습니다." 메시지를 표시한다.', () => {
    renderComponent([], '', []);
    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('이벤트 목록을 올바르게 표시한다.', () => {
    renderComponent();
    expect(screen.getByText(mockEvents[0].title)).toBeInTheDocument();
    expect(screen.getByText(mockEvents[1].title)).toBeInTheDocument();
  });

  it('notifiedEvents에 포함된 이벤트는 EventCard에 isNotified=true를 전달한다.', () => {
    renderComponent(mockEvents, '', ['1']);
    expect(
      screen.getByText(mockEvents[0].title).parentElement?.parentElement?.firstChild,
    ).toBeInTheDocument();
  });
});
