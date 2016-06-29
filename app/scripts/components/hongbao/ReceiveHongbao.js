import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import offset from 'perfect-dom/lib/offset';
import perfect from '../../utils/perfect';

class ReceiveHongbao extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      type: 'received', // received 已收红包， luck 手气最佳
    };
    this.switchTab = this.switchTab.bind(this);
  }

  componentDidMount() {
    this.adjustArrow();
    this.loadData();
  }

  shouldComponentUpdate(nextProps, nextState) {
    const {
      userInfo,
      receivePagination
    } = nextProps;

    if (userInfo.giftAndThirdAccUserInfoDto && receivePagination.list) {
      return true;
    }
    return false;
  }


  loadData() {
    const {hongbaoActions} = this.props;
    const body = {
      requestNo: '1111',
      accountType: 'WECHAT',
      accountId: '123456'
    };

    if (this.state.type === 'luck') {
      body.lucky = 'LUCK';
    }
    hongbaoActions.getHongbaoList(body, 'receive');
  }

  //切换已收红包和手气最佳
  switchTab(e, type) {
    this.setState({
      type
    }, () => {
      this.adjustArrow();
      this.loadData();
    });
  }

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
    this.refs.arrow.style.left = `${xy.left + width / 2 - 8}px`;
  }

  /*eslint-disable indent*/
  getStatus({status, giftAmount, giftType, skuIcon}) {
    if (giftType === 'CASH') {
      return (
        <div>
          {(giftAmount / 100).toFixed(2)}元
        </div>
      );
    }

    switch (status) {
      case 'RECEIVE_COMPLETE':
        return (
          <div className="hb-img-text-thumb">
            <img
              src={skuIcon}
              alt=""/>
            <div className="label-text bg-primary">未领取</div>
          </div>
        );
      case 'OK':
        return (
          <div className="hb-img-text-thumb">
            <img
              src="http://wx.qlogo.cn/mmopen/PiajxSqBRaEIYD5HN4ue4hkrr1p1DLzZxxXA5Nwf2UZWHkmyPGnV4x8An3ISaL668th37Ocic9vx7YX9WIaglcWA/0"
              alt=""/>
            <div className="label-text bg-info">已领取</div>
          </div>
        );
      case 'EXPIRED':
        return (
          <div className="hb-img-text-thumb">
            <img
              src="http://wx.qlogo.cn/mmopen/PiajxSqBRaEIYD5HN4ue4hkrr1p1DLzZxxXA5Nwf2UZWHkmyPGnV4x8An3ISaL668th37Ocic9vx7YX9WIaglcWA/0"
              alt=""/>
            <div className="label-text bg-muted">已过期</div>
          </div>
        );
      default:
        return null;
    }
  }

  renderItem(item) {
    const {id, skuIcon, createdDate, giftAmount, status, giftType, thirdAccountUserInfoDtoList} = item;
    const {nickName} = thirdAccountUserInfoDtoList || {};
    return (
      <li key={id}>
        <Link className="hb-link-block row flex-items-middle" to="/hongbao/detail/view/99d877579e94e5cf">
          <div className="col-18">
            <div className="text-truncate">{nickName}</div>
            <div className="text-muted f-sm">{perfect.formatDate(createdDate)}</div>
          </div>
          <div className="col-6 text-right">
            {this.getStatus({status, giftAmount, giftType, skuIcon})}
          </div>
        </Link>
      </li>
    );
  }

  //渲染列表
  renderList() {
    const {
      receivePagination
    } = this.props;

    const list = receivePagination.list;

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
    const {type} = this.state;
    const {userInfo} = this.props;
    const {giftAndThirdAccUserInfoDto, redbagAssemblyRetDto} = userInfo;
    let {nickName, headpic} = (giftAndThirdAccUserInfoDto || {});

    let {gainCashBalance, gainGoodNum, gainNum} = (redbagAssemblyRetDto || {});
    if (gainCashBalance === undefined) {
      gainCashBalance = 0;
    }

    return (
      <div>
        <section className="text-center m-t-2">
          <div>
            <img className="img-circle img-thumbnail hb-figure" src={headpic} alt=""/>
          </div>
          <h3 className="m-t-1">{nickName}共收到</h3>
          <div className="h1">{(gainCashBalance / 100).toFixed(2)}</div>

          <div>
            <button className="btn btn-primary btn-sm hb-fillet-1">去京东钱包提现</button>
          </div>
        </section>

        <section className="row text-center m-t-1">
          <div className={`col-10 ${type === 'received' ? 'text-primary' : 'text-muted'}`}
               onTouchTap={(e) => this.switchTab(e, 'received')}>
            <div>已收红包</div>
            <div className="h1" ref="receivedHb">{gainNum}</div>
          </div>
          <div className={`col-10 offset-4 ${type === 'luck' ? 'text-primary' : 'text-muted'}`}
               onTouchTap={(e) => this.switchTab(e, 'luck')}>
            <div>手气最佳</div>
            <div className="h1" ref="luckHb">{gainGoodNum}</div>
          </div>
        </section>
        <section className="m-t-1">
          <div className="arrow-hollow-top hb-arrows-active" ref="arrow"></div>
          {this.renderList()}
        </section>
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
};

export default ReceiveHongbao;
