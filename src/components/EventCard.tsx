import { BellIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { Box, HStack, IconButton, Text, VStack } from '@chakra-ui/react';

import { Event } from '../types.ts';
import { getDateUnit } from '../utils/dateUtils.ts';
import { getNotificationLabel } from '../utils/notificationUtils.ts';

interface EventCardProps {
  event: Event;
  isNotified: boolean;
  editEvent: (event: Event) => void;
  deleteEvent: (eventId: string) => void;
}

const EventCard = ({ event, isNotified, editEvent, deleteEvent }: EventCardProps) => (
  <Box data-testid="event card" key={event.id} borderWidth={1} borderRadius="lg" p={3} width="100%">
    <HStack justifyContent="space-between">
      <VStack align="start">
        <HStack>
          {isNotified && <BellIcon data-testid="BellIcon" color="red.500" />}
          <Text
            fontWeight={isNotified ? 'bold' : 'normal'}
            color={isNotified ? 'red.500' : 'inherit'}
          >
            {event.title}
          </Text>
        </HStack>
        <Text>{event.date}</Text>
        <Text>
          {event.startTime} - {event.endTime}
        </Text>
        <Text>{event.description}</Text>
        <Text>{event.location}</Text>
        <Text>카테고리: {event.category}</Text>
        {event.repeat.type !== 'none' && (
          <Text>
            반복: {event.repeat.interval}
            {getDateUnit(event.repeat.type)}마다
            {event.repeat.endDate && ` (종료: ${event.repeat.endDate})`}
          </Text>
        )}
        <Text>알림: {getNotificationLabel(event.notificationTime)}</Text>
      </VStack>
      <HStack>
        <IconButton aria-label="Edit event" icon={<EditIcon />} onClick={() => editEvent(event)} />
        <IconButton
          aria-label="Delete event"
          icon={<DeleteIcon />}
          onClick={() => deleteEvent(event.id)}
        />
      </HStack>
    </HStack>
  </Box>
);

export default EventCard;
