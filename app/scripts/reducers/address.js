import {
  INIT_USER_ADD_LIST,
  SET_DEFAULT_ADDRESS,
  DELETE_ADDRESS,
  ADD_USER_ADDRESS,
  UPDATE_USER_ADDRESS,
  CLEAR_USER_ADD_LIST
} from '../constants/AddressActionTypes';

/*eslint-disable indent*/
//地址列表
export default function address(state = null, action) {
  let newState = (state || []).concat();
  switch (action.type) {
    case INIT_USER_ADD_LIST:
      return action.state.concat();
    case CLEAR_USER_ADD_LIST:
      return null;
    case SET_DEFAULT_ADDRESS: {
      const id = action.id;
      newState.forEach((item, index) => {
        if (item.id === id) {
          item.addressDefault = true;
        } else {
          item.addressDefault = false;
        }
      });
      return newState;
    }
    case DELETE_ADDRESS: {
      newState.splice(action.index, 1);
      return newState;
    }
    case ADD_USER_ADDRESS:
      newState.unshift(action.state);
      return newState;
    case UPDATE_USER_ADDRESS: {
      let _index = Number(action.state.index);
      newState = newState.map((item, index) => {
        if (_index === index) {
          return action.state.addedAddress;
        }
        return item;
      });
      return newState;
    }
    default:
      return state;
  }
}
