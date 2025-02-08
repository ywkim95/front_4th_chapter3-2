import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';

import CalendarView from '../../components/CalendarView';
import { Event } from '../../types';

describe('CalendarView', () => {
  const mockSetView = vi.fn();
  const mockNavigate = vi.fn();
  const currentDate = new Date();
  const filteredEvents: Event[] = [];
  const notifiedEvents: string[] = [];
  const holidays: Record<string, string> = {};

  const renderComponent = (view: 'week' | 'month') =>
    render(
      <ChakraProvider>
        <CalendarView
          view={view}
          setView={mockSetView}
          navigate={mockNavigate}
          currentDate={currentDate}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          holidays={holidays}
        />
      </ChakraProvider>,
    );

  it('주간 뷰일 때 WeekEventView를 렌더링한다.', () => {
    vi.setSystemTime(new Date('2025-02-06'));
    renderComponent('week');
    expect(screen.getByRole('heading', { name: '2025년 2월 1주' })).toBeInTheDocument();
  });

  it('월간 뷰일 때 MonthEventView를 렌더링한다.', () => {
    vi.setSystemTime(new Date('2025-02-06'));
    renderComponent('month');
    expect(screen.getByRole('heading', { name: '2025년 2월' })).toBeInTheDocument();
  });
});
