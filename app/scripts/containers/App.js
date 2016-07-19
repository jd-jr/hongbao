import React, {Component, PropTypes} from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import walletApi from 'jd-wallet-sdk';
import deviceEnv from 'jd-wallet-sdk/lib/utils/device-env';
import Modal from 'reactjs-modal';
import {setSessionStorage, getSessionStorage} from '../utils/sessionStorage';
import * as cacheActions from '../actions/caches';
import * as indexActions from '../actions/index';
import perfect from '../utils/perfect';

class App extends Component {

  constructor(props, context) {
    super(props, context);
    this.setClientInfo = this.setClientInfo.bind(this);
    this.onClose = this.onClose.bind(this);
    this.setModalCloseCallback = this.setModalCloseCallback.bind(this);
    this.modalCloseCallback = function () {
    };

    this.toastTimeoutId;
  }

  componentDidUpdate() {
    const {
      toast, indexActions
    } = this.props;

    if (toast && toast.effect === 'enter') {
      if (this.toastTimeoutId) {
        clearTimeout(this.toastTimeoutId);
        this.toastTimeoutId = null;
      } else {
        this.toastTimeoutId = setTimeout(() => {
          indexActions.clearToast();
          this.toastTimeoutId = null;
        }, 1500);
      }
    }
  }

  //跳转到设置客户端信息
  setClientInfo(callback) {
    //如果不在京东钱包中打开,直接调用回调函数
    if (!deviceEnv.inJdWallet) {
      return callback(true);
    }

    let clientInfo = getSessionStorage('clientInfo');
    clientInfo = perfect.parseJSON(clientInfo) || {};

    walletApi.getClientInfo((info) => {
      info = perfect.parseJSON(info) || {};
      //如果没有设置clientInfo 或者 auth 过期，则需重新设置

      if (!clientInfo.auth || info.auth !== clientInfo.auth) {
        if (info.auth && String(info.isLogin) === '1') {
          if (!info.jdPin) {
            // bindJdPin 没有提供回调参数，故还需重新处理
            // FIXME ios 后退没有调用回调函数
            walletApi.bindJdPin(() => {
              walletApi.getClientInfo((info) => {
                info = perfect.parseJSON(info) || {};
                const jdPin = info.jdPin;
                if (jdPin) {
                  this.updateClientInfo(info, callback);
                } else {
                  walletApi.alert('您还没有绑定京东账户，请重新绑定');
                  callback(false);
                }
              });
            });
          } else {
            this.updateClientInfo(info, callback);
          }
        } else {
          this.login(callback);
        }
      } else {
        this.executeCallback(callback, true);
      }
    });
  }

  //登录
  login(callback) {
    walletApi.login(() => {
      // 再一次的检测，如果登录失败或没有登录，需跳回到首页
      walletApi.getClientInfo((info) => {
        info = perfect.parseJSON(info) || {};
        if (info.auth && String(info.isLogin) === '1') {
          //登录成功后
          this.updateClientInfo(info, callback);
        } else {
          this.executeCallback(callback, false);
        }
      });
    });
  }

  // 更新钱包客户端信息
  updateClientInfo(info, callback) {
    //处理一下 Android 和 ios 数据类型不一致的问题
    info.isLogin = String(info.isLogin);
    info.isRealName = String(info.isRealName);
    setSessionStorage('clientInfo', perfect.stringifyJSON(info));
    this.executeCallback(callback, true);
  }

  //执行回调
  executeCallback(callback, isLogin, delay) {
    if (callback && typeof callback === 'function') {
      if (delay) {
        setTimeout(() => {
          callback(isLogin);
        }, 50);
      } else {
        callback(isLogin);
      }
    }
  }

  //关闭 Modal
  onClose() {
    const {indexActions} = this.props;
    indexActions.resetErrorMessage();
    if (this.modalCloseCallback && typeof this.modalCloseCallback === 'function') {
      this.modalCloseCallback();
      setTimeout(() => {
        this.modalCloseCallback = null;
      }, 300);
    }
  }

  //设置关闭模态窗口回调函数
  setModalCloseCallback(callback) {
    this.modalCloseCallback = callback;
  }

  // alert 窗口
  alert() {
    const {
      errorMessage
    } = this.props;

    const footer = (
      <div className="text-center">
        <span className="btn btn-alert" onClick={this.onClose}>
          确定
        </span>
      </div>
    );

    return (
      <Modal
        className="hb-alert"
        visible={Boolean(errorMessage)}
        style={{width: '70%'}}
        onClose={this.onClose}
        footer={footer}
        animation
        maskAnimation
        preventTouchmove
        closable={false}
      >
        <div className="text-center">{errorMessage}</div>
      </Modal>
    );
  }

  // toast 组件
  renderToast() {
    const {
      toast
    } = this.props;
    const {content, effect} = toast;

    const classname = `toast-panel flex flex-items-center flex-items-middle ${effect}`;
    return (
      <div className={classname}>
        <div className="toast">{content}</div>
      </div>
    );
  }

  render() {
    const {
      children, location, caches, cacheActions, errorMessage, indexActions
    } = this.props;

    return (
      <div>
        {this.alert()}
        {this.renderToast()}
        <ReactCSSTransitionGroup
          component="div"
          transitionName="hb-animate-right"
          transitionEnterTimeout={200}
          transitionLeaveTimeout={200}>
          {children && React.cloneElement(children, {
            key: location.pathname,
            caches,
            cacheActions,
            errorMessage,
            indexActions,
            setClientInfo: this.setClientInfo,
            setModalCloseCallback: this.setModalCloseCallback
          })}
        </ReactCSSTransitionGroup>
      </div>
    );
  }
}

App.propTypes = {
  children: PropTypes.node,
  location: PropTypes.object,
  cacheActions: PropTypes.object,
  caches: PropTypes.object,
  errorMessage: PropTypes.string,
  toast: PropTypes.object,
  indexActions: PropTypes.object,
};

function mapStateToProps(state, ownProps) {
  const {caches, errorMessage, toast} = state;
  return {
    caches,
    errorMessage,
    toast,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    cacheActions: bindActionCreators(cacheActions, dispatch),
    indexActions: bindActionCreators(indexActions, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
