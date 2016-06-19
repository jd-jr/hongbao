import assign from 'lodash/assign'

// 用来保存 fetch 实体数据
export default function entity(state = {}, action) {
  const {unSchema, clear, entity, res} = action;
  if (unSchema) {
    if (clear) { // 如果设置了 clean 为 true，表示重置数据
      return assign({}, state, {[entity]: undefined});
    }

    if (res && entity) {
      return assign({}, state, {[entity]: res[entity]});
    }
  }

  return state;
}
