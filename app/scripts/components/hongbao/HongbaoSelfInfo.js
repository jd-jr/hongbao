import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import jdWalletApi from 'jd-wallet-sdk';
import deviceEnv from 'jd-wallet-sdk/lib/utils/device-env';
import perfect from '../../utils/perfect';
import callApi from '../../fetch';
import Modal from 'reactjs-modal';
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
    this.state = {
      refundStatus: props.refundStatus,
      refundVisible: false //显示申请退款弹框
    };
    const href = location.href;
    this.isView = href.indexOf('/hongbao/detail/view') !== -1;
    this.logistics = this.logistics.bind(this);
    this.refundPrompt = this.refundPrompt.bind(this);
    this.onClose = this.onClose.bind(this);
    this.reward = this.reward.bind(this);
    this.withdraw = this.withdraw.bind(this);
    this.viewMyhb = this.viewMyhb.bind(this);

    this.submitStatus = false;
  }

  //物流详情
  logistics() {
    //埋点
    perfect.setBuriedPoint('hongbao_received_logistics');
    const {giftRecordId} = this.props;
    this.context.router.push(`/logistics/${giftRecordId}`);
  }

  onClose(type) {
    this.setState({
      refundVisible: false
    }, () => {
      setTimeout(() => {
        if (type === 'ok') {
          this.refund();
        } else {
          this.submitStatus = false;
        }
      }, 300);
    });
  }

  // 提现
  withdraw(e) {
    //埋点
    perfect.setBuriedPoint('hongbao_received_withdraw');

    if (deviceEnv.inJdWallet) {
      e.stopPropagation();
      e.preventDefault();
      e.nativeEvent.preventDefault();
      e.nativeEvent.stopPropagation();
      jdWalletApi.openModule({name: 'BALANCE'});
    } else {
      //需要先联合登录
      perfect.unionLogin('https://qianbao.jd.com/p/page/download.htm?module=BALANCE');
    }
  }

  //兑奖
  reward() {
    const {giftRecordId, skuId, identifier} = this.props;
    setSessionStorage('skuId', skuId);
    setSessionStorage('giftRecordId', giftRecordId);
    setSessionStorage('identifier', identifier);
    //埋点
    perfect.setBuriedPoint('hongbao_received_reward');
    this.context.router.push('/myaddress');
  }

  refundPrompt() {
    if (this.submitStatus) {
      return;
    }
    this.submitStatus = true;
    this.setState({
      refundVisible: true
    });
    //埋点
    perfect.setBuriedPoint('hongbao_sponsored_refund');
  }

  //退款
  refund() {
    const {identifier, indexActions, setModalCloseCallback, updateSponsorGoal} = this.props;
    const accountType = perfect.getAccountType();
    const thirdAccId = perfect.getThirdAccId();
    const url = 'refund';
    const body = {
      identifier,
      accountId: thirdAccId,
      accountType
    };

    callApi({url, body, needAuth: true}).then(
      ({json, response}) => {
        indexActions.setErrorMessage('退款成功');
        setModalCloseCallback(() => {
          this.setState({
            refundStatus: 'REFUNDED'
          });
        });
        this.submitStatus = false;
        updateSponsorGoal('new');
      },
      (error) => {
        this.submitStatus = false;
        indexActions.setErrorMessage(error.message);
      }
    );
  }

  //查看我的红包，主要埋点用
  viewMyhb() {
    const {type} = this.props;
    //埋点
    perfect.setBuriedPoint(`hongbao${type && type === 'sponsor' ? '_my' : ''}_view_myhb`);
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
  winningStatus(confirmAddress) {
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
              {
                this.isView ? (
                  <div>
                    <button className="btn btn-primary btn-sm btn-arc" onTouchTap={this.reward}>
                      立即领奖
                    </button>
                    <p className="f-xs text-muted m-t-0-3">（温馨提示：请在15天内尽快维护收货地址）</p>
                  </div>
                ) : (
                  <div>
                    <Link to="/my" onTouchTap={this.viewMyhb} className="btn btn-primary btn-sm btn-arc">查看我的红包</Link>
                    <p className="f-xs text-muted m-t-0-3">（温馨提示：请在15天内尽快维护收货地址）</p>
                  </div>
                )
              }
            </div>
          </div>
        );
      case 'CONFIRMED':
        return (
          <div>
            <button onTouchTap={this.logistics}
                    className="btn btn-primary btn-sm btn-arc">
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

  /**
   * 退款状态
   * @param refundStatus
   * REFUNDED    已退款 我要发红包
   REDBAG_GOODS_TRANSFER_AND_REFOUND   申请退款、继续发送
   REDBAG_GOODS_TRANSFER    继续发送
   REDBAG_PUT_OUT 我要发红包
   REDBAG_GOODS_REFOUND 申请退款、我要发送红包
   FORBIDDEN_REFUND 禁止退款 我要发红包
   * @returns {XML}
   */
  renderRefundStatus(refundStatus) {
    if (refundStatus === 'REDBAG_GOODS_TRANSFER_AND_REFOUND' || refundStatus === 'REDBAG_GOODS_REFOUND') {
      return (
        <div>
          <span onClick={this.refundPrompt}
                className="btn btn-primary btn-sm btn-arc">申请退款
          </span>
          <p className="f-xs text-muted m-t-0-3">（温馨提示：退款须收部分平台服务费或继续发送此红包）</p>
        </div>
      );
    } else if (refundStatus === 'REFUNDED') {
      return (
        <div>
          - 已退款 -
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
          {
            this.isView ? (
              deviceEnv.inJdWallet ? (
                <span onTouchTap={this.withdraw} className="btn btn-primary btn-sm hb-fillet-1">去提现</span>
              ) : (
                <button onTouchTap={this.withdraw}
                        className="btn btn-primary btn-sm hb-fillet-1">去京东钱包提现</button>
              )
            ) : (
              <Link to="/my"
                    className="btn btn-primary btn-sm hb-fillet-1">查看我的红包</Link>
            )
          }
        </div>
      </div>
    );
  }

  renderStatus() {
    const {selfInfo, redbagSelf, type} = this.props;
    const {refundStatus} = this.state;
    //FIXME 发起者，不用后台返回的值判断，用前端的来源来判断
    //if (redbagSelf) {
    if (type && type === 'sponsor') {
      // 从自己发起入口进入，只允许退款
      return this.renderRefundStatus(refundStatus);
    } else { // 接收者
      if (selfInfo) {
        const {giftType, giftAmount, confirmAddress} = selfInfo;
        if (giftType === 'CASH') { //现金
          return this.cashStatus(giftAmount);
        } else { // 实物
          return this.winningStatus(confirmAddress);
        }
      }
    }
  }

  render() {
    const {refundVisible} = this.state;
    const footer = (
      <div className="row text-center">
        <div className="col-12 border-second border-right hb-active-btn p-y-0-5" onClick={() => this.onClose('cancel')}>
          取消
        </div>
        <div className="col-12 hb-active-btn p-y-0-5" onClick={() => this.onClose('ok')}>确定</div>
      </div>
    );

    return (
      <div>
        {this.renderStatus()}
        <Modal
          className="hb-alert"
          visible={refundVisible}
          style={{width: '90%'}}
          footerStyle={{padding: '0 10px'}}
          onClose={this.onClose}
          footer={footer}
          animation
          maskAnimation
          preventTouchmove
          closable={false}
        >
          <div>
            <h3 className="text-center">服务费说明</h3>
            <div className="row">
              <div className="col-12">
                <div>商品价格0-113元</div>
                <div>商品价格114-2179元</div>
                <div>商品价格2180元以上</div>
              </div>
              <div className="col-12">
                <div>费率=价格*8.5%+运费</div>
                <div>费率=价格*8.5%</div>
                <div>费率=180元</div>
              </div>
            </div>
          </div>
        </Modal>
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
  indexActions: PropTypes.object,
  setModalCloseCallback: PropTypes.func,
  type: PropTypes.string,
  updateSponsorGoal: PropTypes.func
};

export default HongbaoSelfInfo;
