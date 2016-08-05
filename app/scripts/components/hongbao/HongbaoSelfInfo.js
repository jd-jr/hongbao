import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import {Link} from 'react-router';
import jdWalletApi from 'jd-wallet-sdk';
import deviceEnv from 'jd-wallet-sdk/lib/utils/device-env';
import perfect from '../../utils/perfect';
import callApi from '../../fetch';
import Modal from 'reactjs-modal';
import Guide from '../Guide';
import {setSessionStorage} from '../../utils/sessionStorage';
import {setLocalStorage, getLocalStorage} from '../../utils/localStorage';

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
      refundVisible: false, //显示申请退款弹框
    };
    const href = location.href;
    this.isView = href.indexOf('/hongbao/detail/view') !== -1;
    this.logistics = this.logistics.bind(this);
    this.refundPrompt = this.refundPrompt.bind(this);
    this.onClose = this.onClose.bind(this);
    this.reward = this.reward.bind(this);
    this.withdraw = this.withdraw.bind(this);
    this.viewMyhb = this.viewMyhb.bind(this);
    this.closeGuide = this.closeGuide.bind(this);

    this.submitStatus = false;
    // 申请退款状态
    this.refundStatusArr = ['REDBAG_WHOLE_REFUND', 'REDBAG_GOODS_REFOUND', 'RECEIVE_COMPLETE_GOODS_REFUND', 'REDBAG_WHOLE_REFUND_TRANSFER'];

    //中实物状态
    this.winningStatusArr = ['FORBIDDEN_CONFIRME', 'UNCONFIRMED', 'CONFIRMED', 'UNORDER', 'WAIT_STOCK'];
    this.guide = false;
  }

  componentWillMount() {
    //判断是否中奖，实物奖还是现金奖，然后根据状态显示不同的浮层
    if (!this.isView) {
      return;
    }
    const {selfInfo, type} = this.props;
    if (type && type === 'sponsor') {
      return;
    }

    if (getLocalStorage('guide-detail') === 'true') {
      return;
    }

    this.guide = true;
    if (selfInfo) {
      const {giftType, confirmAddress} = selfInfo;
      if (giftType === 'CASH') { //现金
        this.imgUrl = 'detail.png';
      } else if (this.winningStatusArr.indexOf(confirmAddress) !== -1) { // 实物
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

  componentWillUnmout() {
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
      const url = 'user/Classification';
      const body = {
        accountType: perfect.getAccountType(),
        thirdAccId: perfect.getThirdAccId()
      };

      callApi({url, body}).then((res) => {
        /**
         isJdUser 该用户是否有京东账号
         isCustomerUser 该用户是否有钱包账号
         encryptData  String  加密报文
         signData  String  签名
         signType  String  签名类型
         postUrl  String  form表单提交路径
         */
        const {isCustomerUser, isJdUser, encryptData, signData, signType, postUrl} = res.json.data;
        if (isJdUser === false) {
          //需要先联合登录
          perfect.unionLogin('https://qianbao.jd.com/p/page/download.htm?module=BALANCE');
          return;
        }
        if (isCustomerUser === false) {
          this.createDrawForm({
            encryptData,
            signData,
            signType,
            postUrl
          });
          return;
        }
        location.href = 'https://qianbao.jd.com/p/page/download.htm?module=BALANCE';
      }, (error) => {

      });
    }
  }

  // 创建提现 form 表单
  createDrawForm({
    encryptData,
    signData,
    signType,
    postUrl
  }) {
    const form = document.createElement('form');
    form.action = postUrl;
    form.method = 'post';
    const html = `<input type="hidden" name="encrypt_data" value="${encryptData}"/>
                  <input type="hidden" name="sign_data" value="${signData}"/>
                  <input type="hidden" name="sign_type" value="${signType}"/>`;
    form.innerHTML = html;
    this.drawForm = form;
    form.submit();
  }

  //兑奖或修改地址
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
              <span className="hb-money">恭喜你</span>
            </div>
          </div>
        );
      case 'UNCONFIRMED':
        return (
          <div>
            <div className="text-center">
              <span className="hb-money text-primary">恭喜你</span>
            </div>
            <div>
              {
                this.isView ? (
                  <div>
                    <button className="btn btn-primary btn-sm btn-arc" onTouchTap={this.reward}>
                      立即领取
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
      case 'UNORDER' :
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
   REDBAG_WHOLE_REFUND_TRANSFER 全额退款，可继续发送
   REDBAG_PUT_OUT 我要发红包
   REDBAG_GOODS_REFOUND 申请退款、我要发送红包
   FORBIDDEN_REFUND 禁止退款 我要发红包

   REDBAG_WHOLE_REFUND("红包可全额退款"), //只有现金被领取实物可全退
   REDBAG_GOODS_REFOUND("红包实物可退款"),
   RECEIVE_COMPLETE_GOODS_REFUND  已抢光，可退款
   * @returns {XML}
   */

  renderRefundStatus(refundStatus) {
    if (this.refundStatusArr.indexOf(refundStatus) !== -1) {
      const {giftGainedNum} = this.props;
      return (
        <div>
          <span onClick={this.refundPrompt}
                className="btn btn-primary btn-sm btn-arc">申请退款
          </span>
          <p className="f-xs text-muted m-t-0-5">
            （温馨提示：{refundStatus === 'REDBAG_WHOLE_REFUND' || refundStatus === 'REDBAG_WHOLE_REFUND_TRANSFER' ? '您可继续发送此红包或申请全额退款' : '退款须收部分平台服务费或继续发送此红包'}）</p>
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
                <span onTouchTap={this.withdraw} className="btn btn-primary btn-sm hb-fillet-1">立即提现</span>
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
    const {refundVisible, refundStatus} = this.state;
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
            {refundStatus === 'REDBAG_WHOLE_REFUND' || refundStatus === 'REDBAG_WHOLE_REFUND_TRANSFER' ? (
              <div>
                <div>您可申请全额退款，退款金额将原路返回</div>
                <div>预计1-3个工作日到账</div>
              </div>
            ) : (
              <div className="row">
                <div className="col-12" style={{paddingRight: '0'}}>
                  <div>商品价格0-2180元(不含)</div>
                  <div>商品价格2180元以上</div>
                </div>
                <div className="col-12">
                  <div>费率=商品价格*8%</div>
                  <div>费率=160元</div>
                </div>
                <div className="col-24 m-t-1">
                  退款金额将原路返回，预计1-3个工作日到账。
                </div>
              </div>
            )}
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
  updateSponsorGoal: PropTypes.func,
  giftGainedNum: PropTypes.number
};

export default HongbaoSelfInfo;
