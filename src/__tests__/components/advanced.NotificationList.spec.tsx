import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, fireEvent } from '@testing-library/react';

import NotificationList from '../../components/NotificationList.tsx';

describe('<NotificationList />', () => {
  const mockOnClose = vi.fn();
  const notifications = [
    { id: '1', message: '알림 1' },
    { id: '2', message: '알림 2' },
  ];

  const renderComponent = () =>
    render(
      <ChakraProvider>
        <NotificationList notifications={notifications} onClose={mockOnClose} />
      </ChakraProvider>,
    );

  it('입력된 알림 객체가 모두 표시되는가', () => {
    renderComponent();
    notifications.forEach((notification) => {
      expect(screen.getByText(notification.message)).toBeInTheDocument();
    });
  });

  it('onClose 함수가 각 알림에 대해 올바르게 호출되는가', () => {
    renderComponent();
    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(mockOnClose).toHaveBeenCalledWith(0);

    fireEvent.click(screen.getAllByRole('button')[1]);
    expect(mockOnClose).toHaveBeenCalledWith(1);
  });
});
