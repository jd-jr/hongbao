import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import {Link} from 'react-router';
import walletApi from 'jd-wallet-sdk';
import deviceEnv from 'jd-wallet-sdk/lib/utils/device-env';
import perfect from '../../utils/perfect';
import callApi from '../../fetch';
import Guide from '../Guide';
import {setSessionStorage} from '../../utils/sessionStorage';
import {setLocalStorage, getLocalStorage} from '../../utils/localStorage';

class HongbaoSelfInfo extends Component {
  constructor(props, context) {
    super(props, context);
    const href = location.href;
    this.isView = href.indexOf('/hongbao/detail/view') !== -1;
    this.logistics = this.logistics.bind(this);
    this.reward = this.reward.bind(this);
    this.withdraw = this.withdraw.bind(this);
    this.viewMyhb = this.viewMyhb.bind(this);
    this.closeGuide = this.closeGuide.bind(this);

    this.submitStatus = false;
    this.guide = false;
  }

  componentWillMount() {
    //判断是否中奖，实物奖还是现金奖，然后根据状态显示不同的浮层
    if (!this.isView) {
      return;
    }
    const {participantInfo, type} = this.props;
    if (type && type === 'sponsor') {
      return;
    }

    if (getLocalStorage('guide-detail') === 'true') {
      return;
    }

    this.guide = true;
    if (participantInfo) {
      const {giftType} = participantInfo;
      if (giftType === 'CASH') { //现金
        this.imgUrl = 'detail.png';
      } else if (giftType === 'GOODS') { // 实物
        this.imgUrl = 'detail-winning.png';
      } else { //未中奖
        this.imgUrl = 'detail-no-winning.png';
      }
    } else { //未中奖
      this.imgUrl = 'detail-no-winning.png';
    }
  }

  componentDidMount() {
    if (this.guide) {
      const guideCom = (<Guide closeGuide={this.closeGuide} imgUrl={this.imgUrl}/>);
      this.guideContainer = document.createElement('div');
      document.body.appendChild(this.guideContainer);

      ReactDOM.unstable_renderSubtreeIntoContainer(this,
        guideCom, this.guideContainer);
    }
  }

  componentWillUnmount() {
    if (this.drawForm) {
      document.body.removeChild(this.drawForm);
    }
    this.destoryGuide();
  }

  // 销毁 Guide
  destoryGuide() {
    if (this.guideContainer) {
      ReactDOM.unmountComponentAtNode(this.guideContainer);
      document.body.removeChild(this.guideContainer);
      this.guideContainer = null;
    }
  }

  //关闭引导
  closeGuide(e) {
    //防点透处理
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.preventDefault();
    e.nativeEvent.stopPropagation();

    this.destoryGuide();
    setLocalStorage('guide-detail', 'true');
  }

  //物流详情
  logistics() {
    //埋点
    perfect.setBuriedPoint('hongbao_received_logistics');
    const {participantInfo} = this.props;
    const {giftRecordId} = participantInfo;
    this.context.router.push(`/logistics/${giftRecordId}`);
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
      walletApi.openModule({name: 'BALANCE'});
    } else {
      location.href = 'https://m.jdpay.com/wallet/balance/index.htm?style=non_title';
    }
  }

  //兑奖或修改地址
  reward() {
    const {participantInfo, skuId, identifier} = this.props;
    const {giftRecordId} = participantInfo;
    setSessionStorage('skuId', skuId);
    setSessionStorage('giftRecordId', giftRecordId);
    setSessionStorage('identifier', identifier);
    //埋点
    perfect.setBuriedPoint('hongbao_received_reward');
    this.context.router.push('/myaddress');
  }

  //查看我的红包，主要埋点用
  viewMyhb() {
    const {type} = this.props;
    //埋点
    perfect.setBuriedPoint(`hongbao${type && type === 'sponsor' ? '_my' : ''}_view_myhb`);
  }

  /**
   * 判断中奖以及领奖状态
   * @param goodsStatus
   领取人看到的实物状态(红包类型为CASH时为null)
   (WAIT_CONFIRM：待领取，
   GIVEING：领取中，
   GAINED：已领取，
   EXPIRED：已过期)
   * @returns {XML}
   */
  winningStatus(goodsStatus) {
    /*eslint-disable indent*/
    switch (goodsStatus) {
      case 'EXPIRED': //已过期
        return (
          <div>
            <div className="text-center text-muted">
              <span className="hb-money">恭喜你</span>
            </div>
          </div>
        );
      case 'WAIT_CONFIRM': //待领取
        return (
          <div>
            <div className="text-center">
              <span className="hb-money text-primary">恭喜你</span>
            </div>
            <div>
              {
                this.isView ? (
                  <div>
                    <button className="btn btn-primary btn-sm btn-arc hb-btn-mid hb-receive-animate"
                            style={{padding: '0.5rem 2rem',fontSize: '1.5rem'}}
                            onTouchTap={this.reward}>
                      立即领取<span className="arrow-hollow-right arrow-r-white2"></span>
                    </button>
                    <p className="f-xs text-muted m-t-0-3">（温馨提示：请在15天内尽快维护收货地址）</p>
                  </div>
                ) : (
                  <div>
                    <Link to="/my"
                          onTouchTap={this.viewMyhb}
                          style={{padding: '0.5rem 2rem',fontSize: '1.5rem'}}
                          className="btn btn-primary btn-sm btn-arc hb-btn-mid hb-receive-animate">
                      立即领取<span className="arrow-hollow-right arrow-r-white2"></span></Link>
                    <p className="f-xs text-muted m-t-0-3">（温馨提示：请在15天内尽快维护收货地址）</p>
                  </div>
                )
              }
            </div>
          </div>
        );
      case 'GAINED': //已领取
        return (
          <div>
            <div className="text-center">
              <span className="hb-money text-primary">恭喜你</span>
            </div>
            <div>
              <button onTouchTap={this.logistics}
                      className="btn btn-primary btn-sm btn-arc">
                物流详情
              </button>
            </div>
          </div>
        );
      case 'GIVEING': //领取中
        return (
          <div>
            <div className="text-center">
              <span className="hb-money text-primary">恭喜你</span>
            </div>
            <div>
              <button onTouchTap={this.logistics}
                      className="btn btn-primary btn-sm btn-arc">
                物流详情
              </button>
            </div>
            <div className="m-t-0-5">
              <span className="text-link f-sm" onTouchTap={this.reward}>
                修改地址
              </span>
            </div>
          </div>
        );
      default :
        return null;
    }
  }

  // 现金状态
  cashStatus(cashAmount) {
    return (
      <div>
        <div className="text-center text-primary">
          <span className="hb-money">{(cashAmount / 100).toFixed(2)}</span> <span>元</span>
        </div>
        <div>
          {
            this.isView ? (
              deviceEnv.inJdWallet ? (
                <span onTouchTap={this.withdraw}
                      className="btn btn-primary btn-sm hb-fillet-1 hb-btn-mid hb-receive-animate">立即提现
                  <span className="arrow-hollow-right arrow-r-white3"></span></span>
              ) : (
                <button onTouchTap={this.withdraw}
                        style={{paddingLeft:'0.6rem',paddingRight:'0.6rem'}}
                        className="btn btn-primary btn-sm hb-fillet-1 hb-btn-mid hb-receive-animate">立即提现
                  <span className="arrow-hollow-right arrow-r-white3"></span>
                </button>
              )
            ) : (
              <Link to="/my"
                    className="btn btn-primary btn-sm hb-fillet-1 hb-btn-mid hb-receive-animate">查看我的红包
                <span className="arrow-hollow-right arrow-r-white3"></span>
              </Link>
            )
          }
        </div>
      </div>
    );
  }

  /**
   * 发起人查看红包状态
   * @param goodsStatus
   发起人看到的实物状态
   (NOT_GAIN：未领取，
   WAIT_CONFIRM：待领取，
   GAINED：已领取，
   REFUNED：已退款)
   * @returns {XML}
   */

  renderSponsorStatus(goodsStatus) {
    /*eslint-disable indent*/
    switch (goodsStatus) {
      case 'REFUNED':
        return (
          <div>
            - 已退款 -
          </div>
        );
      default :
        return null;
    }
  }

  render() {
    const {participantInfo, sponsorInfo, type} = this.props;
    if (type && type === 'sponsor') {
      // 从自己发起入口进入
      const {goodsStatus} = sponsorInfo || {};
      return this.renderSponsorStatus(goodsStatus);
    } else { // 接收者
      const {giftType, cashAmount, goodsStatus} = participantInfo || {};
      if (giftType === 'CASH') {
        return this.cashStatus(cashAmount);
      } else if (giftType === 'GOODS') {
        return this.winningStatus(goodsStatus);
      }
      return null;
    }
  }
}

HongbaoSelfInfo.contextTypes = {
  router: PropTypes.object.isRequired
};

HongbaoSelfInfo.propTypes = {
  skuId: PropTypes.string,
  identifier: PropTypes.string,
  indexActions: PropTypes.object,
  setModalCloseCallback: PropTypes.func,
  type: PropTypes.string,
  participantInfo: PropTypes.object,
  sponsorInfo: PropTypes.object,
  redbagStatus: PropTypes.string,
};

export default HongbaoSelfInfo;
