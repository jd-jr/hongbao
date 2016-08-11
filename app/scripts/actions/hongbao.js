import {
  SPONSOR_REQUEST, SPONSOR_SUCCESS, SPONSOR_FAILURE, SPONSOR_CLEAR,
  RECEIVE_REQUEST, RECEIVE_SUCCESS, RECEIVE_FAILURE, RECEIVE_CLEAR,
  USER_INFO_REQUEST, USER_INFO_SUCCESS, USER_INFO_FAILURE, USER_INFO_CLEAR,
  RECEIVE_HONGBAO_TYPE
} from '../constants/HongbaoActionTypes';

import HongbaoSchemas from '../models/HongbaoSchemas';
import {CALL_API} from '../middleware/api';

// 我发起的红包 sponsor 我收到的红包 receive
/*eslint-disable indent*/
function fetchHongbaoList(body, type, clear) {
  switch (type) {
    case 'sponsor':
      return {
        entity: 'sponsorPagination',
        [CALL_API]: {
          types: [SPONSOR_REQUEST, SPONSOR_SUCCESS, SPONSOR_FAILURE],
          url: 'putout/info',
          schema: HongbaoSchemas.SPONSOR_LIST,
          body,
          paging: true,
          needAuth: true
        },
        clear
      };
    case 'receive':
      return {
        entity: 'receivePagination',
        [CALL_API]: {
          types: [RECEIVE_REQUEST, RECEIVE_SUCCESS, RECEIVE_FAILURE],
          url: body.lucky === 'LUCK' ? 'giftluck/info' : 'gaingift/info',
          schema: HongbaoSchemas.RECEIVE_LIST,
          body,
          paging: true,
          needAuth: true
        },
        clear
      };
    default:
      return null;
  }
}

export function getHongbaoList(body = {}, type, clear) {
  return (dispatch, getState) => {
    const state = getState();
    let pageNum = 1; //请求传递的页面
    let lastPage; //最后一页
    const pagination = state.hongbao[`${type}Pagination`] || {};
    const {isFetching} = pagination;

    if (!clear) {
      pageNum = pagination.pageNum;
      lastPage = pagination.lastPage;
    }

    if (isFetching || lastPage) {
      return Promise.reject();
    }
    return dispatch(fetchHongbaoList({...body, pageSize: 20, pageNum}, type, clear));
  };
}

//清空我收到的红包
export function clearReceive() {
  return {
    type: RECEIVE_CLEAR,
    entity: 'receivePagination',
    clear: true
  }
}

//清空我发出的红包
export function clearSponsor() {
  return {
    type: SPONSOR_CLEAR,
    entity: 'sponsorPagination',
    clear: true
  }
}

// 用户信息
function fetchUserInfo(body) {
  return {
    entity: 'userInfo',
    unSchema: true,
    [CALL_API]: {
      types: [USER_INFO_REQUEST, USER_INFO_SUCCESS, USER_INFO_FAILURE],
      url: 'user/info/index',
      schema: 'userInfo',
      body,
      needAuth: true
    }
  };
}

export function getUserInfo(body = {}) {
  return (dispatch, getState) => {
    return dispatch(fetchUserInfo(body));
  };
}

//清空用户信息
export function clearUserInfo() {
  return {
    type: USER_INFO_CLEAR,
    entity: 'userInfo',
    unSchema: true,
    clear: true
  }
}

//记录是手气最佳还是已收到所有红包
// received 已收红包， luck 手气最佳
export function receiveType(from) {
  return {
    type: RECEIVE_HONGBAO_TYPE,
    from
  };
}
