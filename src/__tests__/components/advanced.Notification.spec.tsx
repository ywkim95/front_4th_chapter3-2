import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, fireEvent } from '@testing-library/react';

import Notification from '../../components/Notification.tsx';

describe('<Notification />', () => {
  const mockOnClose = vi.fn();
  const message = '테스트 알림 메시지';
  const index = 0;

  const renderComponent = () =>
    render(
      <ChakraProvider>
        <Notification message={message} index={index} onClose={mockOnClose} />
      </ChakraProvider>
    );

  it('알림 메시지가 "테스트 알림 메시지"로 표시되는가', () => {
    renderComponent();
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('onClose 함수가 CloseButton 클릭 시 호출되는가', () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button'));
    expect(mockOnClose).toHaveBeenCalledWith(index);
  });
});
