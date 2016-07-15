import {
  RESET_ERROR_MESSAGE, SET_ERROR_MESSAGE,
  SET_TOAST, CLEAR_TOAST
} from '../constants/IndexActionTypes';

// 删除错误信息
export function resetErrorMessage() {
  return {
    type: RESET_ERROR_MESSAGE
  };
}

// 设置错误信息
export function setErrorMessage(errorMessage) {
  return {
    type: SET_ERROR_MESSAGE,
    errorMessage
  };
}


// 设置 toast，包括内容和样式
export function setToast(content, effect = 'enter') {
  return {
    type: SET_TOAST,
    content,
    effect
  };
}

// 清空 toast
export function clearToast(effect = 'leave') {
  return {
    type: CLEAR_TOAST,
    effect
  };
}
