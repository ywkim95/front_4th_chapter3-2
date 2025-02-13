import { Box, Flex, useToast } from '@chakra-ui/react';
import { useState } from 'react';

import CalendarView from './components/CalendarView.tsx';
import EventFormView from './components/EventFormView.tsx';
import EventListView from './components/EventListView.tsx';
import ModifyDialog from './components/ModifyDialog.tsx';
import NotificationList from './components/NotificationList.tsx';
import OverlapDialog from './components/OverlapDialog.tsx';
import { useCalendarView } from './hooks/useCalendarView.ts';
import { useEventForm } from './hooks/useEventForm.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useNotifications } from './hooks/useNotifications.ts';
import { useSearch } from './hooks/useSearch.ts';
import { DEFAULT_TOAST_DURATION, TOAST_MESSAGES, TOAST_STATUS } from './toastConfig.ts';
import { Event } from './types';
import { findOverlappingEvents } from './utils/eventOverlap';
import { getEventData } from './utils/eventUtils.ts';

function App() {
  const eventForm = useEventForm();

  const { events, saveEvent, deleteEvent, updateAllEvents } = useEventOperations(
    Boolean(eventForm.editingEvent),
    () => eventForm.setEditingEvent(null)
  );

  const { notifications, notifiedEvents, removeNotification } = useNotifications(events);
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);

  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);
  const [isModifyDialogOpen, setIsModifyDialogOpen] = useState(false);

  const toast = useToast();

  const handleCloseUpdate = () => setIsModifyDialogOpen(false);

  const handleSingleUpdate = async () => {
    const eventData: Event = {
      ...(getEventData(eventForm) as Event),
      repeat: { type: 'none', interval: 0 },
    };
    await saveEvent(eventData);
    setIsModifyDialogOpen(false);
    eventForm.resetForm();
  };

  const handleAllUpdate = async () => {
    const eventData = getEventData(eventForm) as Event;
    await updateAllEvents(eventData);
    setIsModifyDialogOpen(false);
    eventForm.resetForm();
  };

  const addOrUpdateEvent = async () => {
    const {
      title,
      date,
      startTime,
      endTime,
      isRepeating,
      repeatType,
      startTimeError,
      endTimeError,
      resetForm,
    } = eventForm;
    if (!title || !date || !startTime || !endTime) {
      toast({
        title: TOAST_MESSAGES.REQUIRED,
        status: TOAST_STATUS.ERROR,
        duration: DEFAULT_TOAST_DURATION,
        isClosable: true,
      });
      return;
    }

    if (startTimeError || endTimeError) {
      toast({
        title: TOAST_MESSAGES.TIME,
        status: TOAST_STATUS.ERROR,
        duration: DEFAULT_TOAST_DURATION,
        isClosable: true,
      });
      return;
    }

    if (isRepeating && repeatType === 'none') {
      toast({
        title: TOAST_MESSAGES.REPEAT,
        status: TOAST_STATUS.ERROR,
        duration: DEFAULT_TOAST_DURATION,
        isClosable: true,
      });
      return;
    }

    const eventData = getEventData(eventForm);

    const overlapping = findOverlappingEvents(eventData, events);
    if (overlapping.length > 0) {
      setOverlappingEvents(overlapping);
      setIsOverlapDialogOpen(true);
    } else {
      if (eventForm.editingEvent && eventForm.editingEvent.repeat.type !== 'none') {
        setIsModifyDialogOpen(true);
      } else {
        await saveEvent(eventData);
        resetForm();
      }
    }
  };

  const handleCloseOverlapDialog = () => setIsOverlapDialogOpen(false);
  const handleProceedOverlapDialog = async () => {
    setIsOverlapDialogOpen(false);
    await saveEvent(getEventData(eventForm));
  };

  return (
    <Box w="full" h="100vh" m="auto" p={5}>
      <Flex gap={6} h="full">
        <EventFormView formState={eventForm} onSubmit={addOrUpdateEvent} />

        <CalendarView
          view={view}
          setView={setView}
          currentDate={currentDate}
          navigate={navigate}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          holidays={holidays}
        />

        <EventListView
          searchTerm={searchTerm}
          events={filteredEvents}
          notifiedEvents={notifiedEvents}
          onSearchChange={setSearchTerm}
          onEdit={eventForm.editEvent}
          onDelete={deleteEvent}
        />
      </Flex>

      <OverlapDialog
        isOverlapDialogOpen={isOverlapDialogOpen}
        overlappingEvents={overlappingEvents}
        onClose={handleCloseOverlapDialog}
        onProceed={handleProceedOverlapDialog}
      />

      <ModifyDialog
        isModifyDialogOpen={isModifyDialogOpen}
        onProceedSingle={handleSingleUpdate}
        onProceedAll={handleAllUpdate}
        onClose={handleCloseUpdate}
      />

      {notifications.length > 0 && (
        <NotificationList notifications={notifications} onClose={removeNotification} />
      )}
    </Box>
  );
}

export default App;
