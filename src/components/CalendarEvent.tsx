import { BellIcon } from '@chakra-ui/icons';
import { Box, HStack, Text } from '@chakra-ui/react';

import { Event } from '../types.ts';

interface CalendarEventProps {
  event: Event;
  isNotified: boolean;
}

const CalendarEvent = ({ event, isNotified }: CalendarEventProps) => (
  <Box
    key={event.id}
    p={1}
    my={1}
    bg={isNotified ? 'red.100' : 'gray.100'}
    borderRadius='md'
    fontWeight={isNotified ? 'bold' : 'normal'}
    color={isNotified ? 'red.500' : 'inherit'}>
    <HStack spacing={1}>
      {isNotified && <BellIcon data-testid='BellIcon' />}
      <Text fontSize='sm' noOfLines={1}>
        {event.title}
      </Text>
    </HStack>
  </Box>
);

export default CalendarEvent;
