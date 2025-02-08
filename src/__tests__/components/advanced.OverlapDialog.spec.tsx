import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, fireEvent } from '@testing-library/react';

import OverlapDialog from '../../components/OverlapDialog.tsx';
import { Event } from '../../types.ts';

describe('<OverlapDialog />', () => {
  const mockOnClose = vi.fn();
  const mockOnProceed = vi.fn();
  const overlappingEvents: Event[] = [
    {
      id: '1',
      title: '겹치는 일정 1',
      date: '2024-01-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      notificationTime: 0,
      repeat: {
        type: 'none',
        interval: 0,
      },
    },
    {
      id: '2',
      title: '겹치는 일정 2',
      date: '2024-01-01',
      startTime: '11:00',
      endTime: '12:00',
      description: '',
      location: '',
      category: '',
      notificationTime: 0,
      repeat: {
        type: 'none',
        interval: 0,
      },
    },
  ];

  const renderComponent = (isOverlapDialogOpen: boolean) =>
    render(
      <ChakraProvider>
        <OverlapDialog
          isOverlapDialogOpen={isOverlapDialogOpen}
          overlappingEvents={overlappingEvents}
          onClose={mockOnClose}
          onProceed={mockOnProceed}
        />
      </ChakraProvider>,
    );

  it('isOverlapDialogOpen이 true일 때 다이얼로그가 열리는가', () => {
    renderComponent(true);
    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
  });

  it('isOverlapDialogOpen이 false일 때 다이얼로그가 닫히는가', () => {
    renderComponent(false);
    expect(screen.queryByText('일정 겹침 경고')).not.toBeInTheDocument();
  });

  it('겹치는 일정의 제목, 날짜, 시간이 표시되는가', () => {
    renderComponent(true);
    overlappingEvents.forEach((event) => {
      expect(
        screen.getByText(`${event.title} (${event.date} ${event.startTime}-${event.endTime})`),
      ).toBeInTheDocument();
    });
  });

  it('onClose 함수가 "취소" 버튼 클릭 시 호출되는가', () => {
    renderComponent(true);
    fireEvent.click(screen.getByRole('button', { name: '취소' }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('onProceed 함수가 "계속 진행" 버튼 클릭 시 호출되는가', () => {
    renderComponent(true);
    fireEvent.click(screen.getByRole('button', { name: '계속 진행' }));
    expect(mockOnProceed).toHaveBeenCalledTimes(1);
  });
});
