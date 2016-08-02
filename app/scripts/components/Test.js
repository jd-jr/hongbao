import React, {Component, PropTypes} from 'react';
import walletApi from 'jd-wallet-sdk';
import deviceEnv from 'jd-wallet-sdk/lib/utils/device-env';
import {SHARE_ICON_URL} from '../constants/common';
import {HONGBAO_TITLE, HONGBAO_DESC} from '../constants/common';

class Test extends Component {
  constructor(props, context) {
    super(props, context);
    this.weixinShare = this.weixinShare.bind(this);
    this.closeWindow = this.closeWindow.bind(this);
  }

  componentWillMount() {
    if (deviceEnv.inWx && window.wx) {
      window.wx.showOptionMenu();
    }
  }

  weixinShare() {
    window.wx.showOptionMenu();
    //调起分享
    walletApi.share({
      url: location.href,
      title: HONGBAO_TITLE,
      desc: HONGBAO_DESC,
      imgUrl: SHARE_ICON_URL,
      channel: 'WX',
      debug: Boolean(window.eruda),
      callback: (status) => {
        if (deviceEnv.inWx) {
          //回到首页
          this.context.router.replace('/');
        }
        if (status === 'SUCCESS') {
          this.setState({
            visible: false
          });
          //回到首页
          this.context.router.replace('/');
        }
      }
    });
  }

  closeWindow() {
    if (window.wx) {
      window.wx.closeWindow();
    }
  }

  render() {
    return (
      <div className="m-a-2">
        <p>
          <button type="button" onClick={this.weixinShare}>微信分享</button>
        </p>

        <p>
          <button type="button" onClick={this.closeWindow}>关闭窗口</button>
        </p>
      </div>
    );
  }
}

Test.propTypes = {
  indexActions: PropTypes.object,
  setModalCloseCallback: PropTypes.func
};

Test.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default Test;
