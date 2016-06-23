import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import Loading from '../../ui/Loading';
import perfect from '../../utils/perfect';

class HongbaoInfo extends Component {

  componentDidMount() {
    //加载红包详情
    const {hongbaoDetailAction, id} = this.props;
    let body = {
      identifier: id,
      accountType: 'WALLET',
      thirdAccId: '123456'
    };
    hongbaoDetailAction.getHongbaoDetail(body);

    body = {
      identifier: id
    };
    hongbaoDetailAction.getParticipantList(body);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const {hongbaoInfo, participantPagination} = nextProps;
    const {list} = participantPagination;
    if (hongbaoInfo.skuId && list && list.length > 0) {
      return true;
    }
    return false;
  }

  //渲染获取者列表
  renderGainedList(item) {
    const {participantPagination} = this.props;
    const {list} = participantPagination;
    if (list && list.length > 0) {
      return (
        <ul className="hb-list">
          {list.map((item) => {
            let {giftRecordId, nickName, headpic, giftAmount, giftGainedDate, giftType} = item;
            giftAmount = (giftAmount / 100).toFixed(2);

            //测试数据
            nickName = nickName || '匿名';
            headpic = headpic || 'http://img12.360buyimg.com/n2/jfs/t2812/46/1557908128/260742/4648595c/5742d02eN8d52b027.jpg';

            return (
              <li key={giftRecordId} className="row flex-items-middle">
                <div className="col-4">
                  <img className="img-fluid img-circle" src={headpic} alt=""/>
                </div>
                <div className="col-15">
                  <div className="text-truncate">{nickName}</div>
                  <div className="text-muted f-sm">{perfect.formatDate(giftGainedDate)}</div>
                </div>

                {
                  giftType === '2' ? (
                    <div className="col-5 text-right">
                      {giftAmount}元
                    </div>
                  ) : (
                    <div className="col-5 text-right">
                      <div>中奖啦</div>
                      <div className="text-warning"><i className="icon icon-champion"></i> 手气最佳</div>
                    </div>
                  )
                }
              </li>
            );
          })}
        </ul>
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
  renderProgress({goodsNum, giftNum, giftGainedNum, status}) {
    switch (status) {
      case 'RECEIVE_COMPLETE':
        return (
          <div className="m-l-1">共{goodsNum}个奖品、{giftNum}个现金红包</div>
        );
      default:
        return null;
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
      skuId, skuName, skuIcon, createdDate, ownerHeadpic, ownerNickname,
      title, giftAmount, goodsNum, giftNum, giftGainedNum, status, selfInfo
    } = hongbaoInfo;


    title = title || '我发起了个实物和现金红包，快来抢啊！';
    //领取者
    selfInfo = {};
    giftAmount = 100;


    if (!skuId) {
      return (
        <Loading/>
      );
    }

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
            <div>
              <div className="text-center text-primary">
                <span className="h1">{(giftAmount / 100).toFixed(2)}</span> <span>元</span>
              </div>
              <a href="#">收到的钱可在钱包余额中提现，去看看！</a>
            </div>
          </div>
        </section>

        <section className="m-t-3">
          {this.renderProgress({goodsNum, giftNum, giftGainedNum, status})}
          {this.renderGainedList()}
        </section>

        <section className="m-t-2 text-center">
          <Link to="/my">查看我收到的红包纪录</Link>
        </section>
      </article>
    );
  }
}

HongbaoInfo.contextTypes = {
  router: PropTypes.object.isRequired
};

HongbaoInfo.propTypes = {
  id: PropTypes.string,
  hongbaoInfo: PropTypes.object,
  participantPagination: PropTypes.object,
  hongbaoDetailAction: PropTypes.object,
};

export default HongbaoInfo;
