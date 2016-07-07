import React, {Component, PropTypes} from 'react';
import deviceEnv from 'jd-wallet-sdk/lib/utils/device-env';
import BottomNav from '../BottomNav';
import ReceiveHongbao from './ReceiveHongbao';
import SponsorHongbao from './SponsorHongbao';
import perfect from '../../utils/perfect';
import emsCnpl from '../../../images/wallet-ems-cnpl.png';

class MyHongbao extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      type: props.type || 'receive',
      isLogin: !deviceEnv.inJdWallet
    };
    this.switchTab = this.switchTab.bind(this);
  }

  componentWillMount() {
    if (deviceEnv.inJdWallet) {
      const {setClientInfo} = this.props;
      setClientInfo((login) => {
        if (login) {
          this.loadData();
          this.setState({
            isLogin: true
          });
        } else {
          this.context.router.goBack();
        }
      });
    } else {
      this.loadData();
    }
  }

  componentWillUnmount() {
    const {hongbaoActions, cacheActions} = this.props;
    hongbaoActions.clearReceive();
    hongbaoActions.clearSponsor();
    hongbaoActions.clearUserInfo();
    cacheActions.resetCacheById('receivePagination');
    cacheActions.resetCacheById('sponsorPagination');
  }

  loadData() {
    const {hongbaoActions} = this.props;
    const accountType = perfect.getAccountType();
    const thirdAccId = perfect.getThirdAccId();
    const body = {
      accountType,
      accountId: thirdAccId
    };

    hongbaoActions.getUserInfo(body);
  }

  switchTab(e, type) {
    this.setState({
      type
    });
    history.replaceState(null, null, `?type=${type}`);
  }

  render() {
    const {type, isLogin} = this.state;
    const {
      hongbaoActions, receivePagination, sponsorPagination, userInfo,
      caches, cacheActions
    } = this.props;

    const receiveProps = {
      hongbaoActions,
      receivePagination,
      userInfo,
      caches,
      cacheActions,
      type
    };

    const sponsorProps = {
      hongbaoActions,
      sponsorPagination,
      userInfo,
      caches,
      cacheActions,
      type
    };

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

          {
            deviceEnv.inWx ? (
              <section className="hb-single row m-a-1">
                <div className="col-5">
                  <img className="img-fluid" src={emsCnpl} alt=""/>
                </div>
                <div className="col-19 flex flex-items-center flex-items-column">
                  <div>关注京东钱包，查看后续中奖信息！</div>
                  <div className="text-muted">长按识别二维码</div>
                </div>
              </section>
            ) : null
          }
          {
            isLogin ? (
              type === 'receive' ?
                (<ReceiveHongbao {...receiveProps}/>) :
                (<SponsorHongbao {...sponsorProps}/>)
            ) : null
          }
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
  caches: PropTypes.object,
  cacheActions: PropTypes.object,
};

export default MyHongbao;
