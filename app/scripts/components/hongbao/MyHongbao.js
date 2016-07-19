import React, {Component, PropTypes} from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
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
    this.focusonQrCode = this.focusonQrCode.bind(this);
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
    //埋点
    perfect.setBuriedPoint(type === 'receive' ? 'hongbao_my_receive' : 'hongbao_my_sponsor');
    history.replaceState(null, null, `?type=${type}`);
  }

  // 关注二维码
  focusonQrCode() {
    const {type} = this.props;
    //埋点
    perfect.setBuriedPoint(`hongbao_${type || 'receive'}_qrcode`);
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
        <article className="hb-wrap-mb-sm">
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
                <div className="col-5" onTouchTap={this.focusonQrCode}>
                  <img className="img-fluid" src={emsCnpl} alt=""/>
                </div>
                <div className="col-19 flex flex-items-center flex-items-column">
                  <div>关注京东钱包，及时查看红包信息！</div>
                  <div className="text-muted">长按识别二维码</div>
                </div>
              </section>
            ) : null
          }
          <ReactCSSTransitionGroup
            component="div"
            transitionName="hb-animate-right"
            transitionEnterTimeout={100}
            transitionLeaveTimeout={100}>
            {
              isLogin ? (
                type === 'receive' ?
                  (<ReceiveHongbao key="receive" {...receiveProps}/>) :
                  (<SponsorHongbao key="sponsor" {...sponsorProps}/>)
              ) : null
            }
          </ReactCSSTransitionGroup>
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
