import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
} from '@chakra-ui/react';
import { useRef } from 'react';

interface ModifyDialogProps {
  isModifyDialogOpen: boolean;
  onClose: () => void;
  onProceedSingle: () => void;
  onProceedAll: () => void;
}

const ModifyDialog = ({
  isModifyDialogOpen,
  onClose,
  onProceedSingle,
  onProceedAll,
}: ModifyDialogProps) => {
  const cancelRef = useRef<HTMLButtonElement>(null);
  return (
    <AlertDialog isOpen={isModifyDialogOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            반복 일정 수정
          </AlertDialogHeader>

          <AlertDialogBody>이 일정은 반복 일정입니다. 전체를 수정하시겠습니까?</AlertDialogBody>

          <AlertDialogFooter>
            <Button colorScheme="teal" onClick={onProceedSingle} ml={3}>
              단일 수정
            </Button>
            <Button colorScheme="blue" onClick={onProceedAll} ml={3}>
              전체 수정
            </Button>
            <Button ref={cancelRef} onClick={onClose} ml={3}>
              취소
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default ModifyDialog;
