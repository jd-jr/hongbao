import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import deviceEnv from 'jd-wallet-sdk/lib/utils/device-env';
import {setSessionStorage} from '../../utils/sessionStorage';

/**
 * 发起者和领取者
 * @param selfInfo
 * @param giftRecordId
 * @param skuId
 * @param redbagSelf 红包是否为该用户发起(是：true；否：false)
 * @param refundStatus 红包退款状态 (红包非该用户发起时，该字段为null；红包为该用户发起时，
 * 该字段定义如下； ALLOW_REFUND：允许退款 FORBIDDEN_REFUND：禁止退款， REFUNDED 已退款)
 * @returns {XML}
 */
/*eslint-disable no-else-return*/
class HongbaoSelfInfo extends Component {
  constructor(props, context) {
    super(props, context);
    this.reward = this.reward.bind(this);
    this.logistics = this.logistics.bind(this);
  }

  //物流详情
  logistics() {
    const {giftRecordId} = this.props;
    this.context.router.push(`/logistics/${giftRecordId}`);
  }

  //兑奖
  reward(giftRecordId, skuId) {
    const {identifier} = this.props;
    setSessionStorage('skuId', skuId);
    setSessionStorage('giftRecordId', giftRecordId);
    setSessionStorage('identifier', identifier);
    this.context.router.push('/myaddress');
  }

  /**
   * 判断中奖以及领奖状态
   * @param confirmAddress
   * 是否确认过收货地址(
   礼品类型为现金时为null
   礼品类型为实物时)
   确认过：CONFIRMED；
   已确认，等待补货：WAIT_STOCK；
   未确认过：UNCONFIRMED；
   已过期，不能再确认：FORBIDDEN_CONFIRME)
   * @param giftRecordId
   * @param skuId
   * @returns {XML}
   */
  winningStatus(confirmAddress, giftRecordId, skuId) {
    /*eslint-disable indent*/
    switch (confirmAddress) {
      case 'FORBIDDEN_CONFIRME':
        return (
          <div>
            <div className="text-center text-muted">
              <span className="hb-money">中奖啦</span>
            </div>
          </div>
        );
      case 'UNCONFIRMED':
        return (
          <div>
            <div className="text-center">
              <span className="hb-money text-primary">中奖啦</span>
            </div>
            <div>
              <button onTouchTap={() => this.reward(giftRecordId, skuId)}
                      className="btn btn-primary btn-sm btn-arc">
                立即领奖
              </button>
            </div>
          </div>
        );
      case 'CONFIRMED':
        return (
          <div>
            <button onTouchTap={this.logistics}
                    className="btn btn-primary btn-outline-primary btn-sm btn-arc">
              物流详情
            </button>
          </div>
        );
      case 'WAIT_STOCK':
        return (
          <div>
            <span>- 等待补货 -</span>
          </div>
        );
      default :
        return null;
    }
  }

  //退款状态
  refundStatus(refundStatus) {
    if (refundStatus === 'ALLOW_REFUND') {
      return (
        <div>
          <button onTouchTap={this.refund} className="btn btn-primary btn-outline-primary btn-sm btn-arc">申请退款
          </button>
        </div>
      );
    } else if (refundStatus === 'REFUNDED') {
      return (
        <div className="text-muted">
          已退款
        </div>
      );
    }
  }

  // 现金状态
  cashStatus(giftAmount) {
    return (
      <div>
        <div className="text-center text-primary">
          <span className="hb-money">{(giftAmount / 100).toFixed(2)}</span> <span>元</span>
        </div>
        <div>
          <Link to="/my"
                className="btn btn-primary btn-sm hb-fillet-1">{deviceEnv.inJdWallet ? '提现' : '去京东钱包提现'}</Link>
        </div>
      </div>
    );
  }

  renderStatus() {
    const {selfInfo, giftRecordId, skuId, redbagSelf, refundStatus} = this.props;
    //发起者
    if (redbagSelf) {
      if (selfInfo) { //自己抢到红包
        const {giftType, giftAmount, confirmAddress} = selfInfo;
        if (giftType === 'CASH') { //现金
          return this.cashStatus(giftAmount);
        } else { // 实物
          // 优先判断是否可以退款
          if (refundStatus) {
            return this.refundStatus(refundStatus);
          }
          return this.winningStatus(confirmAddress, giftRecordId, skuId);
        }
      } else { //自己没有抢自己的红包
        return this.refundStatus(refundStatus);
      }
    } else { // 接收者
      if (selfInfo) {
        const {giftType, giftAmount, confirmAddress} = selfInfo;
        if (giftType === 'CASH') { //现金
          return this.cashStatus(giftAmount);
        } else { // 实物
          return this.winningStatus(confirmAddress, giftRecordId, skuId);
        }
      }
    }
  }

  render() {
    return (
      <div>
        {this.renderStatus()}
      </div>
    );
  }
}

HongbaoSelfInfo.contextTypes = {
  router: PropTypes.object.isRequired
};

HongbaoSelfInfo.propTypes = {
  selfInfo: PropTypes.object,
  giftRecordId: PropTypes.string,
  skuId: PropTypes.string,
  redbagSelf: PropTypes.bool,
  refundStatus: PropTypes.string,
  identifier: PropTypes.string,
};

export default HongbaoSelfInfo;
