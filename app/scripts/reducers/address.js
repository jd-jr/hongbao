import {INIT_USER_ADD_LIST, SET_DEFAULT_ADDRESS, DELETE_ADDRESS, ADD_USER_ADDRESS, UPDATE_USER_ADDRESS} from '../constants/AddressActionTypes';


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
    case ADD_USER_ADDRESS:
      var newState = state.concat()
      newState.unshift(action.state)
      return newState;
      break;
    case UPDATE_USER_ADDRESS:
      var newState = state.concat();
      var _index = action.state.index;
      newState = newState.map(function (item, index) {
        console.log(index==_index, '-------')
        if (_index == index) {
          console.log(action.state.addedAddress,'1111')
          return action.state.addedAddress;
        } else {
          return item;
        }
      })
      console.log(newState, 'sdfssss')
      return newState;
      break;
    default:
      return state;
      break;
  }
};
