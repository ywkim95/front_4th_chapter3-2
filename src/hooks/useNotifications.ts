import { useInterval } from '@chakra-ui/react';
import { useState } from 'react';

import { Event } from '../types';
import { createNotificationMessage, getUpcomingEvents } from '../utils/notificationUtils';

export const useNotifications = (events: Event[]) => {
  const [notifications, setNotifications] = useState<{ id: string; message: string }[]>([]);
  const [notifiedEvents, setNotifiedEvents] = useState<string[]>([]);

  const checkUpcomingEvents = () => {
    const now = new Date();
    const upcomingEvents = getUpcomingEvents(events, now, notifiedEvents);
    const upcomingEventsMessages = upcomingEvents.map((event) => ({
      id: event.id,
      message: createNotificationMessage(event),
    }));
    const upcomingEventIds = upcomingEvents.map(({ id }) => id);

    setNotifications((prev) => [...prev, ...upcomingEventsMessages]);
    setNotifiedEvents((prev) => [...prev, ...upcomingEventIds]);
  };

  const removeNotification = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  useInterval(checkUpcomingEvents, 1000); // 1초마다 체크

  return { notifications, notifiedEvents, setNotifications, removeNotification };
};
