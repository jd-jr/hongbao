import React, {Component, PropTypes} from 'react';
import jdWalletApi from 'jd-wallet-sdk';
import deviceEnv from 'jd-wallet-sdk/lib/utils/device-env';
import BottomNav from '../BottomNav';
import ReceiveHongbao from './ReceiveHongbao';
import SponsorHongbao from './SponsorHongbao';
import perfect from '../../utils/perfect';

class MyHongbao extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      type: props.type || 'receive',
      loaded: false
    };
    this.switchTab = this.switchTab.bind(this);
  }

  componentWillMount() {
    if (deviceEnv.inJdWallet) {
      const {setClientInfo} = this.props;
      setClientInfo((login) => {
        if (login) {
          this.loadData();
        }
      });
    } else {
      this.loadData();
    }
  }

  loadData() {
    const {hongbaoActions} = this.props;
    const accountType = perfect.getAccountType();
    const thirdAccId = perfect.getThirdAccId();
    const body = {
      accountType,
      accountId: thirdAccId
    };

    hongbaoActions.getUserInfo(body).then((json) => {
      this.setState({
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

  render() {
    const {type, loaded} = this.state;
    const {hongbaoActions, receivePagination, sponsorPagination, userInfo} = this.props;

    if (!loaded) {
      return null;
    }

    return (
      <div>
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
