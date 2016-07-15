import React, {Component, PropTypes} from 'react';
import walletApi from 'jd-wallet-sdk';
import deviceEnv from 'jd-wallet-sdk/lib/utils/device-env';
import {MYSTIC_GIFT} from '../config';
import {HONGBAO_TITLE, HONGBAO_DESC} from '../constants/common';

class Test extends Component {
  constructor(props, context) {
    super(props, context);
    this.weixinShare = this.weixinShare.bind(this);
  }

  componentWillMount() {
    if (deviceEnv.inWx && window.wx) {
      window.wx.showOptionMenu();
    }
    /*const {indexActions, setModalCloseCallback} = this.props;
    indexActions.setErrorMessage('大家帮看看，分享图片是否可见！');
    setModalCloseCallback(() => {
      this.context.router.replace('/');
    });*/
  }

  weixinShare() {
    window.wx.showOptionMenu();
    //调起分享
    walletApi.share({
      url: location.href,
      title: HONGBAO_TITLE,
      desc: HONGBAO_DESC,
      imgUrl: MYSTIC_GIFT,
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

  render() {
    return (
      <div>
        <button type="button" onClick={this.weixinShare}>微信分享</button>
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
