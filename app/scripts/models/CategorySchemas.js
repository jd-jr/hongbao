import {Schema, arrayOf} from 'normalizr';

function getEntityId(entity) {
  return entity.skuId;
}

// 注意这里的 schema 名称必须跟 action 和 reducer 中定义的实体名称一样
const categorySchema = new Schema('categoryList');
const productSchema = new Schema('productPagination', {
  idAttribute: getEntityId
});

export default {
  PRODUCT_LIST: arrayOf(productSchema),
  CATEGORY_LIST: arrayOf(categorySchema)
};
