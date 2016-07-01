import {
  PARTICIPANTS_REQUEST, PARTICIPANTS_SUCCESS, PARTICIPANTS_FAILURE, PARTICIPANTS_CLEAR,
  HONGBAO_DETAIL_REQUEST, HONGBAO_DETAIL_SUCCESS, HONGBAO_DETAIL_FAILURE, HONGBAO_DETAIL_CLEAR
} from '../constants/HongbaoDetailActionTypes';

import HongbaoDetailSchemas from '../models/HongbaoDetailSchemas';
import {CALL_API} from '../middleware/api';

// 红包参与者
/*eslint-disable indent*/
function fetchParticipantList(body) {
  return {
    entity: 'participantPagination',
    [CALL_API]: {
      types: [PARTICIPANTS_REQUEST, PARTICIPANTS_SUCCESS, PARTICIPANTS_FAILURE],
      url: 'gainerList',
      schema: HongbaoDetailSchemas.PARTICIPANT_LIST,
      body,
      paging: true,
      needAuth: true
    }
  };
}

export function getParticipantList(body = {}) {
  return (dispatch, getState) => {
    const state = getState();
    const {
      pageNum = 1, //请求传递的页面
      isFetching,
      lastPage //最后一页
    } = state.hongbaoDetail.participantPagination || {};
    if (isFetching || lastPage) {
      return null;
    }
    return dispatch(fetchParticipantList({...body, pageNum, pageSize: 5}));
  };
}

// 红包详情
function fetchHongbaoDetail(body) {
  return {
    entity: 'hongbaoInfo',
    unSchema: true,
    [CALL_API]: {
      types: [HONGBAO_DETAIL_REQUEST, HONGBAO_DETAIL_SUCCESS, HONGBAO_DETAIL_FAILURE],
      url: 'info',
      schema: 'hongbaoInfo',
      body,
      needAuth: true
    }
  };
}

export function getHongbaoDetail(body) {
  return (dispatch, getState) => {
    return dispatch(fetchHongbaoDetail(body));
  };
}
