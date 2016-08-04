import {
  PARTICIPANTS_REQUEST, PARTICIPANTS_SUCCESS, PARTICIPANTS_FAILURE, PARTICIPANTS_CLEAR,
  HONGBAO_DETAIL_REQUEST, HONGBAO_DETAIL_SUCCESS, HONGBAO_DETAIL_FAILURE, HONGBAO_DETAIL_CLEAR
} from '../constants/HongbaoDetailActionTypes';

import HongbaoDetailSchemas from '../models/HongbaoDetailSchemas';
import {CALL_API} from '../middleware/api';

// 红包参与者
/*eslint-disable indent*/
function fetchParticipantList(body, clear) {
  return {
    entity: 'participantPagination',
    [CALL_API]: {
      types: [PARTICIPANTS_REQUEST, PARTICIPANTS_SUCCESS, PARTICIPANTS_FAILURE],
      url: 'gainerList',
      schema: HongbaoDetailSchemas.PARTICIPANT_LIST,
      body,
      paging: true,
      needAuth: true
    },
    clear
  };
}

export function getParticipantList(body = {}, clear) {
  return (dispatch, getState) => {
    const state = getState();
    let pageNum = 1; //请求传递的页面
    let lastPage; //最后一页
    const pagination = state.hongbaoDetail.participantPagination || {};
    const {isFetching} = pagination;

    if (!clear) {
      pageNum = pagination.pageNum;
      lastPage = pagination.lastPage;
    }

    if (isFetching || lastPage) {
      return Promise.reject();
    }
    return dispatch(fetchParticipantList({...body, pageNum, pageSize: 10}, clear));
  };
}

//清空红包参与者
export function clearParticipant() {
  return {
    type: PARTICIPANTS_CLEAR,
    entity: 'participantPagination',
    clear: true
  }
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

//清空红包详情
export function clearHongbaoDetail() {
  return {
    type: HONGBAO_DETAIL_CLEAR,
    entity: 'hongbaoInfo',
    unSchema: true,
    clear: true
  }
}
