import {
  HONGBAO_INFO, CLEAR_HONGBAO_INFO
} from '../constants/HomeActionTypes';

// 保存红包信息
export function setHongbaoInfo(hongbaoInfo) {
  return {
    type: HONGBAO_INFO,
    hongbaoInfo
  };
}

// 清空红包信息
export function clearHongbaoInfo() {
  return {
    type: CLEAR_HONGBAO_INFO
  };
}
