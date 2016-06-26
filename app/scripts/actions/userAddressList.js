import {
  INIT_USER_ADD_LIST,
  SET_DEFAULT_ADDRESS,
  DELETE_ADDRESS
} from '../constants/AddressActionTypes';

//初始化用户收货地址
export function setUserAddressList(state) {
  return {
    type: INIT_USER_ADD_LIST,
    state
  }
}
//设置成默认地址
export function setDefaultAddress(id ){
  return {
    type: SET_DEFAULT_ADDRESS,
    id
  }
}
//删除用户收货地址
export function deleteUserAddress( index ){
  return {
    type: DELETE_ADDRESS,
    index
  }
}
