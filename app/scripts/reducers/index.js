import {combineReducers} from 'redux';
import {routerReducer as routing} from 'react-router-redux';
import entity from './entity';
import caches from './caches';
import product from './product';
import hongbao from './hongbao';
import hongbaoDetail from './hongbaoDetail';
import address from './address';
import tmpUserAddress from './tmpUserAddress';

import {
  RESET_ERROR_MESSAGE, SET_ERROR_MESSAGE,
  SET_TOAST, CLEAR_TOAST
} from '../constants/IndexActionTypes';

function errorMessage(state = null, action) {
  const {type, error} = action;
  if (type === RESET_ERROR_MESSAGE) {
    return null;
  } else if (type === SET_ERROR_MESSAGE) {
    return action.errorMessage;
  } else if (error) {
    return error;
  }
  return state;
}

// 设置 toast 内容
function toast(state = {}, action) {
  const {type, content, effect} = action;
  if (type === CLEAR_TOAST) {
    return {content: state.content, effect};
  } else if (type === SET_TOAST) {
    return {content, effect};
  }
  return state;
}

export default combineReducers({
  errorMessage,
  toast,
  routing,
  entity,
  caches,
  product,
  hongbao,
  hongbaoDetail,
  address,
  tmpUserAddress
});
