import { http, HttpResponse } from 'msw';

import { Event, EventForm } from '../types.ts';
import { events } from './response/events.json' assert { type: 'json' };
// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.
export const handlers = [
  http.get('/api/events', () => HttpResponse.json({ events })),
  http.post('/api/events', async ({ request }) => {
    const form = (await request.json()) as EventForm;
    const newEvent = {
      ...form,
      id: String(events.length + 1),
    };
    return HttpResponse.json(newEvent, { status: 201 });
  }),
  http.put('/api/events/:id', async ({ params, request }) => {
    const { id } = params;
    const form = (await request.json()) as Event;
    const event = events.find((event) => event.id === id);
    if (!event) {
      return HttpResponse.text('Event not found', { status: 404 });
    }
    return HttpResponse.json({ ...event, ...form });
  }),
  http.delete('/api/events/:id', ({ params }) => {
    const { id } = params;
    const eventIndex = events.findIndex((event) => event.id === id);
    if (eventIndex === -1) {
      return HttpResponse.text('Event not found', { status: 404 });
    }
    events.splice(eventIndex, 1);
    return HttpResponse.text('Event deleted', { status: 204 });
  }),
  http.post('/api/events-list', async ({ request }) => {
    const newEvents = (await request.json()) as EventForm[];
    const repeatId = String(events.length + 1);
    const updatedEvents = newEvents.map((event, index) => ({
      ...event,
      id: String(events.length + index + 1),
      repeat: {
        ...event.repeat,
        id: repeatId,
      },
    }));
    return HttpResponse.json(updatedEvents, { status: 201 });
  }),
];
