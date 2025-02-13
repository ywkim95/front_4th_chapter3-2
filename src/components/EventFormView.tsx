import {
  Button,
  Checkbox,
  Heading,
  HStack,
  Input,
  Select,
  Tooltip,
  VStack,
} from '@chakra-ui/react';

import FormField from './FormField.tsx';
import { categories, notificationOptions, repeatTypes } from '../config.ts';
import { useEventForm } from '../hooks/useEventForm.ts';
import { RepeatType } from '../types.ts';
import { getRepeatText } from '../utils/dateUtils.ts';
import { getTimeErrorMessage } from '../utils/timeValidation.ts';

interface EventFormProps {
  formState: ReturnType<typeof useEventForm>;
  onSubmit: () => void;
}
const EventFormView = ({ formState, onSubmit }: EventFormProps) => {
  const {
    title,
    setTitle,
    date,
    setDate,
    startTime,
    endTime,
    description,
    setDescription,
    location,
    setLocation,
    category,
    setCategory,
    isRepeating,
    setIsRepeating,
    repeatType,
    setRepeatType,
    repeatInterval,
    setRepeatInterval,
    repeatEndDate,
    setRepeatEndDate,
    notificationTime,
    setNotificationTime,
    startTimeError,
    endTimeError,
    handleEndTimeChange,
    handleStartTimeChange,
    editingEvent,
  } = formState;
  return (
    <VStack w="400px" spacing={5} align="stretch">
      <Heading>{editingEvent ? '일정 수정' : '일정 추가'}</Heading>

      <FormField label="제목">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </FormField>

      <FormField label="날짜">
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </FormField>

      <HStack width="100%">
        <FormField label="시작 시간">
          <Tooltip label={startTimeError} isOpen={!!startTimeError} placement="top">
            <Input
              type="time"
              value={startTime}
              onChange={handleStartTimeChange}
              onBlur={() => getTimeErrorMessage(startTime, endTime)}
              isInvalid={!!startTimeError}
            />
          </Tooltip>
        </FormField>
        <FormField label="종료 시간">
          <Tooltip label={endTimeError} isOpen={!!endTimeError} placement="top">
            <Input
              type="time"
              value={endTime}
              onChange={handleEndTimeChange}
              onBlur={() => getTimeErrorMessage(startTime, endTime)}
              isInvalid={!!endTimeError}
            />
          </Tooltip>
        </FormField>
      </HStack>

      <FormField label="설명">
        <Input value={description} onChange={(e) => setDescription(e.target.value)} />
      </FormField>

      <FormField label="위치">
        <Input value={location} onChange={(e) => setLocation(e.target.value)} />
      </FormField>

      <FormField label="카테고리">
        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">카테고리 선택</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField label="반복 설정">
        <Checkbox isChecked={isRepeating} onChange={(e) => setIsRepeating(e.target.checked)}>
          반복 일정
        </Checkbox>
      </FormField>

      <FormField label="알림 설정">
        <Select
          value={notificationTime}
          onChange={(e) => setNotificationTime(Number(e.target.value))}
        >
          {notificationOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </FormField>

      {isRepeating && (
        <VStack width="100%">
          <FormField label="반복 유형">
            <Select
              value={repeatType}
              onChange={(e) => setRepeatType(e.target.value as RepeatType)}
            >
              {repeatTypes.map((type) => (
                <option key={type} value={type}>
                  {getRepeatText(type)}
                </option>
              ))}
            </Select>
          </FormField>
          <HStack width="100%">
            <FormField label="반복 간격">
              <Input
                type="number"
                value={repeatInterval}
                onChange={(e) => setRepeatInterval(Number(e.target.value))}
                min={1}
              />
            </FormField>
            <FormField label="반복 종료일">
              <Input
                type="date"
                value={repeatEndDate}
                onChange={(e) => setRepeatEndDate(e.target.value)}
              />
            </FormField>
          </HStack>
        </VStack>
      )}

      <Button data-testid="event-submit-button" onClick={onSubmit} colorScheme="blue">
        {editingEvent ? '일정 수정' : '일정 추가'}
      </Button>
    </VStack>
  );
};

export default EventFormView;
