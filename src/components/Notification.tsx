import { Alert, AlertIcon, AlertTitle, Box, CloseButton } from '@chakra-ui/react';

interface NotificationProps {
  message: string;
  index: number;
  onClose: (index: number) => void;
}

const Notification = ({ message, index, onClose }: NotificationProps) => (
  <Alert key={index} status="info" variant="solid" width="auto">
    <AlertIcon />
    <Box flex="1">
      <AlertTitle fontSize="sm">{message}</AlertTitle>
    </Box>
    <CloseButton onClick={() => onClose(index)} />
  </Alert>
);

export default Notification;
