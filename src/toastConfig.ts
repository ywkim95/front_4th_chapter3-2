export const DEFAULT_TOAST_DURATION = 3000;
export const TOAST_STATUS = {
  ERROR: 'error',
  INFO: 'info',
  SUCCESS: 'success',
} as const;

export const TOAST_MESSAGES = {
  SAVE_SUCCESS: '일정이 추가되었습니다.',
  SAVE_ERROR: '일정 저장 실패',
  MODIFY_SUCCESS: '일정이 수정되었습니다.',
  DELETE_SUCCESS: '일정이 삭제되었습니다.',
  DELETE_ERROR: '일정 삭제 실패',
  LOAD_SUCCESS: '일정 로딩 완료!',
  LOAD_ERROR: '이벤트 로딩 실패',
  REQUIRED: '필수 정보를 모두 입력해주세요.',
  TIME: '시간 설정을 확인해주세요.',
  REPEAT: '반복 설정을 확인해주세요.',
} as const;
