const mockjs = require('mockjs');

module.exports = mockjs.mock({
  code: 'RB000000',
  msg: 'OK',
  data: {
    redbagInfo: {
      identifier: '红包ID',
      title: '我在京东钱包发起了个实物和现金红包，快来抢啊！',
      totalAmount: 1000,
      giftNum: 10,
      giftGainedNum: 1,
      ownerType: 'WALLET、WECHAT、QQ',
      ownerId: '发起者ID',
      expiredDate: '过期时间',
      finishedDate: '完成时间',
      redbagStatus: '红包状态 支付成功PAY_SUCC、已完成RECEIVE_COMPLETE、已过期EXPIRED、已退款REFUNDED'
    },
    itemInfo: {
      skuId: 'skuId',
      skuName: '暴龙太阳墨镜 男女情侣款蛤蟆镜 暴龙太阳墨镜 男女情侣款蛤蟆镜B',
      icon: '//img30.360buyimg.com/cms/jfs/t2767/199/1633966269/88015/5c2f906b/57451706N0a0381dc.jpg'
    },
    self: {
      nickname: '用户昵称',
      face: '//img30.360buyimg.com/cms/jfs/t2767/199/1633966269/88015/5c2f906b/57451706N0a0381dc.jpg',
      giftType: 'CASH、GOODS',
      amount: 1000,
      accountType: '账户类型 可选值：WALLET WBCHAT QQ',
      thirdAccId: '账户id，可选值 微信unionID 钱包customerId '
    },
    record: [
      {
        id: 1,
        giftType: 'CASH、GOODS',
        amount: 1000,
        nickname: '金刚狼',
        face: '//img30.360buyimg.com/cms/jfs/t2767/199/1633966269/88015/5c2f906b/57451706N0a0381dc.jpg',
        accountType: '账户类型 可选值：WALLET WBCHAT QQ',
        thirdAccId: '账户id，可选值 微信unionID 钱包customerId '
      },
      {
        id: 2,
        giftType: 'CASH、GOODS',
        amount: 1000,
        nickname: '用户昵称',
        face: '用户头像',
        accountType: '账户类型 可选值：WALLET WBCHAT QQ',
        thirdAccId: '账户id，可选值 微信unionID 钱包customerId '
      }
    ]
  }
});

