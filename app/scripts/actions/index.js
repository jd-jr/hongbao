import {RESET_ERROR_MESSAGE, SET_ERROR_MESSAGE} from '../constants/IndexActionTypes';

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
