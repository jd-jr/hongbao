import {combineReducers} from 'redux';
import paginate from './paginate';

import {
  PARTICIPANTS_REQUEST, PARTICIPANTS_SUCCESS, PARTICIPANTS_FAILURE, PARTICIPANTS_CLEAR,
} from '../constants/HongbaoDetailActionTypes';

const hongbaoDetail = combineReducers({
  participantPagination: paginate({
    types: [PARTICIPANTS_REQUEST, PARTICIPANTS_SUCCESS, PARTICIPANTS_FAILURE],
    clearType: PARTICIPANTS_CLEAR
  }),

});

export default hongbaoDetail;

