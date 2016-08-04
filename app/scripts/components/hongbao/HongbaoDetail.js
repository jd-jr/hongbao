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
import Guide from '../Guide';
import defaultHeadPic from '../../../images/headpic.png';
import {NICKNAME} from '../../constants/common';
import {getSessionStorage} from '../../utils/sessionStorage';
import {setLocalStorage, getLocalStorage} from '../../utils/localStorage';

// 红包详情
class HongbaoDetail extends Component {
  constructor(props, context) {
    super(props, context);
    const href = location.href;
    const unpacked = getSessionStorage('unpacked');
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
      unpack: isUnPack && unpacked !== 'true', //如果是从拆红包入口进入，则显示拆红包弹框
      // 如果是从拆红包入口进入，初始隐藏，等弹出抢红包窗口，再显示。这里没有用 state unpack，
      // 主要 unpack 和 detail 两个状态处理的场景不一致
      detail: isUnPack ? 'none' : 'block',
      sponsorGoal: 'new', // 判断底部显示状态，是重新发起，还是继续发送
      showInitiate: false, // 继续发送状态
      hongbaoExpired: false, //红包是否过期
      guide: false
    };

    this.showDetail = this.showDetail.bind(this);
    this.reSponsor = this.reSponsor.bind(this);
    this.closeHongbao = this.closeHongbao.bind(this);
    this.strategy = this.strategy.bind(this);
    this.updateSponsorGoal = this.updateSponsorGoal.bind(this);

    this.refreshCallback = this.refreshCallback.bind(this);
    this.loadMoreCallback = this.loadMoreCallback.bind(this);
    this.closeGuide = this.closeGuide.bind(this);
    this.imgUrl = 'detail.png';

    //可继续发送状态
    this.againSend = ['REDBAG_GOODS_TRANSFER_AND_REFOUND', 'REDBAG_GOODS_TRANSFER', 'REDBAG_WHOLE_REFUND_TRANSFER'];
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
    const unpacked = getSessionStorage('unpacked');
    if (unpacked === 'true') {//如果已经拆过，则直接打开
      this.showDetail(true);
    }
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
        unpack: false,
        guide: getLocalStorage('guide-detail') !== 'true'
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

  //关闭引导
  closeGuide() {
    this.setState({
      guide: false
    });
    setLocalStorage('guide-detail', 'true');
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

    const {giftRecordId} = selfInfo || {};
    const showDetail = this.showDetail;
    const unpackProps = {
      identifier, indexActions, showDetail, hongbaoDetailAction
    };
    const {unpack, detail, sponsorGoal, showInitiate, hongbaoExpired, guide} = this.state;

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
        {guide ? <Guide closeGuide={this.closeGuide} imgUrl={this.imgUrl}/> : null}
        {initiateCom}
        {unpack ? <Unpack {...unpackProps}/> : null}
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
                <a href="http://m.wangyin.com/basic/findInfoByKeywordsH5?searchKey=%E4%BA%AC%E4%B8%9C%E7%BA%A2%E5%8C%85">
                  <i className="hb-help-icon-lg"></i>
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
