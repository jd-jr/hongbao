import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import Loading from '../../ui/Loading';
import perfect from '../../utils/perfect';
import ScrollLoad from '../../ui/ScrollLoad';

class HongbaoDetail extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      showFoot: false
    };

    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.loadMore = this.loadMore.bind(this);
    this.refund = this.refund.bind(this);
    this.timeouter = null;
  }

  componentDidMount() {
    //加载红包详情
    const {hongbaoDetailAction, identifier, thirdAccId, accountType} = this.props;
    let body = {
      identifier,
      accountType: accountType || perfect.getAccountType(),
      thirdAccId
    };
    hongbaoDetailAction.getHongbaoDetail(body);

    body = {
      identifier
    };
    hongbaoDetailAction.getParticipantList(body);

    //滚动窗口显示底部 banner，停止隐藏
    window.addEventListener('touchstart', this.onTouchStart, false);
    window.addEventListener('touchmove', this.onTouchMove, false);
    window.addEventListener('touchend', this.onTouchEnd, false);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const {hongbaoInfo, participantPagination} = nextProps;
    const {list} = participantPagination;
    if (hongbaoInfo.skuId && list) {
      return true;
    }
    return false;
  }

  componentWillUnmount() {
    window.removeEventListener('touchstart', this.onTouchStart, false);
    window.removeEventListener('touchmove', this.onTouchMove, false);
    window.removeEventListener('touchend', this.onTouchEnd, false);
  }

  onTouchStart(e) {
    if (this.timeouter) {
      clearTimeout(this.timeouter);
    }
    const el = e.changedTouches[0];
    const pageY = el.pageY;
    this.pageY = pageY;
  }

  onTouchMove(e) {
    const el = e.changedTouches[0];
    const pageY = el.pageY;
    const offset = pageY - this.pageY;
    if (offset < -20) {//向下滑动
      this.setState({
        showFoot: true
      });
    }
  }

  onTouchEnd(e) {
    //4秒后隐藏
    this.timeouter = setTimeout(() => {
      this.setState({
        showFoot: false
      });
    }, 4000);
  }

  loadMore() {
    //加载红包详情
    const {hongbaoDetailAction, identifier} = this.props;
    const body = {
      identifier
    };
    hongbaoDetailAction.getParticipantList(body);
  }

  refund() {
    const url = '';
    const body = {};

    callApi({url, body}).then(
      ({json, response}) => {

      }
    );
  }

  //渲染获取者列表
  renderGainedList() {
    const {participantPagination} = this.props;
    const {list, isFetching, lastPage} = participantPagination;

    if (list && list.length > 0) {
      return (
        <ScrollLoad loadMore={this.loadMore}
                    hasMore={!lastPage}
                    isLoading={isFetching}
                    loader={<div className=""></div>}>
          <ul className="hb-list">
            {list.map((item) => {
              let {giftRecordId, nickName, headpic, giftAmount, giftGainedDate, giftType} = item;
              giftAmount = (giftAmount / 100).toFixed(2);

              return (
                <li key={giftRecordId} className="row flex-items-middle">
                  <div className="col-4">
                    <img className="img-fluid img-circle" src={headpic} alt=""/>
                  </div>
                  <div className="col-13">
                    <div className="text-truncate">{nickName}</div>
                    <div className="text-muted f-sm">{perfect.formatDate(giftGainedDate)}</div>
                  </div>

                  {
                    giftType === 'CASH' ? (
                      <div className="col-7 text-right">
                        {giftAmount}元
                      </div>
                    ) : (
                      <div className="col-7 text-right">
                        <div>中奖啦</div>
                        <div className="text-warning"><i className="icon icon-champion"></i> 手气最佳</div>
                      </div>
                    )
                  }
                </li>
              );
            })}
          </ul>
        </ScrollLoad>
      );
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
          <div className="m-l-1 text-muted">
            已领取{giftGainedNum}/{giftNum}，共{goodsNum}个奖品{momeyText}。
          </div>
        );
      case 'RECEIVE_COMPLETE':
        return (
          <div className="m-l-1 text-muted">共{goodsNum}个奖品{momeyText}。
            {perfect.formatMillisecond(finishedDate - createdDate)}抢光
          </div>
        );
      case 'EXPIRED':
        return (
          <div className="m-l-1 text-muted">共{goodsNum}个奖品{momeyText}。该红包已过期</div>
        );
      default:
        return null;
    }
  }

  /**
   * 发起者和领取者
   * @param selfInfo
   * @param status
   * @param giftRecordId
   * @param skuId
   * @param redbagSelf 红包是否为该用户发起(是：true；否：false)
   * @param refundStatus 红包退款状态 (红包非该用户发起时，该字段为null；红包为该用户发起时，
   * 该字段定义如下； ALLOW_REFUND：允许退款 FORBIDDEN_REFUND：禁止退款)
   * @returns {XML}
   */
  renderSelfInfo({selfInfo, status, giftRecordId, skuId, redbagSelf, refundStatus}) {
    //发起者
    if (redbagSelf) {
      return (
        <div>
          <button onTouchTap={this.refund} className="btn btn-primary btn-outline-primary btn-sm btn-arc">申请退款</button>
        </div>
      );
    }

    //如果为空，表示还没有领取
    if (!selfInfo) {
      return null;
    }

    // 接收者
    const {giftType, giftAmount} = selfInfo;
    /*eslint-disable no-else-return*/
    if (giftType === 'CASH') { //现金
      return (
        <div>
          <div className="text-center text-primary">
            <span className="hb-money">{(giftAmount / 100).toFixed(2)}</span> <span>元</span>
          </div>
          <div>
            <Link to="/my" className="btn btn-primary btn-sm hb-fillet-1">去京东钱包提现</Link>
          </div>
        </div>
      );
    } else { // 实物
      if (status === 'EXPIRED') {
        return (
          <div>
            <div className="text-center text-muted">
              <span className="hb-money">中奖啦</span>
            </div>
          </div>
        );
      } else {
        return (
          <div>
            <div className="text-center">
              <span className="hb-money text-primary">中奖啦</span>
            </div>
            <div>
              <Link to={`/myaddress/${skuId}/${giftRecordId}`} className="btn btn-primary btn-sm btn-arc">立即领奖</Link>
            </div>
          </div>
        );
      }
    }

  }

  render() {
    const {hongbaoInfo} = this.props;

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

    title = title || '我发起了个实物和现金红包，快来抢啊！';

    if (!skuId) {
      return (
        <Loading/>
      );
    }

    const {giftRecordId} = selfInfo || {};

    return (
      <article>
        <section>
          <div className="hb-single m-t-1 m-b-1">
            <Link className="hb-link-block row flex-items-middle" to={`/product/detail/view/${skuId}`}>
              <div className="col-4">
                <img className="img-fluid" src={skuIcon} alt=""/>
              </div>
              <div className="col-16">
                <div className="text-truncate">{skuName}</div>
                <div className="text-muted f-sm">发起时间：{perfect.formatDate(createdDate)}</div>
              </div>
            </Link>
          </div>

          <div className="text-center m-t-3">
            <div>
              <img className="img-circle img-thumbnail hb-figure"
                   src={ownerHeadpic} alt=""/>
            </div>
            <h3 className="m-t-2">{ownerNickname}的红包</h3>
            <p className="text-muted">{title}</p>
            {
              this.renderSelfInfo({selfInfo, status, giftRecordId, skuId, redbagSelf, refundStatus})
            }
          </div>
        </section>

        <section className="m-t-3">
          {this.renderProgress({goodsNum, giftNum, giftGainedNum, status, createdDate, finishedDate})}
          {this.renderGainedList()}
          <p className="text-center">
            <i className="hb-logo"></i>
          </p>
        </section>
        {
          this.state.showFoot ? (
            <div className="hb-footer text-center">
              <Link className="hb-active-btn" to="/">发起实物红包</Link>
            </div>
          ) : null
        }
      </article>
    );
  }
}

HongbaoDetail.contextTypes = {
  router: PropTypes.object.isRequired
};

HongbaoDetail.propTypes = {
  identifier: PropTypes.string,
  thirdAccId: PropTypes.string,
  accountType: PropTypes.string,
  hongbaoInfo: PropTypes.object,
  participantPagination: PropTypes.object,
  hongbaoDetailAction: PropTypes.object,
};

export default HongbaoDetail;
