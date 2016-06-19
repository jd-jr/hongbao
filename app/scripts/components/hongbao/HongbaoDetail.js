import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import callApi from '../../fetch';

class HongbaoDetail extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      detail: null
    };
  }

  componentDidMount() {
    this.loadDetail();
  }

  loadDetail() {
    const url = 'info';
    const {id} = this.props;
    // id 表示红包 id
    const body = {
      identifier: id
    };

    callApi({url, body}).then(
      ({json, response}) => {
        this.setState({
          detail: json.data
        });
      },
      (error) => {

      }
    );
  }

  //渲染获取者列表
  renderGainedList(item) {
    let {id, nickname, face, amount} = item;
    amount = amount.toFixed(2);
    return (
      <li key={id} className="row flex-items-middle">
        <div className="col-4">
          <img className="img-fluid" src={face} alt=""/>
        </div>
        <div className="col-15">
          <div className="text-truncate">{nickname}</div>
          <div className="text-muted f-sm">05-29 18:03:02</div>
        </div>
        <div className="col-5 text-right">
          {amount}元
        </div>
      </li>
    );
  }

  /**
   * {
    redbagInfo: {
      identifier: '红包ID',
      title: '红包标题',
      totalAmount: 1000,
      giftNum: 10,
      giftGainedNum: 1,
      ownerType: 'WALLET、WECHAT、QQ',
      ownerId: '发起者ID',
      expiredDate: '过期时间',
      finishedDate: '完成时间',
      redbagStatus: '红包状态 支付成功PAY_SUCC、已完成 RECEIVE_COMPLETE、已过期 EXPIRED、已退款REFUNDED'
    },
    itemInfo: {
      skuId: 'skuId',
      skuName: 'sku名称',
      icon: 'http://xxx'
    },
    self: {
      nickname: '用户昵称',
      face: '用户头像',
      giftType: 'CASH、GOODS',
      amount: 1000,
      accountType: '账户类型 可选值：WALLET WBCHAT QQ',
      thirdAccId: '账户id，可选值 微信unionID 钱包customerId '
    },
    record: [
      {
        id: 1,
        giftType: 'CASH、GOODS',
        amount: 1000,
        nickname: '用户昵称',
        face: '用户头像',
        accountType: '账户类型 可选值：WALLET WBCHAT QQ',
        thirdAccId: '账户id，可选值 微信unionID 钱包customerId '
      },
      {
        id: 2,
        giftType: 'CASH、GOODS',
        amount: 1000,
        nickname: '用户昵称',
        face: '用户头像',
        accountType: '账户类型 可选值：WALLET WBCHAT QQ',
        thirdAccId: '账户id，可选值 微信unionID 钱包customerId '
      }
    ]
  }
   */
  render() {
    const {detail} = this.state;
    if (!detail) {
      return null;
    }

    const {itemInfo, self, redbagInfo, record} = detail;
    const {skuId, skuName, icon} = itemInfo;
    const {nickname, face} = self;
    const {title, totalAmount, redbagStatus} = redbagInfo;

    return (
      <article>
        <section>
          <div className="hb-single m-t-1 m-b-1">
            <div className="row flex-items-middle">
              <div className="col-4">
                <img className="img-fluid" src={icon} alt=""/>
              </div>
              <div className="col-16">
                <div className="text-truncate">{skuName}</div>
                <div className="text-muted f-sm">发起时间：</div>
              </div>
              <div className="col-4 border-left border-second text-center">
                <Link to={`/product/detail/${skuId}`}>查看</Link>
              </div>
            </div>
          </div>

          <div className="text-center m-t-3">
            <div>
              <img className="img-circle img-thumbnail hb-figure"
                   src={face} alt=""/>
            </div>
            <h3 className="m-t-2">{nickname}的红包</h3>
            <p className="text-muted">{title}</p>
            {
              redbagStatus === 'EXPIRED' ? (
                <div>
                  <button className="btn btn-primary btn-outline-primary">申请退款</button>
                </div>
              ) : null
            }
            <div>
              <div className="text-center text-primary">
                <span className="h1">0.02</span> <span>元</span>
              </div>
              <a href="#">收到的钱可在钱包余额中提现，去看看！</a>
            </div>
          </div>
        </section>

        <section className="m-t-3">
          <div className="m-l-1">1个奖品、9个现金红包，实物未领取，该红包已过期</div>
          <ul className="hb-list">
            {record.map((item) => {
              return this.renderGainedList(item)
            })}
          </ul>
        </section>

        <section className="m-t-2">
          <p className="text-center text-muted">查看我收到的红包纪录</p>
        </section>
      </article>
    );
  }
}

HongbaoDetail.contextTypes = {
  router: PropTypes.object.isRequired
};

HongbaoDetail.propTypes = {
  id: PropTypes.string,
};

export default HongbaoDetail;
