import {
  INIT_USER_ADD_LIST,
  SET_DEFAULT_ADDRESS,
  DELETE_ADDRESS,
  INIT_TMP_USER_ADDRESS,
  UPDATE_TMP_USER_ADDRESS,
  RESET_TMP_USER_ADDRESS,
  ADD_USER_ADDRESS,
  UPDATE_USER_ADDRESS
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

//新增用户收货地址
export function addUserAddress(state ){
  return {
    type: ADD_USER_ADDRESS,
    state
  }
}
//更新用户收货地址
export function updateUserAddress(state ){
  return {
    type: UPDATE_USER_ADDRESS,
    state
  }
}
//初始化临时用户信息
export function initTmpUserAddress( state ){
  return {
    type: INIT_TMP_USER_ADDRESS,
    state
  }
}
//更新临时用户信息
export function updateTmpUserAddress( state ){
  return {
    type:UPDATE_TMP_USER_ADDRESS,
    state
  }
}
//重置临时用户地址信息
export function resetTmpUserAddress(){
  return {
    type: RESET_TMP_USER_ADDRESS
  }
}
