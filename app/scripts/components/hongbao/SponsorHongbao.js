import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import classnames from 'classnames';
import ScrollLoad from '../../ui/ScrollLoad';
import perfect from '../../utils/perfect';
import defaultHeadPic from '../../../images/headpic.png';
import {NICKNAME} from '../../constants/common';

class SponsorHongbao extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      type: 'received' // received 已收红包， luck 手气最佳
    };
    this.switchTab = this.switchTab.bind(this);
    this.loadMore = this.loadMore.bind(this);
  }

  componentDidMount() {
    const {caches, cacheActions} = this.props;
    if (!caches.sponsorPagination) {
      cacheActions.addCache('sponsorPagination');
      this.loadMore();
    }
  }

  //切换已收红包和手气最佳
  switchTab(e, type) {
    this.setState({
      type
    });
  }

  /*eslint-disable indent*/
  /**
   * 红包状态字段：status
   INIT("初始化"),
   WAIT_PAY("等待付款"),
   PAY_SUCC("支付成功"),
   RECEIVE_COMPLETE("领取完成"),
   EXPIRED("已过期"),
   REFUNDED("已退款"),
   FORBIDDEN_REFUND("禁止退款"),
   REDBAGWHOLEREFUND("红包可全额退款"),
   REDBAGGOODSREFOUND("红包实物可退款"),
   REDBAGGOODTRANSFER("红包实物可转发")

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
  getStatus({status, giftStatus, giftGainedNum, giftNum, goodNum}) {
    switch (status) {
      case 'RECEIVE_COMPLETE':
        return (
          <div>
            已抢光 {giftGainedNum}/{giftNum}个
          </div>
        );
      case 'OK':
      case 'PAY_SUCC':
        return (
          <div>
            {giftGainedNum}/{giftNum}个
          </div>
        );
      case 'EXPIRED':
        return (
          <div>
            <span>已过期 </span> <span className="text-primary">可退款</span>
          </div>
        );
      case 'REFUNDED':
        return (
          <div>
            已退款
          </div>
        );
      default:
        return null;
    }
  }

  loadMore() {
    const {hongbaoActions} = this.props;
    const accountType = perfect.getAccountType();
    const thirdAccId = perfect.getThirdAccId();
    const body = {
      accountType,
      accountId: thirdAccId
    };

    hongbaoActions.getHongbaoList(body, 'sponsor');
  }

  //渲染列表
  renderList() {
    const {
      sponsorPagination, type
    } = this.props;

    let {list, isFetching, lastPage} = sponsorPagination;

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
      <ScrollLoad loadMore={this.loadMore}
                  hasMore={!lastPage}
                  isLoading={isFetching}
                  className={classnames({loading: isFetching})}
                  loader={<div className=""></div>}>
        <ul className="hb-list">
          {list.map((item) => {
            const {identifier, giftRecordId, skuIcon, createdDate, amount, status, giftStatus, giftGainedNum, giftNum, goodNum} = item;
            let link = `/hongbao/detail/view/${identifier}?type=${type}`;

            return (
              <li key={identifier + giftRecordId}>
                <Link to={link} className="hb-link-block row flex-items-middle">
                  <div className="col-4">
                    <img className="img-fluid" src={skuIcon} alt=""/>
                  </div>
                  <div className="col-12">
                    <div className="text-truncate">京东红包</div>
                    <div className="text-muted f-sm">{perfect.formatDate(createdDate)}</div>
                  </div>
                  <div className="col-8 text-right">
                    <div>{(amount / 100).toFixed(2)}元</div>
                    <div className="text-muted f-sm">
                      {this.getStatus({status, giftStatus, giftGainedNum, giftNum, goodNum})}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </ScrollLoad>
    );
  }

  render() {
    const {userInfo} = this.props;
    const {giftAndThirdAccUserInfoDto, redbagAssemblyRetDto} = userInfo;
    let {nickName, headpic} = (giftAndThirdAccUserInfoDto || {});
    let {putOutNum, putOutAmount} = (redbagAssemblyRetDto || {});
    if (putOutAmount === undefined) {
      putOutAmount = 0;
    }

    headpic = headpic || defaultHeadPic;
    nickName = nickName || NICKNAME;

    return (
      <div>
        <section className="text-center m-t-2">
          <div>
            <img className="img-circle img-thumbnail hb-figure" src={headpic} alt=""/>
          </div>
          <h3 className="m-t-1">{nickName}共发出</h3>
          <div className="h1">{(putOutAmount / 100).toFixed(2)}</div>

          <div className="h3 text-muted">
            已发出<span className="text-primary">{putOutNum}</span>个红包
          </div>
        </section>

        <section className="m-t-1">
          {this.renderList()}
        </section>
      </div>
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
  type: PropTypes.string
};

export default SponsorHongbao;
