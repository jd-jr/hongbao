import {combineReducers} from 'redux';
import paginate from './paginate';

import {
  SPONSOR_REQUEST, SPONSOR_SUCCESS, SPONSOR_FAILURE, SPONSOR_CLEAR,
  RECEIVE_REQUEST, RECEIVE_SUCCESS, RECEIVE_FAILURE, RECEIVE_CLEAR
} from '../constants/HongbaoActionTypes';

const hongbao = combineReducers({
  sponsorPagination: paginate({
    types: [SPONSOR_REQUEST, SPONSOR_SUCCESS, SPONSOR_FAILURE],
    clearType: SPONSOR_CLEAR
  }),

  receivePagination: paginate({
    types: [RECEIVE_REQUEST, RECEIVE_SUCCESS, RECEIVE_FAILURE],
    clearType: RECEIVE_CLEAR
  })

});

export default hongbao;

