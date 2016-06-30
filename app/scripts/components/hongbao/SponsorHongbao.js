import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import perfect from '../../utils/perfect';

class SponsorHongbao extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      type: 'received' // received 已收红包， luck 手气最佳
    };
    this.switchTab = this.switchTab.bind(this);
  }

  componentDidMount() {
    const {hongbaoActions, thirdAccId, accountType} = this.props;
    const body = {
      accountType: accountType || perfect.getAccountType(),
      accountId: thirdAccId
    };

    hongbaoActions.getHongbaoList(body, 'sponsor');
  }

  //切换已收红包和手气最佳
  switchTab(e, type) {
    this.setState({
      type
    });
  }

  /*eslint-disable indent*/
  getStatus({status, giftGainedNum, giftNum, goodNum}) {
    switch (status) {
      case 'RECEIVE_COMPLETE':
        return (
          <div>
            已抢光 {giftGainedNum}/{giftNum + goodNum}个
          </div>
        );
      case 'OK':
        return (
          <div>
            {giftGainedNum}/{giftNum + goodNum}个
          </div>
        );
      case 'EXPIRED':
        return (
          <div>
            已过期
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

  renderItem(item) {
    const {identifier, skuIcon, createdDate, amount, status, giftGainedNum, giftNum, goodNum} = item;
    let {thirdAccId, accountType} = this.props;
    accountType = accountType || perfect.getAccountType();
    let link = `/hongbao/detail/${identifier}?accountType=${accountType}`;
    if (thirdAccId) {
      link += `&thirdAccId=${thirdAccId}`;
    }

    return (
      <li key={identifier}>
        <Link to={link} className="hb-link-block row flex-items-middle">
          <div className="col-4">
            <img className="img-fluid" src={skuIcon} alt=""/>
          </div>
          <div className="col-14">
            <div className="text-truncate">拼手气</div>
            <div className="text-muted f-sm">{perfect.formatDate(createdDate)}</div>
          </div>
          <div className="col-6 text-right">
            <div>{(amount / 100).toFixed(2)}元</div>
            <div className="text-muted f-sm">
              {this.getStatus({status, giftGainedNum, giftNum, goodNum})}
            </div>
          </div>
        </Link>
      </li>
    );
  }

  //渲染列表
  renderList() {
    const {
      sponsorPagination
    } = this.props;

    const list = sponsorPagination.list;

    if (!list) {
      return (
        <div className="page-loading">载入中，请稍后 ...</div>
      );
    } else if (list.length === 0) {
      return (
        <div className="m-t-3 text-center text-muted">
          没有记录
        </div>
      );
    }

    return (
      <ul className="hb-list">
        {
          list ? list.map((item) => {
            return this.renderItem(item);
          }) : null
        }
      </ul>
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
  thirdAccId: PropTypes.string,
  accountType: PropTypes.string,
};

export default SponsorHongbao;
