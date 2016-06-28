import React, {Component, PropTypes} from 'react';
import jdWalletApi from 'jd-wallet-sdk';
import deviceEnv from 'jd-wallet-sdk/lib/utils/device-env';
import BottomNav from '../BottomNav';
import ReceiveHongbao from './ReceiveHongbao';
import SponsorHongbao from './SponsorHongbao';
import perfect from '../../utils/perfect';
import {JD_LOGIN_URL, QB_LOGIN_URL} from '../../config';

class MyHongbao extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      type: props.type || 'receive',
      logined: false, //是否登录
      loaded: false
    };
    this.switchTab = this.switchTab.bind(this);
    this.login = this.login.bind(this);
  }

  componentWillMount() {
    if (deviceEnv.inJdWallet) {
      jdWalletApi.getClientInfo((info) => {
        info = perfect.parseJSON(info) || {};
        const {isLogin} = info;
        let state = {
          loaded: true
        };
        /*eslint-disable eqeqeq*/
        if (isLogin == '1') {
          state.logined = true;
          this.loadData();
        }
        this.setState(state);
      });
    } else {
      this.loadData();
    }

  }

  loadData() {
    const {hongbaoActions} = this.props;
    const body = {
      requestNo: '444',
      accountType: 'WALLET',
      accountId: 'otEnCjr7J1-9mhlGUyxQVtNxBGL0'
    };

    hongbaoActions.getUserInfo(body).then((json) => {
      this.setState({
        logined: Boolean(json),
        loaded: true
      });
    });
  }

  switchTab(e, type) {
    this.setState({
      type
    });
    history.replaceState(null, null, `?type=${type}`);
  }

  login() {
    if (deviceEnv.inJdWallet) {
      const {setClientInfo} = this.props;
      setClientInfo((login) => {
        if (login) {
          this.loadData();
        }
      });
    } else {
      let activeUrl = location.href;
      location.href = JD_LOGIN_URL + encodeURIComponent(QB_LOGIN_URL + activeUrl);
    }
  }

  render() {
    const {type, logined, loaded} = this.state;
    const {hongbaoActions, receivePagination, sponsorPagination, userInfo} = this.props;

    if (!loaded) {
      return null;
    }

    return (
      <div>
        {logined ? (
          <article className="hb-wrap-mb">
            <section className="hb-nav-btn-group row">
              <div className={`col-12 hb-nav-btn-left${type === 'receive' ? ' active' : ''}`}
                   onTouchTap={(e) => this.switchTab(e, 'receive')}>我收到的
              </div>
              <div className={`col-12 hb-nav-btn-right${type === 'sponsor' ? ' active' : ''}`}
                   onTouchTap={(e) => this.switchTab(e, 'sponsor')}>我发出的
              </div>
            </section>
            {type === 'receive' ?
              (<ReceiveHongbao hongbaoActions={hongbaoActions} receivePagination={receivePagination}
                               userInfo={userInfo}/>) :
              (<SponsorHongbao hongbaoActions={hongbaoActions} sponsorPagination={sponsorPagination}
                               userInfo={userInfo}/>)}
          </article>
        ) : (
          <article className="hb-wrap-mb text-center">
            <div className="f-lg" style={{marginTop: '35%'}}>您还未登录</div>
            <p className="text-muted">登录之后可以参与实物红包</p>
            <div className="m-t-2">
              <button onTouchTap={this.login} className="btn btn-primary btn-outline-primary">立即登录</button>
            </div>
          </article>
        )}

        <BottomNav type="receive"/>
      </div>
    );

  }
}

MyHongbao.contextTypes = {
  router: PropTypes.object.isRequired
};

MyHongbao.propTypes = {
  hongbaoActions: PropTypes.object,
  sponsorPagination: PropTypes.object,
  receivePagination: PropTypes.object,
  userInfo: PropTypes.object,
  type: PropTypes.string,
  setClientInfo: PropTypes.func,
};

export default MyHongbao;
