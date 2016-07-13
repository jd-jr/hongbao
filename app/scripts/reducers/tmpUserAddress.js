/**
 * 新增 , 编辑用户信息临时存储
 */
import {UPDATE_TMP_USER_ADDRESS, INIT_TMP_USER_ADDRESS, RESET_TMP_USER_ADDRESS} from '../constants/AddressActionTypes';
import { assign } from 'lodash'

/*eslint-disable*/
var resetTmp = {
  id: null,
  name: '',
  mobile: '',
  addressDetail: '',
  addressDefault: false
};

export default function tmpUserAddress(state = resetTmp, action) {
  switch (action.type) {
    case INIT_TMP_USER_ADDRESS:
      return action.state;
    case UPDATE_TMP_USER_ADDRESS:
      return assign({}, state, action.state);
    case RESET_TMP_USER_ADDRESS:
      return resetTmp;
    default:
      return state;
  }
};
