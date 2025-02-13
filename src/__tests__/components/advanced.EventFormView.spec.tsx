import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, fireEvent } from '@testing-library/react';

import EventFormView from '../../components/EventFormView.tsx';
import { useEventForm } from '../../hooks/useEventForm.ts';
import { RepeatType } from '../../types.ts';

vi.mock('../../hooks/useEventForm.ts');

describe('<EventFormView />', () => {
  const mockOnSubmit = vi.fn();

  const defaultFormState: ReturnType<typeof useEventForm> = {
    title: '',
    setTitle: vi.fn(),
    date: '',
    setDate: vi.fn(),
    startTime: '',
    endTime: '',
    description: '',
    setDescription: vi.fn(),
    location: '',
    setLocation: vi.fn(),
    category: '',
    setCategory: vi.fn(),
    isRepeating: false,
    setIsRepeating: vi.fn(),
    repeatType: 'daily' as RepeatType,
    setRepeatType: vi.fn(),
    repeatInterval: 1,
    setRepeatInterval: vi.fn(),
    repeatEndDate: '',
    setRepeatEndDate: vi.fn(),
    notificationTime: 0,
    setNotificationTime: vi.fn(),
    startTimeError: '',
    endTimeError: '',
    handleEndTimeChange: vi.fn(),
    handleStartTimeChange: vi.fn(),
    editingEvent: null,
    editEvent: vi.fn(),
    resetForm: vi.fn(),
    setEditingEvent: vi.fn(),
    setEndTime: vi.fn(),
    setStartTime: vi.fn(),
  };

  const renderComponent = (formStateOverrides = {}) => {
    const formState: ReturnType<typeof useEventForm> = {
      ...defaultFormState,
      ...formStateOverrides,
    };
    vi.mocked(useEventForm).mockReturnValue(formState);

    return render(
      <ChakraProvider>
        <EventFormView formState={formState} onSubmit={mockOnSubmit} />
      </ChakraProvider>
    );
  };

  it('편집 모드가 아닐 때 버튼에 "일정 추가" 텍스트가 표시되는가', () => {
    renderComponent();
    expect(screen.getByRole('button', { name: '일정 추가' })).toBeInTheDocument();
  });

  it('편집 모드일 때 "일정 수정" 텍스트가 표시되는가', () => {
    renderComponent({ editingEvent: {} });
    expect(screen.getByRole('button', { name: '일정 수정' })).toBeInTheDocument();
  });

  it('폼 제출 버튼이 올바르게 동작하는가', () => {
    renderComponent();
    fireEvent.click(screen.getByTestId('event-submit-button'));
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  it('입력 필드들이 올바르게 렌더링되는가', () => {
    renderComponent({ isRepeating: false });
    expect(screen.getByLabelText('제목')).toBeInTheDocument();
    expect(screen.getByLabelText('날짜')).toBeInTheDocument();
    expect(screen.getByLabelText('시작 시간')).toBeInTheDocument();
    expect(screen.getByLabelText('종료 시간')).toBeInTheDocument();
    expect(screen.getByLabelText('설명')).toBeInTheDocument();
    expect(screen.getByLabelText('위치')).toBeInTheDocument();
    expect(screen.getByLabelText('카테고리')).toBeInTheDocument();
    expect(screen.getByLabelText('반복 설정')).toBeInTheDocument();
    expect(screen.getByLabelText('알림 설정')).toBeInTheDocument();

    expect(screen.queryByLabelText('반복 유형')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('반복 간격')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('반복 종료일')).not.toBeInTheDocument();
  });

  it('반복 설정이 활성화되면 반복 유형, 간격, 종료일 필드가 표시되는가', () => {
    renderComponent({ isRepeating: true });
    expect(screen.getByLabelText('반복 유형')).toBeInTheDocument();
    expect(screen.getByLabelText('반복 간격')).toBeInTheDocument();
    expect(screen.getByLabelText('반복 종료일')).toBeInTheDocument();
  });
});
