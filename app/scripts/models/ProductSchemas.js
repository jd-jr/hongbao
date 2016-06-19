import {Schema, arrayOf} from 'normalizr';

// 注意这里的 schema 名称必须跟 action 和 reducer 中定义的实体名称一样
const productSchema = new Schema('productPagination');
const categorySchema = new Schema('categoryList');

export default {
  PRODUCT_LIST: arrayOf(productSchema),
  CATEGORY_LIST: arrayOf(categorySchema)
};
