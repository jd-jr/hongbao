import {combineReducers} from 'redux';
import paginate from './paginate';
import {
  CATEGORY_LIST_REQUEST, CATEGORY_LIST_SUCCESS, CATEGORY_LIST_FAILURE,
  PRODUCT_LIST_REQUEST, PRODUCT_LIST_SUCCESS, PRODUCT_LIST_FAILURE, PRODUCT_LIST_CLEAR,
  SWITCH_TAB, PRICE_ORDER,
  SELECTED_PRODUCT, CLEAR_SELECT_PRODUCT,
} from '../constants/CategoryActionTypes';


const category = combineReducers({
  //产品列表数据
  productPagination: paginate({
    types: [PRODUCT_LIST_REQUEST, PRODUCT_LIST_SUCCESS, PRODUCT_LIST_FAILURE],
    clearType: PRODUCT_LIST_CLEAR
  }),
  //分类列表数据
  categoryList: paginate({
    types: [CATEGORY_LIST_REQUEST, CATEGORY_LIST_SUCCESS, CATEGORY_LIST_FAILURE],
    paging: false
  }),
  //选中的tab标签
  activeTab: (state = null, action) => {
    switch (action.type) {
      case SWITCH_TAB:
        return action.activeTab;
      default:
        return state;
    }
  },
  //价格排序
  priceOrder: (state = null, action) => {
    if (action.type === PRICE_ORDER) {
      return action.order;
    }
    return state;
  },
  //选中产品
  selectedProduct: (state = null, action) => {
    switch (action.type) {
      case SELECTED_PRODUCT:
        return action.skuId;
      case CLEAR_SELECT_PRODUCT:
        return null;
      default:
        return state;
    }
  },
});

export default category;
