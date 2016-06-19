const mockjs = require('mockjs');

module.exports = mockjs.mock({
  code: 'RB000000',
  msg: '调用成功',
  data: [{
    id: '1',
    name: '并肩同事',
    status: 'ON',
    parentId: 'null'
  }, {
    id: '2',
    name: '爸爸妈妈',
    status: 'ON',
    parentId: 'null'
  }, {
    id: '3',
    name: '男女朋友',
    status: 'ON',
    parentId: 'null'
  }, {
    id: '4',
    name: '亲密爱人',
    status: 'ON',
    parentId: 'null'
  }]
});

