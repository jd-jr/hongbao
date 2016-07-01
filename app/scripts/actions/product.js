import {
  PRODUCT_LIST_REQUEST, PRODUCT_LIST_SUCCESS, PRODUCT_LIST_FAILURE, PRODUCT_CLEAR,
  CATEGORY_LIST_REQUEST, CATEGORY_LIST_SUCCESS, CATEGORY_LIST_FAILURE,
  PRODUCT_REQUEST, PRODUCT_SUCCESS, PRODUCT_FAILURE,
  SWITCH_CATEGORY, PRICE_ORDER
} from '../constants/ProductActionTypes';

import ProductSchemas from '../models/ProductSchemas';
import {CALL_API} from '../middleware/api';

//获取商品分页列表
function fetchProductList(body) {
  return {
    entity: 'productPagination',
    [CALL_API]: {
      types: [PRODUCT_LIST_REQUEST, PRODUCT_LIST_SUCCESS, PRODUCT_LIST_FAILURE],
      url: 'item/list',
      body,
      schema: ProductSchemas.PRODUCT_LIST,
      paging: true
    }
  };
}

export function getProductList(body = {}) {
  return (dispatch, getState) => {
    const {
      pageNum = 1, //请求传递的页面
      isFetching,
      lastPage //最后一页
    } = getState().product.productPagination || {};
    if (isFetching || lastPage) {
      return null;
    }
    return dispatch(fetchProductList({...body, pageNum, pageSize: 10}));
  };
}

//清空数据
export function clearProductList() {
  return {
    type: PRODUCT_CLEAR,
    entity: 'productPagination',
    clear: true
  }
}

// 分类信息
function fetchCategoryList() {
  return {
    entity: 'categoryList',
    [CALL_API]: {
      types: [CATEGORY_LIST_REQUEST, CATEGORY_LIST_SUCCESS, CATEGORY_LIST_FAILURE],
      url: 'item/category',
      body: {
        parentCategoryId: 0
      },
      schema: ProductSchemas.CATEGORY_LIST
    }
  };
}

export function getCategoryList() {
  return (dispatch, getState) => {
    const {
      isFetching
    } = getState().product.categoryList || {};
    if (isFetching) {
      return null;
    }
    return dispatch(fetchCategoryList());
  };
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

// 切换分类 分类ID 传null查询所有分类的商品
export function switchCategory(activeCategory) {
  return {
    type: SWITCH_CATEGORY,
    activeCategory
  }
}

// 价格排序   desc 降序，asc 升序   null  该字段不参与排序
export function switchPriceOrder(order) {
  return {
    type: PRICE_ORDER,
    order
  }
}

