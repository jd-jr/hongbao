import React, {Component, PropTypes} from 'react';
import Modal from 'reactjs-modal';
import prefect from '../../utils/perfect';
import walletApi from 'jd-wallet-sdk';
import deviceEnv from 'jd-wallet-sdk/lib/utils/device-env';
import {HONGBAO_TITLE, HONGBAO_MYSTIC} from '../../constants/common';
import weixinShareGuide from '../../../images/weixin-share-guide.png';
import {MYSTIC_GIFT} from '../../config';

class Initiate extends Component {
  constructor(props) {
    super(props);
    let {status, skuIcon, mystic} = this.props;
    this.state = {
      success: status === 'true',
      visible: true,
      weixinGuide: false
    };

    this.sponsor = this.sponsor.bind(this);
    this.onClose = this.onClose.bind(this);
    this.closeShareGuide = this.closeShareGuide.bind(this);

    if (mystic === 'true') {
      skuIcon = MYSTIC_GIFT;
    }
    //设置分享图片
    if (deviceEnv.inJdWallet) {
      walletApi.shareIconURL(skuIcon, 'hongbao');
    }
  }

  //发红包
  sponsor() {
    if (deviceEnv.inWx) {
      this.setState({
        weixinGuide: true
      });
      this.share();
    } else if (deviceEnv.inJdWallet) {
      this.share();
    }
  }

  share() {
    //调起分享
    const urlRoot = prefect.getLocationRoot();
    let {identifier, title, skuName, skuIcon, mystic} = this.props;
    if (mystic === 'true') {
      skuName = HONGBAO_MYSTIC;
      skuIcon = MYSTIC_GIFT;
    }
    walletApi.share({
      url: `${urlRoot}unpack/${identifier}`,
      title: title || HONGBAO_TITLE,
      desc: skuName,
      imgUrl: skuIcon,
      channel: 'WX',
      debug: true,
      callback: (status) => {
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

  onClose(e) {
    this.setState({
      visible: false
    });
    //回到首页
    this.context.router.replace('/');
  }

  closeShareGuide() {
    this.setState({
      weixinGuide: false
    });
  }

  render() {
    const {success, visible, weixinGuide} = this.state;
    if (success) {
      return (
        <div>
          <Modal
            visible={visible}
            className="hb-modal"
            bodyStyle={{height: '32rem'}}
            animation
            maskAnimation
          >
            <div className="hb-ellipse-arc-mask">
              <div className="hb-ellipse-arc-flat flex-items-middle flex-items-center flex">
                <div>
                  <h2 className="h1">红包已包好</h2>
                  <h4>实物和现金红包</h4>
                </div>
              </div>
              <div className="hb-btn-circle flex-items-middle flex-items-center" onTouchTap={this.sponsor}>发红包</div>
            </div>
          </Modal>
          {weixinGuide ? (
            <div className="hb-mask weixin-share-guide">
              <img onTouchTap={this.closeShareGuide} src={weixinShareGuide} className="img-fluid" alt=""/>
            </div>
          ) : null}
        </div>
      );
    }

    //支付失败的情况
    if (visible) {
      const footer = (
        <div className="text-center">
          <button className="btn btn-secondary" onClick={this.onClose}>
            确认
          </button>
        </div>
      );

      return (
        <Modal
          visible={visible}
          style={{width: '70%'}}
          bodyStyle={{height: '5rem'}}
          onClose={this.onClose}
          title="支付结果"
          footer={footer}
          animation
          maskAnimation
        >
          <div className="text-center">支付失败</div>
        </Modal>
      );
    }

    return null;
  }
}

Initiate.propTypes = {
  skuName: PropTypes.string,
  title: PropTypes.string,
  identifier: PropTypes.string,
  status: PropTypes.string,
  skuIcon: PropTypes.string,
  mystic: PropTypes.string
};

Initiate.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default Initiate;
