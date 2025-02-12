import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach } from 'vitest';

import App from '../App';
import { server } from '../setupTests';
import { Event, EventForm } from '../types';

const mockToast = vi.fn();
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => mockToast,
  };
});
const mockApis = (initEvents: Event[] = []) => {
  const mockEvents = structuredClone(initEvents) as Event[];
  server.use(
    http.get('/api/events', () => HttpResponse.json({ events: mockEvents })),
    http.post('/api/events', async ({ request }) => {
      const form = (await request.json()) as EventForm;
      const newEvent = {
        id: String(mockEvents.length + 1),
        ...form,
      };
      mockEvents.push(newEvent);
      return HttpResponse.json(newEvent, { status: 201 });
    }),
    http.put('/api/events/:id', async ({ params, request }) => {
      const { id } = params;
      const form = (await request.json()) as Event;
      const event = mockEvents.find((event) => event.id === id);
      if (!event) {
        return HttpResponse.json('Event not found', { status: 404 });
      }
      mockEvents.splice(
        mockEvents.findIndex((event) => event.id === id),
        1,
        { ...event, ...form }
      );
      return HttpResponse.json({ ...event, ...form }, { status: 200 });
    }),
    http.delete('/api/events/:id', ({ params }) => {
      const { id } = params;
      const eventIndex = mockEvents.findIndex((event) => event.id === id);

      if (eventIndex === -1) {
        return HttpResponse.json('Event not found', { status: 404 });
      }
      mockEvents.splice(eventIndex, 1);
      return new HttpResponse(null, { status: 204 });
    })
  );
};
describe('일정 CRUD 및 기본 기능', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2025-02-01'));
  });
  const renderApp = () =>
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    mockApis();
    renderApp();
    const user = userEvent.setup();

    // 일정 추가 폼에 일정 정보 입력
    const titleInput = screen.getByLabelText(/제목/i);
    await user.type(titleInput, '신규 팀 회의');

    const dateInput = screen.getByLabelText(/날짜/i);
    await user.type(dateInput, '2025-02-27');

    const startTimeInput = screen.getByLabelText(/시작 시간/i);
    await user.type(startTimeInput, '09:00');

    const endTimeInput = screen.getByLabelText(/종료 시간/i);
    await user.type(endTimeInput, '10:00');

    const descriptionInput = screen.getByLabelText(/설명/i);
    await user.type(descriptionInput, '새로운 프로젝트 논의');

    const locationInput = screen.getByLabelText(/위치/i);
    await user.type(locationInput, '회의실 A');

    const categoryInput = screen.getByLabelText(/카테고리/i);
    await user.selectOptions(categoryInput, '업무');

    const notificationSelect = screen.getByLabelText(/알림 설정/i);
    await user.selectOptions(notificationSelect, '1시간 전');

    const repeatSelect = screen.getByLabelText(/반복 설정/i);
    await user.click(repeatSelect);

    const button = screen.getByTestId('event-submit-button');
    await user.click(button);

    const eventList = within(screen.getByTestId('event-list'));

    expect(eventList.getByText('신규 팀 회의')).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    mockApis([
      {
        id: '1',
        title: '기존 회의',
        date: '2025-02-25',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
    renderApp();
    const user = userEvent.setup();
    const eventList = await screen.findByTestId('event-list');
    await within(eventList).findByText('기존 회의');

    const editButton = within(eventList).getByLabelText('Edit event');
    await user.click(editButton);

    const titleInput = screen.getByLabelText(/제목/i);
    await user.clear(titleInput);
    await user.type(titleInput, '수정된 회의');

    const button = screen.getByTestId('event-submit-button');
    await user.click(button);

    const eventListAfterEdit = within(screen.getByTestId('event-list'));

    expect(eventListAfterEdit.getByText('수정된 회의')).toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    mockApis([
      {
        id: '1',
        title: '기존 회의',
        date: '2025-02-25',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
    renderApp();
    const user = userEvent.setup();
    const eventList = within(screen.getByTestId('event-list'));
    expect(await eventList.findByText('기존 회의')).toBeInTheDocument();

    const deleteButton = eventList.getByLabelText('Delete event');
    await user.click(deleteButton);

    expect(eventList.queryByText('기존 회의')).not.toBeInTheDocument();
    expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });
});

describe('일정 뷰', () => {
  const renderApp = () =>
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    vi.setSystemTime(new Date('2025-02-01'));
    mockApis([
      {
        id: '1',
        title: '기존 회의',
        date: '2025-02-25',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
    renderApp();
    const user = userEvent.setup();

    const eventListBeforeWeekView = within(screen.getByTestId('event-list'));
    expect(await eventListBeforeWeekView.findByText('기존 회의')).toBeInTheDocument();

    const weekViewButton = screen.getByLabelText('view');
    await user.selectOptions(weekViewButton, 'week');

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    vi.setSystemTime(new Date('2025-02-24'));
    mockApis([
      {
        id: '1',
        title: '기존 회의',
        date: '2025-02-25',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
    renderApp();
    const user = userEvent.setup();

    const weekViewButton = screen.getByLabelText('view');
    await user.selectOptions(weekViewButton, 'week');

    const eventList = within(screen.getByTestId('event-list'));
    expect(await eventList.findByText('기존 회의')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    vi.setSystemTime(new Date('2025-01-01'));
    mockApis([
      {
        id: '1',
        title: '기존 회의',
        date: '2025-02-25',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
    renderApp();
    const user = userEvent.setup();

    const monthViewButton = screen.getByLabelText('view');
    await user.selectOptions(monthViewButton, 'month');

    const eventList = within(screen.getByTestId('event-list'));
    expect(await eventList.findByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    vi.setSystemTime(new Date('2025-02-01'));
    mockApis([
      {
        id: '1',
        title: '기존 회의',
        date: '2025-02-25',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
    renderApp();
    const user = userEvent.setup();

    const monthViewButton = screen.getByLabelText('view');
    await user.selectOptions(monthViewButton, 'month');

    const eventList = within(screen.getByTestId('event-list'));
    expect(await eventList.findByText('기존 회의')).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    vi.setSystemTime(new Date('2024-01-01'));
    mockApis();
    renderApp();
    const user = userEvent.setup();

    const monthViewButton = screen.getByLabelText('view');
    await user.selectOptions(monthViewButton, 'month');

    const calendar = within(await screen.findByTestId('month-view'));
    expect(await calendar.findByText('신정')).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  const renderApp = () =>
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    vi.setSystemTime(new Date('2025-02-01'));
    mockApis([
      {
        id: '1',
        title: '기존 회의',
        date: '2025-02-25',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
    renderApp();
    const user = userEvent.setup();

    const prevEventList = within(screen.getByTestId('event-list'));
    expect(await prevEventList.findByText('기존 회의')).toBeInTheDocument();

    const searchInput = screen.getByLabelText(/검색/i);
    await user.type(searchInput, 'aaaaaaaaaaaaaaaaa');

    const rerenderEventList = within(screen.getByTestId('event-list'));
    expect(await rerenderEventList.findByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    vi.setSystemTime(new Date('2025-02-01'));
    mockApis([
      {
        id: '1',
        title: '기존 회의',
        date: '2025-02-25',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '팀 회의',
        date: '2025-02-26',
        startTime: '09:00',
        endTime: '10:00',
        description: '팀 미팅',
        location: '회의실 C',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
    renderApp();
    const user = userEvent.setup();

    const eventList = within(screen.getByTestId('event-list'));
    expect(await eventList.findByText('기존 회의')).toBeInTheDocument();

    const searchInput = screen.getByLabelText(/검색/i);
    await user.type(searchInput, '팀 회의');

    expect(await eventList.queryByText('기존 회의')).not.toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    vi.setSystemTime(new Date('2025-02-01'));
    mockApis([
      {
        id: '1',
        title: '기존 회의',
        date: '2025-02-25',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '팀 회의',
        date: '2025-02-26',
        startTime: '09:00',
        endTime: '10:00',
        description: '팀 미팅',
        location: '회의실 C',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
    renderApp();
    const user = userEvent.setup();

    const eventList = within(screen.getByTestId('event-list'));
    expect(await eventList.findByText('기존 회의')).toBeInTheDocument();

    const searchInput = screen.getByLabelText(/검색/i);
    await user.type(searchInput, '팀 회의');

    expect(await eventList.findByText('팀 회의')).toBeInTheDocument();

    await user.clear(searchInput);

    expect(await eventList.findByText('기존 회의')).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  const renderApp = () =>
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    vi.setSystemTime(new Date('2025-02-01'));
    mockApis([
      {
        id: '1',
        title: '기존 회의',
        date: '2025-02-25',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
    renderApp();
    const user = userEvent.setup();

    const eventList = within(screen.getByTestId('event-list'));
    expect(await eventList.findByText('기존 회의')).toBeInTheDocument();

    const titleInput = screen.getByLabelText(/제목/i);
    await user.type(titleInput, '신규 팀 회의');

    const dateInput = screen.getByLabelText(/날짜/i);
    await user.type(dateInput, '2025-02-25');

    const startTimeInput = screen.getByLabelText(/시작 시간/i);
    await user.type(startTimeInput, '09:30');

    const endTimeInput = screen.getByLabelText(/종료 시간/i);
    await user.type(endTimeInput, '10:30');

    const descriptionInput = screen.getByLabelText(/설명/i);
    await user.type(descriptionInput, '신규 팀 회의');

    const locationInput = screen.getByLabelText(/위치/i);
    await user.type(locationInput, '회의실 A');

    const categoryInput = screen.getByLabelText(/카테고리/i);
    await user.selectOptions(categoryInput, '업무');

    const button = screen.getByTestId('event-submit-button');
    await user.click(button);

    const alert = screen.getByRole('alertdialog');
    expect(alert).toHaveTextContent('일정 겹침 경고');
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    vi.setSystemTime(new Date('2025-02-01'));
    mockApis([
      {
        id: '1',
        title: '기존 회의',
        date: '2025-02-25',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '팀 회의',
        date: '2025-02-26',
        startTime: '09:00',
        endTime: '10:00',
        description: '팀 미팅',
        location: '회의실 C',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
    renderApp();
    const user = userEvent.setup();

    const eventList = within(screen.getByTestId('event-list'));
    expect(await eventList.findByText('기존 회의')).toBeInTheDocument();

    const editButton = eventList.getAllByLabelText('Edit event');
    await user.click(editButton[0]);

    expect(screen.getByLabelText(/제목/i)).toHaveValue('기존 회의');

    const dateInput = screen.getByLabelText(/날짜/i);
    await user.clear(dateInput);
    await user.type(dateInput, '2025-02-26');

    const startTimeInput = screen.getByLabelText(/시작 시간/i);
    await user.clear(startTimeInput);
    await user.type(startTimeInput, '09:30');

    const endTimeInput = screen.getByLabelText(/종료 시간/i);
    await user.clear(endTimeInput);
    await user.type(endTimeInput, '10:30');

    const button = screen.getByTestId('event-submit-button');
    await user.click(button);

    const alert = screen.getByRole('alertdialog');
    expect(alert).toHaveTextContent('일정 겹침 경고');
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  vi.setSystemTime(new Date('2025-02-25T08:50:00'));
  mockApis([
    {
      id: '1',
      title: '기존 회의',
      date: '2025-02-25',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ]);
  render(
    <ChakraProvider>
      <App />
    </ChakraProvider>
  );

  const prevEventList = within(screen.getByTestId('event-list'));
  expect(await prevEventList.findByText('기존 회의')).toBeInTheDocument();

  await vi.advanceTimersByTime(0);
  await vi.advanceTimersByTimeAsync(1000);

  const alert = screen.getByRole('alert');
  expect(alert).toHaveTextContent('10분 후 기존 회의 일정이 시작됩니다.');
});
