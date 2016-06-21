const mockjs = require('mockjs');

module.exports = mockjs.mock({
  code: 'RB000000',
  msg: '调用成功',
  data: [{
    id: '1',
    categoryName: '并肩同事',
    status: 'ON',
    parentId: 'null'
  }, {
    id: '2',
    categoryName: '爸爸妈妈',
    status: 'ON',
    parentId: 'null'
  }, {
    id: '3',
    categoryName: '男女朋友',
    status: 'ON',
    parentId: 'null'
  }, {
    id: '4',
    categoryName: '亲密爱人',
    status: 'ON',
    parentId: 'null'
  }, {
    id: '5',
    categoryName: '我的专属',
    status: 'ON',
    parentId: 'null'
  }, {
    id: '6',
    categoryName: '亲密朋友',
    status: 'ON',
    parentId: 'null'
  }]
});

