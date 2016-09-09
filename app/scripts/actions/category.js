import {
  SUBJECT_LIST_REQUEST, SUBJECT_LIST_SUCCESS, SUBJECT_LIST_FAILURE, SUBJECT_LIST_CLEAR,
  CATEGORY_LIST_REQUEST, CATEGORY_LIST_SUCCESS, CATEGORY_LIST_FAILURE,
  PRODUCT_LIST_REQUEST, PRODUCT_LIST_SUCCESS, PRODUCT_LIST_FAILURE, PRODUCT_LIST_CLEAR,
  PRODUCT_REQUEST, PRODUCT_SUCCESS, PRODUCT_FAILURE, PRODUCT_CLEAR,
  SWITCH_TAB, PRICE_ORDER,
  SELECTED_PRODUCT, CLEAR_SELECT_PRODUCT,
  SAVE_LIST_TYPE, CLEAR_LIST_TYPE,
} from '../constants/CategoryActionTypes';

import CategorySchemas from '../models/CategorySchemas';
import {CALL_API} from '../middleware/api';

//获取主题分页列表
function fetchSubjectList(body) {
  return {
    entity: 'subjectList',
    unSchema: true,
    [CALL_API]: {
      types: [SUBJECT_LIST_REQUEST, SUBJECT_LIST_SUCCESS, SUBJECT_LIST_FAILURE],
      url: 'item/subject',
      body,
      schema: 'subjectList',
      paging: false
    }
  };
}

export function getSubjectList(body = {}) {
  return (dispatch, getState) => {
    const subjectList = getState().entity.subjectList || {};
    const {isFetching} = subjectList;

    if (isFetching) {
      return Promise.reject();
    }
    return dispatch(fetchSubjectList(body));
  };
}

// 分类信息
function fetchCategoryList() {
  return {
    entity: 'categoryList',
    [CALL_API]: {
      types: [CATEGORY_LIST_REQUEST, CATEGORY_LIST_SUCCESS, CATEGORY_LIST_FAILURE],
      url: 'item/category',
      body: {
        parentCategoryId: 0 // 参数,所有分类
      },
      schema: CategorySchemas.CATEGORY_LIST,
      paging: false
    }
  };
}

export function getCategoryList() {
  return (dispatch, getState) => {
    const {
      isFetching
    } = getState().category.categoryList || {};
    if (isFetching) {
      return null;
    }
    return dispatch(fetchCategoryList());
  };
}

//获取商品分页列表
function fetchProductList(body, clear) {
  return {
    entity: 'productPagination',
    [CALL_API]: {
      types: [PRODUCT_LIST_REQUEST, PRODUCT_LIST_SUCCESS, PRODUCT_LIST_FAILURE],
      url: 'item/list',
      body,
      schema: CategorySchemas.PRODUCT_LIST,
      paging: true
    },
    clear
  };
}

export function getProductList(body = {}, clear) {
  return (dispatch, getState) => {
    let pageNum = 1; //请求传递的页面
    let lastPage; //最后一页
    const productPagination = getState().category.productPagination || {};
    const {isFetching} = productPagination;
    if (!clear) {
      pageNum = productPagination.pageNum;
      lastPage = productPagination.lastPage;
    }

    if (isFetching || lastPage) {
      return Promise.reject();
    }
    return dispatch(fetchProductList({...body, pageNum, pageSize: 10}, clear));
  };
}

//清空商品列表
export function clearProductList() {
  return {
    type: PRODUCT_LIST_CLEAR,
    entity: 'productPagination',
    clear: true
  }
}


// 商品详情
function fetchProductDetail(skuId) {
  return {
    entity: 'productDetail',
    unSchema: true,
    [CALL_API]: {
      types: [PRODUCT_REQUEST, PRODUCT_SUCCESS, PRODUCT_FAILURE],
      url: 'item/detail',
      schema: 'productDetail',
      body: {skuId}
    }
  };
}

export function getProductDetail(skuId) {
  return (dispatch, getState) => {
    return dispatch(fetchProductDetail(skuId));
  };
}

//清空商品详情
export function clearProduct() {
  return {
    type: PRODUCT_CLEAR,
    entity: 'productDetail',
    unSchema: true,
    clear: true
  }
}


// 切换tab,"人气(hot)、新品(new)、价格(price)、筛选(filter)",默认为"人气"。
export function switchTab(activeTab = "hot") {
  return {
    type: SWITCH_TAB,
    activeTab
  }
}

// 价格排序   desc 降序，asc 升序   null  该字段不参与排序
export function switchPriceOrder(order) {
  return {
    type: PRICE_ORDER,
    order
  }
}


// 已选中的商品 skuId ，目前是单选，后续多选的话，修改成数组
export function selectProduct(skuId) {
  return {
    type: SELECTED_PRODUCT,
    skuId
  }
}

//清空选中的商品
export function clearSelectProduct() {
  return {
    type: CLEAR_SELECT_PRODUCT
  }
}


//存储查看方式,列表|方块
export function setListType(type) {
  return {
    type: SAVE_LIST_TYPE,
    t: type,
  }
}
//清空查看方式,列表|方块
export function clearListType() {
  return {
    type: CLEAR_LIST_TYPE
  }
}
