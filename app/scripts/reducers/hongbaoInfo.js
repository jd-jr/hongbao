import {
  HONGBAO_INFO, CLEAR_HONGBAO_INFO
} from '../constants/HomeActionTypes';

function hongbaoInfo(state = null, action) {
  const {type} = action;
  if (type === CLEAR_HONGBAO_INFO) {
    return null;
  } else if (type === HONGBAO_INFO) {
    return action.hongbaoInfo;
  }
  return state;
}

export default hongbaoInfo;
