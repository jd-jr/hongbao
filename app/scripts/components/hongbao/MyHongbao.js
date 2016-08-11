import React, {Component, PropTypes} from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import deviceEnv from 'jd-wallet-sdk/lib/utils/device-env';
import BottomNav from '../BottomNav';
import ReceiveHongbao from './ReceiveHongbao';
import SponsorHongbao from './SponsorHongbao';
import perfect from '../../utils/perfect';
import {SHOW_FOOT_DELAY} from '../../constants/common';

class MyHongbao extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      type: props.type || 'receive',
      isLogin: !deviceEnv.inJdWallet,
      showFoot: false,
    };
    this.switchTab = this.switchTab.bind(this);
    this.loadUserInfo = this.loadUserInfo.bind(this);
    this.first = true;
  }

  componentDidMount() {
    //延迟显示底部按钮，解决 IOS 下底部按钮设置 fixed 的问题
    setTimeout(() => {
      this.setState({
        showFoot: true
      });
    }, SHOW_FOOT_DELAY);

    if (deviceEnv.inJdWallet) {
      const {setClientInfo} = this.props;
      //如果是首次进入,需延迟执行,因为调用 ios 的 getInfo 有问题
      if (this.first && deviceEnv.inIos) {
        setTimeout(() => {
          setClientInfo((login) => {
            if (login) {
              this.loadUserInfo();
              this.setState({
                isLogin: true
              });
            } else {
              this.context.router.goBack();
            }
          });
          this.first = false;
        }, 400);
      } else {
        setClientInfo((login) => {
          if (login) {
            this.loadUserInfo();
            this.setState({
              isLogin: true
            });
          } else {
            this.context.router.goBack();
          }
        });
      }
    } else {
      this.loadUserInfo();
    }
  }

  loadUserInfo(refresh) {
    const {hongbaoActions, caches, cacheActions} = this.props;
    if (refresh || !caches.userInfo) {
      const accountType = perfect.getAccountType();
      const thirdAccId = perfect.getThirdAccId();
      const body = {
        accountType,
        accountId: thirdAccId
      };

      hongbaoActions.getUserInfo(body);
      cacheActions.addCache('userInfo');
    }
  }

  switchTab(e, type) {
    this.setState({
      type
    });
    //埋点
    perfect.setBuriedPoint(type === 'receive' ? 'hongbao_my_receive' : 'hongbao_my_sponsor');
    history.replaceState(null, null, `?type=${type}`);
  }

  render() {
    const {type, isLogin} = this.state;
    const {
      hongbaoActions, receivePagination, sponsorPagination, userInfo,
      caches, cacheActions, receiveType
    } = this.props;

    const receiveProps = {
      hongbaoActions,
      receivePagination,
      userInfo,
      caches,
      cacheActions,
      type,
      receiveType,
      loadUserInfo: this.loadUserInfo
    };

    const sponsorProps = {
      hongbaoActions,
      sponsorPagination,
      userInfo,
      caches,
      cacheActions,
      type,
      loadUserInfo: this.loadUserInfo
    };

    return (
      <div>
        <header className="hb-nav-btn-group row hb-header">
          <div className={`col-12 hb-nav-btn-left${type === 'receive' ? ' active' : ''}`}
               onTouchTap={(e) => this.switchTab(e, 'receive')}>我收到的
          </div>
          <div className={`col-12 hb-nav-btn-right${type === 'sponsor' ? ' active' : ''}`}
               onTouchTap={(e) => this.switchTab(e, 'sponsor')}>我发出的
          </div>
        </header>

        <article>
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
        {this.state.showFoot ? (<BottomNav type="receive"/>) : null}
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
  receiveType: PropTypes.string,
  setClientInfo: PropTypes.func,
  caches: PropTypes.object,
  cacheActions: PropTypes.object,
};

export default MyHongbao;
