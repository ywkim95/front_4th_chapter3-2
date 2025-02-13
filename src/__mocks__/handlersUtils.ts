import { http, HttpResponse } from 'msw';

import { server } from '../setupTests.ts';
import { Event, EventForm } from '../types';
import { events } from './response/events.json' assert { type: 'json' };
// ! Hard
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다. 이를 위한 제어가 필요할 것 같은데요. 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?
// ! 아래 이름을 사용하지 않아도 되니, 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요. 그리고 이 로직을 PR에 설명해주세요.
export const setupMockHandlerCreation = (initEvents = [] as Event[]) => {
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
    })
  );
};

export const setupMockHandlerUpdating = () => {
  const mockEvents = structuredClone(events) as Event[];

  server.use(
    http.get('/api/events', () => HttpResponse.json({ events: mockEvents })),
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
    })
  );
};

export const setupMockHandlerDeletion = () => {
  const mockEvents = structuredClone(events) as Event[];

  server.use(
    http.get('/api/events', () => HttpResponse.json({ events: mockEvents })),
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

export const setupMockHandlerListCreation = () => {
  const mockEvents = [] as Event[];

  server.use(
    http.get('/api/events', () => HttpResponse.json({ events: mockEvents }, { status: 200 })),
    http.post('/api/events-list', async ({ request }) => {
      const data = (await request.json()) as { events: EventForm[] };
      const events = data.events;
      const repeatId = `${mockEvents.length + 1}`;

      const newEvents: Event[] = events.map((event, index) => ({
        id: String(mockEvents.length + index + 1),
        ...event,
        repeat: {
          ...event.repeat,
          id: repeatId,
        },
      }));

      mockEvents.push(...newEvents);

      return HttpResponse.json(newEvents, { status: 201 });
    })
  );
};

export const setupMockHandlerEditRepeatEvent = (events: Event[] = []) => {
  const mockEvents = structuredClone(events) as Event[];

  server.use(
    http.get('/api/events', () => HttpResponse.json({ events: mockEvents }, { status: 200 })),
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
    })
  );
};

export const setupMockHandlerDeleteRepeatEvent = (events: Event[] = []) => {
  const mockEvents = structuredClone(events) as Event[];

  server.use(
    http.get('/api/events', () => HttpResponse.json({ events: mockEvents }, { status: 200 })),
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

export const setupMockHandlerUpdateAllEvents = (events: Event[], updatedEvent: Event) => {
  const mockEvents = structuredClone(events) as Event[];

  server.use(
    http.get('/api/events', () => HttpResponse.json({ events: mockEvents }, { status: 200 })),
    http.put('/api/events-list', async ({ request }) => {
      const data = (await request.json()) as { events: Event[] };
      const updatedEvents = data.events;
      const repeatId = updatedEvent.repeat?.id;

      const firstEventIndex = mockEvents.findIndex((event) => event.repeat?.id === repeatId);

      if (firstEventIndex === -1) {
        return HttpResponse.json('Event not found', { status: 404 });
      }

      const deleteCount = mockEvents.filter((event) => event.repeat?.id === repeatId).length;
      mockEvents.splice(firstEventIndex, deleteCount, ...updatedEvents);

      return HttpResponse.json(updatedEvents, { status: 200 });
    })
  );
};
