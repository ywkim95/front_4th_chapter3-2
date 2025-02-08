import { VStack } from '@chakra-ui/react';

import Notification from './Notification.tsx';

interface NotificationListProps {
  notifications: { id: string; message: string }[];
  onClose: (index: number) => void;
}

const NotificationList = ({ notifications, onClose }: NotificationListProps) => (
  <VStack position='fixed' top={4} right={4} spacing={2} align='flex-end'>
    {notifications.map((notification, index) => (
      <Notification
        key={notification.id}
        message={notification.message}
        index={index}
        onClose={onClose}
      />
    ))}
  </VStack>
);

export default NotificationList;
