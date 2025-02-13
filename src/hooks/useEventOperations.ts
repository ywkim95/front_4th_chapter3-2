import { useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { DEFAULT_TOAST_DURATION, TOAST_STATUS, TOAST_MESSAGES } from '../toastConfig.ts';
import { Event, EventForm } from '../types';
import { calculateMaxEventCount, generateRepeatedEvents } from '../utils/eventUtils.ts';

export const useEventOperations = (editing: boolean, onSave?: () => void) => {
  const [events, setEvents] = useState<Event[]>([]);
  const toast = useToast();

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const { events } = await response.json();
      setEvents(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: TOAST_MESSAGES.LOAD_ERROR,
        status: TOAST_STATUS.ERROR,
        duration: DEFAULT_TOAST_DURATION,
        isClosable: true,
      });
    }
  };

  const saveEvent = async (eventData: Event | EventForm) => {
    try {
      let response;
      if (editing) {
        response = await fetch(`/api/events/${(eventData as Event).id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });
      } else {
        if (eventData.repeat.type !== 'none') {
          const maxEventCount = calculateMaxEventCount(eventData);
          const newEvents = generateRepeatedEvents(eventData, maxEventCount) as EventForm[];
          response = await fetch('/api/events-list', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ events: newEvents }),
          });
        } else {
          response = await fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData),
          });
        }
      }

      if (!response.ok) {
        throw new Error('Failed to save event');
      }

      await fetchEvents();
      onSave?.();
      toast({
        title: editing ? TOAST_MESSAGES.MODIFY_SUCCESS : TOAST_MESSAGES.SAVE_SUCCESS,
        status: TOAST_STATUS.SUCCESS,
        duration: DEFAULT_TOAST_DURATION,
        isClosable: true,
      });
    } catch (error) {
      onSave?.();
      console.error('Error saving event:', error);
      toast({
        title: TOAST_MESSAGES.SAVE_ERROR,
        status: TOAST_STATUS.ERROR,
        duration: DEFAULT_TOAST_DURATION,
        isClosable: true,
      });
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const response = await fetch(`/api/events/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      await fetchEvents();
      toast({
        title: TOAST_MESSAGES.DELETE_SUCCESS,
        status: TOAST_STATUS.INFO,
        duration: DEFAULT_TOAST_DURATION,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: TOAST_MESSAGES.DELETE_ERROR,
        status: TOAST_STATUS.ERROR,
        duration: DEFAULT_TOAST_DURATION,
        isClosable: true,
      });
    }
  };

  const updateAllEvents = async (eventData: Event) => {
    try {
      const filteredEvents = events.filter(
        (event) =>
          event.repeat?.id && eventData.repeat?.id && event.repeat.id === eventData.repeat.id
      );
      const maxEventCount = calculateMaxEventCount(eventData);
      const newEvents = generateRepeatedEvents(eventData, maxEventCount) as EventForm[];
      const updatedEvents = filteredEvents.map((event, index) => {
        const newEvent = newEvents[index];
        return {
          ...event,
          title: newEvent.title,
          date: newEvent.date,
          startTime: newEvent.startTime,
          endTime: newEvent.endTime,
          description: newEvent.description,
          location: newEvent.location,
          category: newEvent.category,
          notificationTime: newEvent.notificationTime,
          repeat: {
            ...event.repeat,
            endDate: newEvent.date,
          },
        };
      });

      const response = await fetch('/api/events-list', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: updatedEvents }),
      });

      if (!response.ok) {
        throw new Error('Failed to update all events');
      }

      await fetchEvents();
      toast({
        title: TOAST_MESSAGES.MODIFY_SUCCESS,
        status: TOAST_STATUS.SUCCESS,
        duration: DEFAULT_TOAST_DURATION,
        isClosable: true,
      });
    } catch (e) {
      console.error('Error updating all events:', e);
      toast({
        title: TOAST_MESSAGES.SAVE_ERROR,
        status: TOAST_STATUS.ERROR,
        duration: DEFAULT_TOAST_DURATION,
        isClosable: true,
      });
    }
  };

  async function init() {
    const NO_CLOSABLE_DURATION = 1000;
    await fetchEvents();
    toast({
      title: TOAST_MESSAGES.LOAD_SUCCESS,
      status: TOAST_STATUS.INFO,
      duration: NO_CLOSABLE_DURATION,
    });
  }

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { events, fetchEvents, saveEvent, deleteEvent, updateAllEvents };
};
