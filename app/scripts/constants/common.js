/**
 * 红包状态码
 NEED_PAY 需要支付
 OK 可以
 RECEIVE_COMPLETE 红包被领取完成
 EXPIRED 红包过期
 FAIL 其他未知状态
 HAS_RECEIVE 已经领取过
 REDBAG_NOT_FOUND  红包不存在
 * @type {Array}
 */
export const HONGBAO_STATUS = ['NEED_PAY', 'OK', 'RECEIVE_COMPLETE', 'EXPIRED', 'FAIL', 'HAS_RECEIVE', 'REDBAG_NOT_FOUND'];

//有效的状态码，即能弹出领取红包的弹框
export const HONGBAO_VALID_STATUS = ['OK', 'RECEIVE_COMPLETE', 'EXPIRED', 'HAS_RECEIVE'];

export const HONGBAO_INVALID_STATUS = ['NEED_PAY', 'FAIL', 'REDBAG_NOT_FOUND'];

export const HONGBAO_TITLE = '恭喜发财，京东红包！';

export const HONGBAO_DESC = '一个用快递邮寄的红包！  京东红包';

export const NICKNAME = '匿名';
