import {Schema, arrayOf} from 'normalizr';

function getEntityId(entity) {
  return entity.giftRecordId;
}

// 注意这里的 schema 名称必须跟 action 和 reducer 中定义的实体名称一样
// 红包参与者列表
const participantSchema = new Schema('participantPagination', {
  idAttribute: getEntityId
});

export default {
  PARTICIPANT_LIST: arrayOf(participantSchema),
};

