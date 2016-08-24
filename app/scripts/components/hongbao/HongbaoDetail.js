import React, {Component, PropTypes} from 'react';
import walletApi from 'jd-wallet-sdk';
import deviceEnv from 'jd-wallet-sdk/lib/utils/device-env';
import PullRefresh from 'reactjs-pull-refresh';
import base64 from 'js-base64';
import Loading from '../../ui/Loading';
import perfect from '../../utils/perfect';
import {HONGBAO_TITLE, SHOW_FOOT_DELAY} from '../../constants/common';
import HongbaoSelfInfo from './HongbaoSelfInfo';
import HongbaoGainedList from './HongbaoGainedList';
import Initiate from '../home/Initiate';
import defaultHeadPic from '../../../images/headpic.png';
import {NICKNAME, SHARE_TITLE_COMMON, SHARE_DESC, SHARE_TITLE_GIFT, SHARE_TITLE_CASH} from '../../constants/common';
import routeSetting from '../../routes/routeSetting';
import HelpFeedback from '../HelpFeedback';
import Ribbons from '../Ribbons';

const {Base64} = base64;

// 红包详情
class HongbaoDetail extends Component {
  constructor(props, context) {
    super(props, context);
    const thirdAccId = perfect.getThirdAccId();
    let isAuthorize = true;
    if (deviceEnv.inWx) {
      isAuthorize = Boolean(thirdAccId);
    }
    this.isAuthorize = isAuthorize; // 在微信中是否授权
    this.state = {
      showFoot: false,
      sponsorGoal: 'new', // 判断底部显示状态，是重新发起，还是继续发送
      showInitiate: false, // 继续发送状态
      hongbaoExpired: false //红包是否过期
    };

    const href = location.href;
    //是否从拆红包入口进入，true 表示是
    this.isUnPack = href.indexOf('/view') === -1;

    this.reSponsor = this.reSponsor.bind(this);
    this.closeHongbao = this.closeHongbao.bind(this);
    this.strategy = this.strategy.bind(this);
    this.updateSponsorGoal = this.updateSponsorGoal.bind(this);

    this.refreshCallback = this.refreshCallback.bind(this);
    this.loadMoreCallback = this.loadMoreCallback.bind(this);
    this.clearMenu = this.clearMenu.bind(this);
    //可继续发送状态
    this.againSend = ['REDBAG_GOODS_TRANSFER_AND_REFOUND', 'REDBAG_GOODS_TRANSFER', 'REDBAG_WHOLE_REFUND_TRANSFER'];

    //红包详情页
    this.isView = href.indexOf('/hongbao/detail/view') !== -1;
  }

  componentWillMount() {
    // 如果在微信中还没有授权，则直接返回
    if (!this.isAuthorize) {
      return;
    }
    //延迟显示底部按钮，解决 IOS 下底部按钮设置 fixed 的问题
    setTimeout(() => {
      this.setState({
        showFoot: true
      });
    }, SHOW_FOOT_DELAY);

    this.loadData();
  }

  shouldComponentUpdate(nextProps, nextState) {
    const {hongbaoInfo} = nextProps;
    if (hongbaoInfo.skuId) {
      return true;
    }
    return false;
  }

  componentWillUnmount() {
    const {hongbaoDetailAction} = this.props;
    hongbaoDetailAction.clearHongbaoDetail();
    hongbaoDetailAction.clearParticipant();
  }

  // 下拉刷新回调函数
  refreshCallback() {
    this.loadData();
    return this.loadList(true);
  }

  //加载更多
  loadMoreCallback() {
    return this.loadList();
  }

  loadData() {
    //加载红包详情
    const {hongbaoDetailAction, identifier, type} = this.props;
    const accountType = perfect.getAccountType();
    const thirdAccId = perfect.getThirdAccId();
    let body = {
      identifier,
      accountType,
      thirdAccId
    };

    return hongbaoDetailAction.getHongbaoDetail(body)
      .then((json) => {
        const {res} = json || {};
        /**
         REFUNDED    已退款 我要发红包
         REDBAG_GOODS_TRANSFER_AND_REFOUND   申请退款、继续发送
         REDBAG_GOODS_TRANSFER    继续发送
         REDBAG_WHOLE_REFUND_TRANSFER 全额退款，可继续发送
         REDBAG_PUT_OUT 我要发红包
         REDBAG_GOODS_REFOUND 申请退款、我要发送红包
         FORBIDDEN_REFUND 禁止退款 我要发红包

         REDBAG_WHOLE_REFUND("红包可全额退款"), //只有现金被领取实物可全退
         REDBAG_GOODS_REFOUND("红包实物可退款"),
         RECEIVE_COMPLETE_GOODS_REFUND  已抢光，可退款
         */
          //this.againSend = ['REDBAG_GOODS_TRANSFER_AND_REFOUND', 'REDBAG_GOODS_TRANSFER', 'REDBAG_WHOLE_REFUND_TRANSFER'];
        const {hongbaoInfo} = res || {};
        const {refundStatus, status} = hongbaoInfo || {};
        //如果红包已过期，而且是发起者进入，则显示继续发送
        if (type && type === 'sponsor' && this.againSend.indexOf(refundStatus) !== -1) {
          this.setState({
            sponsorGoal: 'again'
          });
        }

        if (status === 'EXPIRED') {
          this.setState({
            hongbaoExpired: true
          });
        }
        if (!this.setShared) {
          this.share(hongbaoInfo);
          this.setShared = true;
        }
      });
  }

  loadList(clear) {
    // 加载红包列表
    const {hongbaoDetailAction, identifier} = this.props;
    const accountType = perfect.getAccountType();
    const thirdAccId = perfect.getThirdAccId();
    if (deviceEnv.inWx && !thirdAccId) {
      return;
    }
    const body = {
      identifier,
      accountType,
      thirdAccId
    };
    return hongbaoDetailAction.getParticipantList(body, clear);
  }

  //重新发起或继续发送
  reSponsor(e) {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.preventDefault();
    e.nativeEvent.stopPropagation();

    const {sponsorGoal, type} = this.state;

    if (sponsorGoal === 'new') {
      //埋点
      perfect.setBuriedPoint(this.isUnPack ?
        `hongbao${type && type === 'sponsor' ? '_my' : ''}_wantto_sponsor`
        : `hongbao${type && type === 'sponsor' ? '_sponsored' : '_received'}_wantto`);

      this.context.router.push('/');
    } else {
      //埋点
      perfect.setBuriedPoint(this.isUnPack ? 'hongbao_my_continue' : 'hongbao_sponsored_continue');

      this.setState({
        showInitiate: true
      });
    }
  }

  // 红包攻略
  strategy(e) {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.preventDefault();
    e.nativeEvent.stopPropagation();

    const {type} = this.props;
    //埋点
    perfect.setBuriedPoint(`hongbao${type && type === 'sponsor' ? '_my' : ''}_guide`);
    this.context.router.push('/strategy');
  }

  //在 HongbaoSelfInfo 中处理逻辑后，需要修改 sponsorGoal，来判断是继续发送，还是我要发红包
  updateSponsorGoal(sponsorGoal) {
    this.setState({
      sponsorGoal
    });
  }

  // 关闭发送红包
  closeHongbao() {
    this.setState({
      showInitiate: false
    });
  }

  share(hongbaoInfo) {
    const {ownerHeadpic, ownerNickname, skuIcon, skuName, selfInfo} = hongbaoInfo;
    let url = `${perfect.getLocationRoot()}share.html`;
    let params = '';
    let title = SHARE_TITLE_COMMON;
    let desc = SHARE_DESC;
    if (selfInfo) {
      const {giftAmount, giftType} = selfInfo;
      const type = giftType === 'GOODS' ? 'gift' : 'cash';
      params += `type=${type}&headpic=${ownerHeadpic}&nickname=${ownerNickname}`;
      if (giftType === 'GOODS') {
        params += `&skuname=${skuName}&skuicon=${skuIcon}`;
        title = SHARE_TITLE_GIFT;
      } else {
        params += `&amount=${(giftAmount / 100).toFixed(2)}`;
        title = SHARE_TITLE_CASH;
      }
    }
    //由于京东钱包在 ios 中分享 url 会截取 & 后面的内容，这里需要处理一下
    if (params) {
      params = Base64.encode(params);
      params = encodeURIComponent(params);
      url += `?params=${params}`;
    }
    if (deviceEnv.inWx) {
      routeSetting.weixinShare({url, title, desc});
    } else if (deviceEnv.inJdWallet) {
      routeSetting.setShareData({url, title, desc});
    }
  }

  //在钱包中去掉帮助页面分享
  clearMenu() {
    if (deviceEnv.inJdWallet) {
      walletApi.setMenu();
    }
  }

  /**
   * 根据红包状态码显示不同的进度条
   NEED_PAY 需要支付
   OK 可以
   RECEIVE_COMPLETE 红包被领取完成
   EXPIRED 红包过期
   FAIL 其他未知状态
   HAS_RECEIVE 已经领取过
   REDBAG_NOT_FOUND  红包不存在
   * @type {Array}
   */
  /*eslint-disable indent*/
  renderProgress({goodsNum, giftNum, giftGainedNum, status, createdDate, finishedDate}) {
    const momeyText = giftNum - goodsNum > 0 ? `，${giftNum - goodsNum}个现金红包` : '';
    switch (status) {
      case 'OK': //领取中
      case 'PAY_SUCC':
        return (
          <div className="text-muted">
            已领取{giftGainedNum}/{giftNum}，共{goodsNum}个礼物{momeyText}。
          </div>
        );
      case 'RECEIVE_COMPLETE':
        return (
          <div className="text-muted">共{goodsNum}个礼物{momeyText}。
            {perfect.formatMillisecond(finishedDate - createdDate)}抢光
          </div>
        );
      case 'EXPIRED':
        return (
          <div className="text-muted">共{goodsNum}个礼物{momeyText}。该红包已过期</div>
        );
      case 'REFUNDED': //已退款
        return (
          <div className="text-muted">共{goodsNum}个礼物{momeyText}。该红包已退款</div>
        );
      default:
        return null;
    }
  }

  /**
   * 显示底部按钮
   * 如果是拆红包，则显示红包攻略和我要发红包
   * 如果是发送者显示。。。
   * 如果是接收者显示。。。
   * @returns {*}
   */
  renderFooter() {
    const {showFoot, sponsorGoal} = this.state;
    const {type} = this.props;
    const isUnPack = this.isUnPack;
    if (!showFoot) {
      return;
    }

    return isUnPack ? (
      <footer className="hb-footer">
        <div className="row text-center">
          <div className="col-12 border-second border-right hb-active-btn"
               onClick={this.strategy}>
            红包攻略
          </div>
          <div className="col-12 hb-active-btn"
               onClick={this.reSponsor}>
            我要发红包
          </div>
        </div>
      </footer>
    ) : (
      <div className="hb-footer text-center hb-active-btn"
           onTouchTap={this.reSponsor}>
        <span>{type === 'receive' ? '我要发红包' : (sponsorGoal === 'new' ? '我要发红包' : '继续发送')}</span>
      </div>
    );
  }

  render() {
    const {
      hongbaoInfo, identifier, indexActions,
      hongbaoDetailAction, participantPagination, setModalCloseCallback, type
    } = this.props;
    const {lastPage} = participantPagination;

    /**
     skuId  String  商品SKU
     skuName  String  商品名称
     skuIcon  String  商品主图
     createdDate  Long  红包创建时间
     ownerHeadpic  String  红包发起者头像
     ownerNickname  String  红包发起者昵称
     title  String  红包标题
     giftAmount  Long  本人领取的红包金额
     goodsNum  Long  红包实物个数
     giftNum  Long  红包礼品总个数
     giftGainedNum  Long  红包礼品已领取个数
     status  String  红包状态
     */
    let {
      skuId, skuName, skuIcon, createdDate, finishedDate, ownerHeadpic, ownerNickname,
      title, goodsNum, giftNum, giftGainedNum, status, selfInfo, redbagSelf, refundStatus
    } = hongbaoInfo;

    ownerHeadpic = ownerHeadpic || defaultHeadPic;
    ownerNickname = ownerNickname || NICKNAME;

    title = title || HONGBAO_TITLE;

    if (!skuId) {
      return (
        <Loading/>
      );
    }

    const {giftRecordId, confirmAddress} = selfInfo || {};
    const {detail, sponsorGoal, showInitiate, hongbaoExpired} = this.state;

    const selfInfoProps = {
      selfInfo, giftRecordId, skuId, redbagSelf, refundStatus,
      identifier, indexActions, setModalCloseCallback, type,
      updateSponsorGoal: this.updateSponsorGoal,
      giftGainedNum
    };

    const gainedListProps = {
      hongbaoDetailAction, identifier, skuId, participantPagination, type,
      isUnpack: this.isUnPack
    };

    let initiateCom = null;
    if (sponsorGoal === 'again' && showInitiate) {
      const initiateProps = {
        skuName, title, identifier,
        status: 'true', skuIcon,
        closeHongbao: this.closeHongbao,
        hongbaoExpired,
        indexActions
      };
      initiateCom = (
        <Initiate {...initiateProps}/>
      );
    }

    return (
      <div>
        {initiateCom}
        <PullRefresh className="hb-main-panel-noheader"
                     refreshCallback={this.refreshCallback}
                     loadMoreCallback={this.loadMoreCallback}
                     hasMore={!lastPage}>
          <article style={{display: detail}}>
            <section className="pos-r m-t-3">
              <div className="text-center">
                <div>
                  <img className="img-circle img-thumbnail hb-figure hb-user-info"
                       src={ownerHeadpic} alt=""/>
                </div>
                <div className="m-t-1">{ownerNickname}的红包</div>
                <p className="text-muted m-t-0-5-0 f-sm">{title}</p>
                <HongbaoSelfInfo {...selfInfoProps}/>
              </div>
              <div className="hb-help">
                <a onClick={this.clearMenu}
                   href="http://m.wangyin.com/basic/findInfoByKeywordsH5?searchKey=%E4%BA%AC%E4%B8%9C%E7%BA%A2%E5%8C%85">
                  {/*<i className="hb-help-icon-lg"></i>*/}
                  帮助反馈
                </a>
              </div>
            </section>

            <section className="m-t-3">
              <div className="m-x-1 m-b-0-3 f-sm">
                {this.renderProgress({goodsNum, giftNum, giftGainedNum, status, createdDate, finishedDate})}
              </div>
              {this.isAuthorize ? (<HongbaoGainedList {...gainedListProps}/>) : null}
            </section>
            <p className="text-center hb-logo-gray-pos" style={{paddingBottom: '3.5rem'}}>
              <i className="hb-logo-gray"></i>
            </p>
          </article>
        </PullRefresh>
        {this.renderFooter()}
        <HelpFeedback showFollowMe={true}/>
        {type !== 'sponsor' && confirmAddress === 'UNCONFIRMED' ? (<Ribbons/>) : null}
      </div>
    );
  }
}

HongbaoDetail.contextTypes = {
  router: PropTypes.object.isRequired
};

HongbaoDetail.propTypes = {
  identifier: PropTypes.string,
  hongbaoInfo: PropTypes.object,
  participantPagination: PropTypes.object,
  hongbaoDetailAction: PropTypes.object,
  indexActions: PropTypes.object,
  setModalCloseCallback: PropTypes.func,
  type: PropTypes.string
};

export default HongbaoDetail;
