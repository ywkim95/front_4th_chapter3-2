import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { events } from '../../__mocks__/response/events.json' assert { type: 'json' };
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event, EventForm } from '../../types.ts';
const mockToast = vi.fn();
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => mockToast,
  };
});

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  setupMockHandlerCreation(events as Event[]);

  const { result } = renderHook(() => useEventOperations(false));

  await act(() => Promise.resolve(null));

  expect(result.current.events).toEqual(events);
});

it('새로운 이벤트 정보를 입력하면 이벤트가 저장된다.', async () => {
  const newEvent: EventForm = {
    title: '새로운 회의',
    date: '2024-10-16',
    startTime: '09:00',
    endTime: '10:00',
    description: '새로운 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  setupMockHandlerCreation([] as Event[]);

  const { result } = renderHook(() => useEventOperations(false));

  act(() => {
    result.current.saveEvent(newEvent);
  });

  const updatedEvents = [
    {
      id: '1',
      ...newEvent,
    },
  ];

  await act(() => Promise.resolve(null));
  expect(result.current.events).toEqual(updatedEvents);
});

it('기존 이벤트 정보를 기반으로 적절하게 업데이트를 한다.', async () => {
  const updatedEvent: Event = {
    id: '1',
    title: '기존 회의',
    date: '2024-10-16',
    startTime: '09:00',
    endTime: '10:00',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  setupMockHandlerUpdating();

  const { result } = renderHook(() => useEventOperations(true));

  act(() => {
    result.current.saveEvent(updatedEvent);
  });

  await act(() => Promise.resolve(null));

  expect(result.current.events).toEqual([updatedEvent]);
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  const updatedEvent: Event = {
    id: '1',
    title: '기존 회의 수정',
    date: '2024-10-16',
    startTime: '15:00',
    endTime: '16:00',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  setupMockHandlerUpdating();

  const { result } = renderHook(() => useEventOperations(true));

  act(() => {
    result.current.saveEvent(updatedEvent);
  });

  await act(() => Promise.resolve(null));
  expect(result.current.events).toEqual([updatedEvent]);
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  setupMockHandlerDeletion();

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.deleteEvent('1');
  });
  await act(() => Promise.resolve(null));
  expect(result.current.events).toHaveLength(0);
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  server.use(http.get('/api/events', () => new HttpResponse(null, { status: 500 })));

  renderHook(() => useEventOperations(false));

  await act(() => Promise.resolve(null));
  expect(mockToast).toHaveBeenCalledWith({
    title: '이벤트 로딩 실패',
    status: 'error',
    duration: 3000,
    isClosable: true,
  });
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  const missingEvent: Event = {
    id: '2',
    title: '기존 회의 수정',
    date: '2024-10-16',
    startTime: '15:00',
    endTime: '16:00',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };
  setupMockHandlerUpdating();
  const { result } = renderHook(() => useEventOperations(true));

  act(() => {
    result.current.saveEvent(missingEvent);
  });

  await act(() => Promise.resolve(null));
  expect(mockToast).toHaveBeenCalledWith({
    title: '일정 저장 실패',
    status: 'error',
    duration: 3000,
    isClosable: true,
  });
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  server.use(
    http.get('api/events', () => HttpResponse.json(events, { status: 200 })),
    http.delete('/api/events/:id', () => new HttpResponse(null, { status: 500 }))
  );

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.deleteEvent('1');
  });

  expect(mockToast).toHaveBeenCalledWith({
    title: '일정 삭제 실패',
    status: 'error',
    duration: 3000,
    isClosable: true,
  });
});

it('새로운 이벤트를 생성할 때, 반복 설정이 있으면 반복 설정에 의하여 이벤트 리스트가 생성된다.', async () => {
  vi.setSystemTime('2024-07-01');
  const mockEventForm: Omit<EventForm, 'repeat'> = {
    title: '새로운 회의',
    date: '2024-10-16',
    startTime: '09:00',
    endTime: '10:00',
    description: '새로운 팀 미팅',
    location: '회의실 A',
    category: '업무',
    notificationTime: 10,
  };

  const eventForm: EventForm = {
    ...mockEventForm,
    repeat: { type: 'daily', interval: 10, endDate: '2024-07-31' },
  };

  server.use(
    http.get('api/events', () => HttpResponse.json(events, { status: 200 })),
    http.post('api/events-list', async ({ request, params }) => {
      const data = (await request.json()) as EventForm[];
      console.log(data);
      return HttpResponse.json(events, { status: 200 });
    })
  );

  const { result } = renderHook(() => useEventOperations(false));
  act(() => {
    result.current.saveEvent(eventForm);
  });

  // const newEvents =
  //
  // expect()
});
it('기존 이벤트를 수정할 때, 반복 설정이 있으면 적절하게 반복 설정이 적용된다', async () => {});
it('반복 설정이 적용된 이벤트를 삭제할 때, 적절하게 반복 설정이 적용된다', async () => {});
