import React, {Component, PropTypes} from 'react';
import walletApi from 'jd-wallet-sdk';
import deviceEnv from 'jd-wallet-sdk/lib/utils/device-env';
import perfect from '../../utils/perfect';
import defaultHeadPic from '../../../images/headpic.png';
import {NICKNAME} from '../../constants/common';
import PullRefresh from 'reactjs-pull-refresh';
// import QrCode from './QrCode';
import {setSessionStorage, getSessionStorage} from '../../utils/sessionStorage';

class SponsorHongbao extends Component {
  constructor(props, context) {
    super(props, context);

    this.refreshCallback = this.refreshCallback.bind(this);
    this.loadMoreCallback = this.loadMoreCallback.bind(this);
    this.clearMenu = this.clearMenu.bind(this);

    //设置图片目录
    this.rootUrl = perfect.getLocationRoot() +'images/';
  }

  componentDidMount() {
    const {caches, cacheActions} = this.props;
    if (!caches.sponsorPagination) {
      cacheActions.addCache('sponsorPagination');
      this.loadData();
    }

    const {hongbaoSponsorList} = this.refs;
    const hongbaoSponsorListScroll = getSessionStorage('hongbaoSponsorListScroll');
    if (hongbaoSponsorList && hongbaoSponsorListScroll) {
      const scrollCom = hongbaoSponsorList.pullRefresh.scroll;
      scrollCom.scrollTo(parseInt(hongbaoSponsorListScroll, 10), 2, 'linear');
    }
  }

  componentWillUnmount() {
    const {hongbaoSponsorList} = this.refs;
    const scrollCom = hongbaoSponsorList.pullRefresh.scroll;
    const top = scrollCom.y;

    setSessionStorage('hongbaoSponsorListScroll', top);
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

    return hongbaoActions.getHongbaoList(body, 'sponsor', clear);
  }

  //在钱包中去掉帮助页面分享
  clearMenu() {
    if (deviceEnv.inJdWallet) {
      walletApi.setMenu();
    }
  }

  /*eslint-disable indent*/
  /**
   * 红包状态字段：status
   REFUNDED    已退款
   REDBAGGOODTRANSFERANDREFOUND 已过期，可退款
   RECEIVE_COMPLETE 已抢光
   EXPIRED 已过期
   FORBIDDEN_REFUND 禁止退款

   礼品状态 :GiftStatus
   NOT_GAIN    未领取
   GAINED    已领取
   GIVEING    发放中
   GIVE_FAIL    发放失败
   GIVE_OUT    已发放
   REFUNED    已退款
   EXPIRED    已过期
   * @param status
   * @param giftStatus
   * @param giftGainedNum
   * @param giftNum
   * @param goodNum
   * @returns {*}
   */
  getStatus({status, giftGainedNum, giftNum}) {
    switch (status) {
      case 'PAY_SUCC':
        return (
          <div>
            {giftGainedNum}/{giftNum}个
          </div>
        );
      case 'RECEIVE_COMPLETE':
        return (
          <div>
            已抢光 {giftGainedNum}/{giftNum}个
          </div>
        );
      case 'EXPIRED':
      case 'REFUNDING':
      case 'REFUNDED':
        return (
          <div>
            <span>已过期，红包已退款</span>
          </div>
        );
      default:
        return null;
    }
  }

  hongbaoDetail(e, link) {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.preventDefault();
    e.nativeEvent.stopPropagation();
    this.context.router.push(link);
  }

  //获取实物奖品领取状态
  getGiftStatusFlag(status) {
    switch (status) {
      case 'NOT_GAIN': //未领取
        return 1;
      case 'GAINED': //已领取
        return 2;
      case 'EXPIRED': //已过期
        return 3;
      case 'WAIT_CONFIRM': //待领取
        return 4;
      case 'REFUNED': //已退款
        return 5;
      case 'GIVEING': //领取中
      default:
        return;
    }
  }

  //渲染列表
  renderList() {
    const {
      sponsorPagination, type
    } = this.props;

    let {list} = sponsorPagination;

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

    return (
      <ul className="hb-list">
        {list.map((item) => {
          const {identifier, giftRecordId, skuIcon, createdDate, amount, status, goodsStatus, giftGainedNum, giftNum, goodNum} = item;
          let link = `/hongbao/detail/view/${identifier}?type=${type}`;
          const giftStatusFlag = this.getGiftStatusFlag(goodsStatus);

          return (
            <li key={identifier + giftRecordId}
                className="hb-link-block row flex-items-middle"
                onTouchTap={(e) => this.hongbaoDetail(e, link)}>
              <div className="col-4 p-a-0">
                <img className="img-fluid" src={skuIcon} alt=""/>
                {giftStatusFlag ? (<img className="hb-gift-status" src={this.rootUrl + "gift-status-" + giftStatusFlag + ".png"}/>) : null}
              </div>
              <div className="col-10">
                <div className="text-truncate">京东红包</div>
                <div className="text-muted f-sm">{perfect.formatDate({time: createdDate})}</div>
              </div>
              <div className="col-10 text-right p-l-0">
                <div>{(amount / 100).toFixed(2)}元</div>
                <div className="text-muted f-sm">
                  {this.getStatus({status, giftGainedNum, giftNum})}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    );
  }

  render() {
    const {userInfo, type, sponsorPagination} = this.props;
    const {giftAndThirdAccUserInfoDto, redbagAssemblyRetDto} = userInfo;
    let {putOutNum, putOutAmount} = (redbagAssemblyRetDto || {});
    if (putOutAmount === undefined) {
      putOutAmount = 0;
    }
    const {lastPage} = sponsorPagination;

    let headpic = '';
    let nickName = '';
    if (giftAndThirdAccUserInfoDto) {
      headpic = giftAndThirdAccUserInfoDto.headpic || defaultHeadPic;
      nickName = giftAndThirdAccUserInfoDto.nickName || NICKNAME;
    }

    return (
      <PullRefresh ref="hongbaoSponsorList"
                   className="hb-main-panel"
                   refreshCallback={this.refreshCallback}
                   loadMoreCallback={this.loadMoreCallback}
                   hasMore={!lastPage}>
        {/*{deviceEnv.inWx ? <QrCode type={type}/> : null}*/}
        <section className="text-center m-t-1 pos-r">
          <div>
            <img className="img-circle img-thumbnail hb-figure hb-user-info" src={headpic} alt=""/>
          </div>
          <h3 className="m-t-1 m-b-0">{nickName}共发出</h3>
          <div className="hb-money line-height-1">{(putOutAmount / 100).toFixed(2)}</div>

          <div className="h4 text-muted m-t-2">
            已发出<span className="text-primary">{putOutNum}</span>个红包
          </div>
          <div className="hb-help">
            <a onClick={this.clearMenu} href="http://m.wangyin.com/basic/findInfoByKeywordsH5?searchKey=%E4%BA%AC%E4%B8%9C%E7%BA%A2%E5%8C%85">
              {/*<i className="hb-help-icon-lg"></i>*/}
              帮助反馈
            </a>
          </div>
        </section>
        <section className="m-t-1">
          {this.renderList()}
        </section>
      </PullRefresh>
    );
  }
}

SponsorHongbao.contextTypes = {
  router: PropTypes.object.isRequired
};

SponsorHongbao.propTypes = {
  hongbaoActions: PropTypes.object,
  sponsorPagination: PropTypes.object,
  userInfo: PropTypes.object,
  caches: PropTypes.object,
  cacheActions: PropTypes.object,
  type: PropTypes.string,
  loadUserInfo: PropTypes.func
};

export default SponsorHongbao;
