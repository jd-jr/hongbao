import {combineReducers} from 'redux';
import {routerReducer as routing} from 'react-router-redux';
import entity from './entity';
import caches from './caches';
import product from './product';
import hongbao from './hongbao';

import {RESET_ERROR_MESSAGE} from '../constants/IndexActionTypes';

/*eslint-disable indent*/
function errorMessage(state = null, action) {
  const {type, error} = action;
  if (type === RESET_ERROR_MESSAGE) {
    return null;
  } else if (error) {
    return action.error;
  }
  return state;
}

export default combineReducers({
  errorMessage,
  routing,
  entity,
  caches,
  product,
  hongbao
});
