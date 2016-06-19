import {Schema, arrayOf} from 'normalizr';

// 注意这里的 schema 名称必须跟 action 和 reducer 中定义的实体名称一样
const sponsorSchema = new Schema('sponsorPagination');
const receiveSchema = new Schema('receivePagination');

export default {
  SPONSOR_LIST: arrayOf(sponsorSchema),
  RECEIVE_LIST: arrayOf(receiveSchema)
};
