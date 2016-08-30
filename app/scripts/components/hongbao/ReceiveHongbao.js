import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import offset from 'perfect-dom/lib/offset';
import walletApi from 'jd-wallet-sdk';
import deviceEnv from 'jd-wallet-sdk/lib/utils/device-env';
import perfect from '../../utils/perfect';
import defaultHeadPic from '../../../images/headpic.png';
import {NICKNAME} from '../../constants/common';
import PullRefresh from 'reactjs-pull-refresh';
// import QrCode from './QrCode';
import callApi from '../../fetch';
import Guide from '../Guide';
import {setLocalStorage, getLocalStorage} from '../../utils/localStorage';
import {setSessionStorage, getSessionStorage} from '../../utils/sessionStorage';

class ReceiveHongbao extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      type: props.receiveType, //'received', // received 已收红包， luck 手气最佳
      guide: getLocalStorage('guide-my-receive') !== 'true'
    };
    this.switchTab = this.switchTab.bind(this);
    this.withdraw = this.withdraw.bind(this);
    this.reward = this.reward.bind(this);

    this.refreshCallback = this.refreshCallback.bind(this);
    this.loadMoreCallback = this.loadMoreCallback.bind(this);
    this.closeGuide = this.closeGuide.bind(this);
    this.clearMenu = this.clearMenu.bind(this);
  }

  componentDidMount() {
    this.adjustArrow();
    const {caches, cacheActions} = this.props;
    if (!caches.receivePagination) {
      cacheActions.addCache('receivePagination');
      this.loadMoreCallback();
    }

    const {hongbaoReceiveList} = this.refs;
    const hongbaoReceiveListScroll = getSessionStorage('hongbaoReceiveListScroll');
    if (hongbaoReceiveList && hongbaoReceiveListScroll) {
      const scrollCom = hongbaoReceiveList.pullRefresh.scroll;
      scrollCom.scrollTo(parseInt(hongbaoReceiveListScroll, 10), 2, 'linear');
    }
  }

  componentDidUpdate(nextProps, nextState) {
    this.adjustArrow();
  }

  componentWillUnmount() {
    if (this.drawForm) {
      document.body.removeChild(this.drawForm);
    }
    const {hongbaoReceiveList} = this.refs;
    const scrollCom = hongbaoReceiveList.pullRefresh.scroll;
    const top = scrollCom.y;

    setSessionStorage('hongbaoReceiveListScroll', top);
  }

  // 下拉刷新回调函数
  refreshCallback() {
    this.props.loadUserInfo(true);
    return this.loadData(true);
  }

  //加载更多
  loadMoreCallback() {
    return this.loadData();
  }

  loadData(clear) {
    const {hongbaoActions} = this.props;
    const accountType = perfect.getAccountType();
    const thirdAccId = perfect.getThirdAccId();
    const body = {
      accountType,
      accountId: thirdAccId
    };

    if (this.state.type === 'luck') {
      body.lucky = 'LUCK';
    }
    return hongbaoActions.getHongbaoList(body, 'receive', clear);
  }

  //切换已收红包和手气最佳
  switchTab(e, type) {
    //防止切换的太快，导致数据渲染不正确
    if (this.switching) {
      return;
    }
    this.switching = true;

    let state = {type};
    const guide = getLocalStorage(type === 'luck' ? 'guide-my-receive-luck' : 'guide-my-receive');
    if (guide !== 'true') {
      state.guide = true;
    }

    this.setState(state, () => {
      const {hongbaoActions} = this.props;
      hongbaoActions.clearReceive();
      hongbaoActions.receiveType(type);
      this.adjustArrow();
      this.loadMoreCallback().then(() => {
        setTimeout(() => {
          this.switching = false;
        });
      });
    });
    //埋点
    perfect.setBuriedPoint(`hongbao_btn_${type}`);
  }

  // 提现
  withdraw(e) {
    //埋点
    perfect.setBuriedPoint('hongbao_withdraw');

    if (deviceEnv.inJdWallet) {
      e.stopPropagation();
      e.preventDefault();
      e.nativeEvent.preventDefault();
      e.nativeEvent.stopPropagation();
      walletApi.openModule({name: 'BALANCE'});
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
    document.body.appendChild(form);
    this.drawForm = form;
    form.submit();
  }

  //兑奖
  reward(e, {giftRecordId, skuId, identifier}) {
    //防止点透
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.preventDefault();
    e.nativeEvent.stopPropagation();

    setSessionStorage('skuId', skuId);
    setSessionStorage('giftRecordId', giftRecordId);
    setSessionStorage('identifier', identifier);
    this.context.router.push('/myaddress');
  }

  //调整已收红包和手气最佳箭头按钮
  adjustArrow() {
    const {type} = this.state;
    let tabEl;
    if (type === 'luck') {
      tabEl = this.refs.luckHb;
    } else {
      tabEl = this.refs.receivedHb;
    }

    const xy = offset(tabEl);
    const width = tabEl.clientWidth;
    if (this.refs.arrow) {
      this.refs.arrow.style.left = `${xy.left + width / 2 - 8}px`;
    }
  }

  //关闭引导
  closeGuide(e) {
    //防点透处理
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.preventDefault();
    e.nativeEvent.stopPropagation();

    this.setState({
      guide: false
    });
    setLocalStorage(this.state.type === 'luck' ? 'guide-my-receive-luck' : 'guide-my-receive', 'true');
  }

  //在钱包中去掉帮助页面分享
  clearMenu() {
    if (deviceEnv.inJdWallet) {
      walletApi.setMenu();
    }
  }

  /*eslint-disable indent*/
  /**
   * @param status
   // 初始化
   INIT("初始化"),
   // 等待支付
   WAIT_PAY("等待付款"),
   // 支付成功
   PAY_SUCC("支付成功"),
   // 领取完成
   RECEIVE_COMPLETE("领取完成"),
   // 过期
   EXPIRED("已过期"),
   //已退款
   REFUNDED("已退款"),
   //禁止退款
   FORBIDDEN_REFUND("禁止退款"),
   //红包全额退款
   REDBAGWHOLEREFUND("红包可全额退款"),
   //只有现金被领取实物可全退
   REDBAGGOODSREFOUND("红包实物可退款"),
   //红包实物可转发
   REDBAGGOODTRANSFER("红包实物可转发")
   * @param giftAmount
   * @param giftType
   * @param skuIcon
   * @returns {*}
   */
  getStatus({goodsStatus, giftAmount, giftType, skuIcon, identifier, giftRecordId, skuId}) {

    const goodsStatusFn = function () {
      switch (goodsStatus) {
        case 'GIVEING':
          return (
            <div className="label-text bg-info">领取中</div>
          );
        case 'GAINED':
          return (
            <div className="label-text bg-info">已领取</div>
          );
        case 'EXPIRED':
          return (
            <div className="label-text bg-muted">已过期</div>
          );
        case 'WAIT_CONFIRM':
          return (
            <div className="label-text bg-info">待领取</div>
          );
        default:
          return;
      }
    };

    const {type} = this.props;
    let link = `/hongbao/detail/view/${identifier}?type=${type}`;
    let contentEl;
    if (giftType === 'CASH') {
      contentEl = (
        <div>
          {(giftAmount / 100).toFixed(2)}元
        </div>
      );
    } else {
      contentEl = (
        <div className="hb-img-text-thumb">
          <img src={skuIcon} alt=""/>
          {
            goodsStatusFn()
          }
        </div>
      );
    }

    //去领取，只有待领取状态可以兑奖，并且是实物
    const isReward = giftType === 'GOODS' && goodsStatus === 'WAIT_CONFIRM';

    if (isReward) {
      return (
        <div className="col-6 text-right" onTouchTap={(e) => this.reward(e, {giftRecordId, skuId, identifier})}>
          {contentEl}
        </div>
      );
    }

    return (
      <div className="col-6 text-right">
        <Link to={link} className="hb-link-block">
          {contentEl}
        </Link>
      </div>
    );
  }

  renderItem(item) {
    const {type} = this.props;
    let {
      identifier, skuIcon, createdDate, giftAmount, goodsStatus, giftType,
      thirdAccountUserInfoDtoList, giftRecordId, skuId
    } = item;
    let nickName;
    if (thirdAccountUserInfoDtoList && thirdAccountUserInfoDtoList.length > 0) {
      nickName = thirdAccountUserInfoDtoList[0].nickName;
    }
    let link = `/hongbao/detail/view/${identifier}?type=${type}`;
    return (
      <li className={`row ${giftType === 'CASH' ? '' : 'flex-items-middle goods'}`} key={identifier + giftRecordId}>
        <div className="col-18">
          <Link to={link} className="hb-link-block">
            <div className="text-truncate">{nickName}</div>
            <div className="text-muted f-sm">{perfect.formatDate({time: createdDate})}</div>
          </Link>
        </div>
        {this.getStatus({goodsStatus, giftAmount, giftType, skuIcon, identifier, giftRecordId, skuId})}
      </li>
    );
  }

  //渲染列表
  renderList() {
    const {
      receivePagination
    } = this.props;

    let {list} = receivePagination;

    if (!list) {
      return (
        <div className="page-loading">载入中，请稍后 ...</div>
      );
    } else if (list.length === 0) {
      return (
        <div className="m-t-3 text-center text-muted">
          暂无记录
        </div>
      );
    }

    const {type} = this.state;
    return (
      <section className="m-t-1">
        <div className="arrow-hollow-top hb-arrows-active" ref="arrow"></div>
        <ul className="hb-list" key={type}>
          {
            list ? list.map((item) => {
              return this.renderItem(item);
            }) : null
          }
        </ul>
      </section>
    );
  }

  render() {
    const {type, guide} = this.state;
    const {userInfo, receivePagination} = this.props;
    const {giftAndThirdAccUserInfoDto, redbagAssemblyRetDto} = userInfo;
    const {lastPage} = receivePagination;

    let headpic = '';
    let nickName = '';
    if (giftAndThirdAccUserInfoDto) {
      headpic = giftAndThirdAccUserInfoDto.headpic || defaultHeadPic;
      nickName = giftAndThirdAccUserInfoDto.nickName || NICKNAME;
    }

    let {gainCashBalance, gainGoodNum, gainNum} = (redbagAssemblyRetDto || {});
    if (gainCashBalance === undefined) {
      gainCashBalance = 0;
    }

    let imgUrl;
    if (guide) {
      imgUrl = type === 'luck' ?
        (deviceEnv.inWx ? 'my-receive-luck-wx.png' : 'my-receive-luck.png') :
        (deviceEnv.inWx ? 'my-receive-wx.png' : 'my-receive.png');
    }

    return (
      <div>
        <PullRefresh ref="hongbaoReceiveList"
                     className="hb-main-panel"
                     refreshCallback={this.refreshCallback}
                     loadMoreCallback={this.loadMoreCallback}
                     hasMore={!lastPage}>
          {/*{deviceEnv.inWx ? <QrCode type={type}/> : null}*/}
          <section className="text-center m-t-1 pos-r">
            <div>
              <img className="img-circle img-thumbnail hb-figure hb-user-info" src={headpic} alt=""/>
            </div>
            <h3 className="m-t-1">{nickName}共收到</h3>
            <div className="hb-money line-height-1">{(gainCashBalance / 100).toFixed(2)}</div>

            <div className="m-t-1">
              {
                deviceEnv.inJdWallet ? (
                  <button onTouchTap={this.withdraw} className="btn btn-primary btn-sm hb-fillet-1 hb-btn-mid hb-receive-animate">立即提现</button>
                ) : (
                  <button onTouchTap={this.withdraw}
                          className="btn btn-primary btn-sm hb-fillet-1 hb-btn-mid hb-receive-animate">去京东钱包提现</button>
                )
              }
            </div>
            <div className="hb-help">
              <a onClick={this.clearMenu}
                 href="http://m.wangyin.com/basic/findInfoByKeywordsH5?searchKey=%E4%BA%AC%E4%B8%9C%E7%BA%A2%E5%8C%85">
                {/*<i className="hb-help-icon-lg"></i>*/}
                帮助反馈
              </a>
            </div>
          </section>

          <section className="row text-center m-t-1">
            <div className={`col-10 ${type === 'received' ? 'text-primary' : 'text-muted'}`}
                 onTouchTap={(e) => this.switchTab(e, 'received')}>
              <div>已收红包</div>
              <div className="h1-lg" ref="receivedHb">{gainNum}</div>
            </div>
            <div className={`col-10 offset-4 ${type === 'luck' ? 'text-primary' : 'text-muted'}`}
                 onTouchTap={(e) => this.switchTab(e, 'luck')}>
              <div>手气最佳</div>
              <div className="h1-lg" ref="luckHb">{gainGoodNum}</div>
            </div>
          </section>
          {this.renderList()}
        </PullRefresh>
        {guide ? <Guide closeGuide={this.closeGuide} imgUrl={imgUrl}/> : null}
      </div>
    );
  }
}

ReceiveHongbao.contextTypes = {
  router: PropTypes.object.isRequired
};

ReceiveHongbao.propTypes = {
  hongbaoActions: PropTypes.object,
  receivePagination: PropTypes.object,
  userInfo: PropTypes.object,
  caches: PropTypes.object,
  cacheActions: PropTypes.object,
  type: PropTypes.string,
  receiveType: PropTypes.string,
  loadUserInfo: PropTypes.func
};

export default ReceiveHongbao;
