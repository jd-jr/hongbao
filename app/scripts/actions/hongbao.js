import {
  SPONSOR_REQUEST, SPONSOR_SUCCESS, SPONSOR_FAILURE, SPONSOR_CLEAR,
  RECEIVE_REQUEST, RECEIVE_SUCCESS, RECEIVE_FAILURE, RECEIVE_CLEAR
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
          paging: true
        }
      };
    case 'receive':
      return {
        entity: 'receivePagination',
        [CALL_API]: {
          types: [RECEIVE_REQUEST, RECEIVE_SUCCESS, RECEIVE_FAILURE],
          url: 'gaingift/info',
          schema: HongbaoSchemas.RECEIVE_LIST,
          body,
          paging: true
        }
      };
    default:
      return null;
  }
}

export function getHongbaoList(body = {}, type) {
  return (dispatch, getState) => {
    const state = getState();
    const {
      nextPage = 1, //请求传递的页面
      isFetching,
      lastPage //最后一页
    } = state.hongbao[type] || {};
    if (isFetching || lastPage) {
      return null;
    }
    return dispatch(fetchHongbaoList({...body, pageNum: nextPage}, type));
  };
}

