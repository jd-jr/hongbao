import {Schema, arrayOf} from 'normalizr';

function getEntityId(entity) {
  return entity.identifier + entity.giftRecordId;
}

// 注意这里的 schema 名称必须跟 action 和 reducer 中定义的实体名称一样
const sponsorSchema = new Schema('sponsorPagination', {
  idAttribute: getEntityId
});
const receiveSchema = new Schema('receivePagination', {
  idAttribute: getEntityId
});

const receiveLuckSchema = new Schema('receiveLuckPagination', {
  idAttribute: getEntityId
});

export default {
  SPONSOR_LIST: arrayOf(sponsorSchema),
  RECEIVE_LIST: arrayOf(receiveSchema),
  RECEIVE_LUCK_LIST: arrayOf(receiveLuckSchema)
};

