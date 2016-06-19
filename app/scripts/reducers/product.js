import {combineReducers} from 'redux';
import paginate from './paginate';
import * as ProductActionTypes from '../constants/ProductActionTypes';

const {
  PRODUCT_LIST_REQUEST, PRODUCT_LIST_SUCCESS, PRODUCT_LIST_FAILURE, PRODUCT_CLEAR,
  CATEGORY_LIST_REQUEST, CATEGORY_LIST_SUCCESS, CATEGORY_LIST_FAILURE,
  SWITCH_CATEGORY, PRICE_ORDER
} = ProductActionTypes;

const product = combineReducers({
  productPagination: paginate({
    types: [PRODUCT_LIST_REQUEST, PRODUCT_LIST_SUCCESS, PRODUCT_LIST_FAILURE],
    clearType: PRODUCT_CLEAR
  }),

  categoryList: paginate({
    types: [CATEGORY_LIST_REQUEST, CATEGORY_LIST_SUCCESS, CATEGORY_LIST_FAILURE],
    paging: false
  }),

  activeCategory: (state = 0, action) => {
    if (action.type === SWITCH_CATEGORY) {
      return action.activeCategory;
    }
    return state;
  },

  priceOrder: (state = null, action) => {
    if (action.type === PRICE_ORDER) {
      return action.order;
    }
    return state;
  }

});

export default product;
