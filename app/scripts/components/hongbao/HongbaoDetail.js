import React, {Component, PropTypes} from 'react';
import deviceEnv from 'jd-wallet-sdk/lib/utils/device-env';
import PullRefresh from 'reactjs-pull-refresh';
import Loading from '../../ui/Loading';
import perfect from '../../utils/perfect';
import Unpack from './Unpack';
import {HONGBAO_TITLE} from '../../constants/common';
import HongbaoSelfInfo from './HongbaoSelfInfo';
import HongbaoGainedList from './HongbaoGainedList';
import Initiate from '../home/Initiate';
import defaultHeadPic from '../../../images/headpic.png';
import {NICKNAME} from '../../constants/common';
import {scrollEvent, unmountScrollEvent} from '../../utils/scrollHideFixedElement';

// 红包详情
class HongbaoDetail extends Component {
  constructor(props, context) {
    super(props, context);
    const href = location.href;
    //是否从拆红包入口进入
    const isUnPack = href.indexOf('/unpack') !== -1;
    this.isUnPack = isUnPack; // 从拆红包入口进入
    const thirdAccId = perfect.getThirdAccId();
    let isAuthorize = true;
    if (deviceEnv.inWx) {
      isAuthorize = Boolean(thirdAccId);
    }
    this.isAuthorize = isAuthorize; // 在微信中是否授权
    this.state = {
      showFoot: false,
      unpack: isUnPack, //如果是从拆红包入口进入，则显示拆红包弹框
      // 如果是从拆红包入口进入，初始隐藏，等弹出抢红包窗口，再显示。这里没有用 state unpack，
      // 主要 unpack 和 detail 两个状态处理的场景不一致
      detail: isUnPack ? 'none' : 'block',
      sponsorGoal: 'new', // 判断底部显示状态，是重新发起，还是继续发送
      showInitiate: false, // 继续发送状态
      hongbaoExpired: false, //红包是否过期
      disabled: document.body.scrollTop !== 0
    };

    this.showDetail = this.showDetail.bind(this);
    this.reSponsor = this.reSponsor.bind(this);
    this.closeHongbao = this.closeHongbao.bind(this);
    this.guide = this.guide.bind(this);
    this.updateSponsorGoal = this.updateSponsorGoal.bind(this);

    this.loadingFunction = this.loadingFunction.bind(this);
    this.onPanStart = this.onPanStart.bind(this);
    this.onPanEnd = this.onPanEnd.bind(this);
    this.onScroll = this.onScroll.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
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
    }, 350);

    this.loadData();
  }

  componentDidMount() {
    //添加下拉刷新相关事件
    window.addEventListener('touchstart', this.onTouchStart, false);
    window.addEventListener('scroll', this.onScroll, false);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const {hongbaoInfo} = nextProps;
    if (hongbaoInfo.skuId) {
      return true;
    }
    return false;
  }

  componentDidUpdate() {
    if (this.state.showFoot) {
      scrollEvent({
        hideElement: this.refs.footer
      });
    }
  }

  componentWillUnmount() {
    const {hongbaoDetailAction} = this.props;
    hongbaoDetailAction.clearHongbaoDetail();
    hongbaoDetailAction.clearParticipant();
    unmountScrollEvent();
    window.removeEventListener('touchstart', this.onTouchStart, false);
    window.removeEventListener('scroll', this.onScroll, false);
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
         REDBAG_PUT_OUT 我要发红包
         REDBAG_GOODS_REFOUND 申请退款、我要发送红包
         FORBIDDEN_REFUND 禁止退款 我要发红包
         */
        const againSend = ['REDBAG_GOODS_TRANSFER_AND_REFOUND', 'REDBAG_GOODS_TRANSFER'];
        const {hongbaoInfo} = res || {};
        const {refundStatus, status} = hongbaoInfo || {};
        //如果红包已过期，而且是发起者进入，则显示继续发送
        if (type && type === 'sponsor' && againSend.indexOf(refundStatus) !== -1) {
          this.setState({
            sponsorGoal: 'again'
          });
        }

        if (status === 'EXPIRED') {
          this.setState({
            hongbaoExpired: true
          });
        }
      });
  }

  //滚动监听，当 scrollTop 等于 0 时，激活下拉刷新
  onScroll(e) {
    const scrollTop = document.body.scrollTop;
    this.setState({
      disabled: scrollTop !== 0
    });
  }

  onTouchStart(e) {
    if (this.preventDefault && !this.state.disabled) {
      e.preventDefault();
    }
  }

  // 下拉刷新回调函数
  loadingFunction() {
    this.setState({
      listLoading: false
    });

    this.loadData();

    // 加载红包列表
    const {hongbaoDetailAction, identifier} = this.props;
    const accountType = perfect.getAccountType();
    const thirdAccId = perfect.getThirdAccId();
    if (deviceEnv.inWx && !thirdAccId) {
      return;
    }
    hongbaoDetailAction.clearParticipant();
    const body = {
      identifier,
      accountType,
      thirdAccId
    };
    return hongbaoDetailAction.getParticipantList(body);
  }

  // 下拉滑动开始事件
  onPanStart() {
    const {disabled} = this.state;
    if (!disabled) {
      this.preventDefault = true;
    }
  }

  // 下拉滑动结束事件
  onPanEnd() {
    this.preventDefault = false;
  }

  /**
   * 显示红包详情
   * @param first 设为 true，表示红包弹框加载完，显示
   * 不传入值或设为 false 表示直接关闭抢红包弹框
   */
  showDetail(first) {
    if (first) {
      this.setState({
        detail: true
      });
    } else {
      this.setState({
        unpack: false
      });
    }
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
  guide() {
    const {type} = this.props;
    //埋点
    perfect.setBuriedPoint(`hongbao${type && type === 'sponsor' ? '_my' : ''}_guide`);
    // TODO
    this.context.router.push('/guide');
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
            已领取{giftGainedNum}/{giftNum}，共{goodsNum}个奖品{momeyText}。
          </div>
        );
      case 'RECEIVE_COMPLETE':
        return (
          <div className="text-muted">共{goodsNum}个奖品{momeyText}。
            {perfect.formatMillisecond(finishedDate - createdDate)}抢光
          </div>
        );
      case 'EXPIRED':
        return (
          <div className="text-muted">共{goodsNum}个奖品{momeyText}。该红包已过期</div>
        );
      case 'REFUNDED': //已退款
        return (
          <div className="text-muted">共{goodsNum}个奖品{momeyText}。该红包已退款</div>
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
      <footer className="hb-footer" ref="footer">
        <div className="row text-center">
          <div className="col-12 border-second border-right hb-active-btn"
               onClick={this.guide}>
            红包攻略
          </div>
          <div className="col-12 hb-active-btn"
               onClick={this.reSponsor}>
            我要发红包
          </div>
        </div>
      </footer>
    ) : (
      <div className="hb-footer text-center"
           onTouchTap={this.reSponsor}>
        <span
          className="hb-active-btn">{type === 'receive' ? '我要发红包' : (sponsorGoal === 'new' ? '我要发红包' : '继续发送')}</span>
      </div>
    );
  }

  render() {
    const {
      hongbaoInfo, identifier, indexActions,
      hongbaoDetailAction, participantPagination, setModalCloseCallback, type
    } = this.props;

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

    const {giftRecordId} = selfInfo || {};
    const showDetail = this.showDetail;
    const unpackProps = {
      identifier, indexActions, showDetail, hongbaoDetailAction
    };
    const {unpack, detail, sponsorGoal, showInitiate, hongbaoExpired, disabled} = this.state;

    const selfInfoProps = {
      selfInfo, giftRecordId, skuId, redbagSelf, refundStatus,
      identifier, indexActions, setModalCloseCallback, type,
      updateSponsorGoal: this.updateSponsorGoal
    };

    const gainedListProps = {
      hongbaoDetailAction, identifier, skuId, participantPagination, type,
      isUnpack: this.isUnPack
    };

    let initiateCom = null;
    if (sponsorGoal === 'again' && showInitiate) {
      const initiateProps = {
        skuName, title, identifier,
        status: 'true', skuIcon, closable: true,
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
        {unpack ? <Unpack {...unpackProps}/> : null}
        <PullRefresh loadingFunction={this.loadingFunction}
                     distanceToRefresh={0}
                     lockInTime={30}
                     hammerOptions={{touchAction: 'auto'}}
                     onPanStart={this.onPanStart}
                     onPanEnd={this.onPanEnd}
                     disabled={disabled}>

          <article className="hb-wrap-mb" style={{display: detail}}>
            <section>
              <div className="text-center m-t-3">
                <div>
                  <img className="img-circle img-thumbnail hb-figure"
                       src={ownerHeadpic} alt=""/>
                </div>
                <h3 className="m-t-2">{ownerNickname}的红包</h3>
                <p className="text-muted f-lg">{title}</p>
                <HongbaoSelfInfo {...selfInfoProps}/>
              </div>
            </section>

            <section className="m-t-3">
              <div className="m-x-1 m-b-0-3">
                {this.renderProgress({goodsNum, giftNum, giftGainedNum, status, createdDate, finishedDate})}
              </div>
              {this.isAuthorize ? (<HongbaoGainedList {...gainedListProps}/>) : null}
            </section>
            {this.renderFooter()}
          </article>
          <p className="text-center hb-logo-gray-pos">
            <i className="hb-logo-gray"></i>
          </p>
        </PullRefresh>
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
