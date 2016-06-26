import {INIT_USER_ADD_LIST, SET_DEFAULT_ADDRESS, DELETE_ADDRESS} from '../constants/AddressActionTypes';


export default function address(state = [], action) {
  switch (action.type) {
    case INIT_USER_ADD_LIST:
      return action.state.concat();
      break;
    case SET_DEFAULT_ADDRESS:
      const id = action.id
      var newState = state.concat();
      newState.forEach(function (item, index) {
        if (item.id == id) {
          item.addressDefault = true;
        } else {
          item.addressDefault = false;
        }
      })
      return newState;
      break;
    case DELETE_ADDRESS:
      var newState = state.concat();
      newState.splice(action.index, 1);
      return newState;
      break;
    default:
      return state;
      break;
  }
};
