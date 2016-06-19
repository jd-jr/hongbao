const mockjs = require('mockjs');

module.exports = mockjs.mock({
  code: 'RB000000',
  msg: '调用成功',
  data: {
    pageNum: 1,
    pageSize: 20,
    totalCount: 20,
    pageCount: 1,
    list: [{
      id: '1',
      skuId: '100934',
      skuName: '京东E卡',
      price: 'null',
      bizPrice: '12000',
      status: 'SALE_UP',
      beginDate: '2016-06-15 00:00:00',
      createDate: '2016-06-15 00:00:00',
      indexImg: '//img30.360buyimg.com/cms/jfs/t2767/199/1633966269/88015/5c2f906b/57451706N0a0381dc.jpg'
    }]
  }
});

