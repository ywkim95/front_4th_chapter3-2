import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CalendarHeader from '../../components/CalendarHeader';

describe('CalendarHeader', () => {
  const mockOnViewChange = vi.fn();
  const mockOnNavigate = vi.fn();

  const renderComponent = (view: 'week' | 'month') =>
    render(
      <ChakraProvider>
        <CalendarHeader view={view} onViewChange={mockOnViewChange} onNavigate={mockOnNavigate} />
      </ChakraProvider>,
    );

  it('현재 뷰에 따라 올바른 옵션을 표시한다.', () => {
    const { unmount } = renderComponent('week');
    expect((screen.getByRole('combobox') as HTMLInputElement).value).toBe('week');
    unmount();

    renderComponent('month');
    expect((screen.getByRole('combobox') as HTMLInputElement).value).toBe('month');
  });

  it('뷰 변경 시, onViewChange 콜백을 호출한다.', async () => {
    renderComponent('week');
    const user = userEvent.setup({ delay: null });
    await user.selectOptions(screen.getByRole('combobox'), 'month');
    expect(mockOnViewChange).toHaveBeenCalledWith('month');
  });

  it('이전 버튼 클릭 시, onNavigate 콜백을 "prev"와 함께 호출한다.', async () => {
    renderComponent('week');
    const user = userEvent.setup({ delay: null });
    await user.click(screen.getByLabelText('Previous'));
    expect(mockOnNavigate).toHaveBeenCalledWith('prev');
  });

  it('다음 버튼 클릭 시, onNavigate 콜백을 "next"와 함께 호출한다.', async () => {
    renderComponent('week');
    const user = userEvent.setup({ delay: null });
    await user.click(screen.getByLabelText('Next'));
    expect(mockOnNavigate).toHaveBeenCalledWith('next');
  });
});
