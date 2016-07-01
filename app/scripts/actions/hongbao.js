import {
  SPONSOR_REQUEST, SPONSOR_SUCCESS, SPONSOR_FAILURE, SPONSOR_CLEAR,
  RECEIVE_REQUEST, RECEIVE_SUCCESS, RECEIVE_FAILURE, RECEIVE_CLEAR,
  USER_INFO_REQUEST, USER_INFO_SUCCESS, USER_INFO_FAILURE
} from '../constants/HongbaoActionTypes';

import HongbaoSchemas from '../models/HongbaoSchemas';
import {CALL_API} from '../middleware/api';

// 我发起的红包 sponsor 我收到的红包 receive
/*eslint-disable indent*/
function fetchHongbaoList(body, type) {
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
        }
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
        }
      };
    default:
      return null;
  }
}

export function getHongbaoList(body = {}, type) {
  return (dispatch, getState) => {
    const state = getState();
    let {
      pageNum = 1, //请求传递的页面
      isFetching,
      lastPage //最后一页
    } = state.hongbao[`${type}Pagination`] || {};
    if (isFetching || lastPage) {
      return null;
    }
    return dispatch(fetchHongbaoList({...body, pageSize: 5, pageNum}, type));
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
