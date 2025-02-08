import { Input, Text, VStack } from '@chakra-ui/react';

import EventCard from './EventCard.tsx';
import FormField from './FormField.tsx';
import { Event } from '../types.ts';

interface EventListViewProps {
  searchTerm: string;
  events: Event[];
  notifiedEvents: string[];
  onSearchChange: (searchTerm: string) => void;
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void;
}

const EventListView = ({
  searchTerm,
  events,
  notifiedEvents,
  onSearchChange,
  onEdit,
  onDelete,
}: EventListViewProps) => (
  <VStack data-testid='event-list' w='500px' h='full' overflowY='auto'>
    <FormField label='일정 검색'>
      <Input
        placeholder='검색어를 입력하세요'
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </FormField>

    {events.length === 0 ? (
      <Text>검색 결과가 없습니다.</Text>
    ) : (
      events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          isNotified={notifiedEvents.includes(event.id)}
          editEvent={onEdit}
          deleteEvent={onDelete}
        />
      ))
    )}
  </VStack>
);

export default EventListView;
