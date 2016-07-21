import React, {Component, PropTypes} from 'react';
import Modal from 'reactjs-modal';
import prefect from '../../utils/perfect';
import walletApi from 'jd-wallet-sdk';
import deviceEnv from 'jd-wallet-sdk/lib/utils/device-env';
import {HONGBAO_TITLE, HONGBAO_DESC} from '../../constants/common';
import weixinShareGuide from '../../../images/weixin-share-guide.png';
import {MYSTIC_GIFT} from '../../config';
import callApi from '../../fetch';
import perfect from '../../utils/perfect';

class Initiate extends Component {
  constructor(props) {
    super(props);
    let {status} = this.props;
    this.state = {
      success: status === 'true',
      visible: true,
      weixinGuide: false
    };

    this.sponsor = this.sponsor.bind(this);
    this.onClose = this.onClose.bind(this);
    this.closeShareGuide = this.closeShareGuide.bind(this);
    this.closeHongbao = this.closeHongbao.bind(this);

    //设置分享图片
    if (deviceEnv.inJdWallet) {
      walletApi.shareIconURL(MYSTIC_GIFT, 'hongbao');
    }
    //判断是否再次激活成功
    this.againActivate = false;
    //微信授权
    this.intervalId;
  }

  componentWillMount() {
    const {hongbaoExpired, identifier, indexActions} = this.props;
    if (hongbaoExpired) { // 再次激活
      const accountType = perfect.getAccountType();
      const thirdAccId = perfect.getThirdAccId();
      const url = 'activation';
      const body = {
        identifier,
        thirdAccId,
        accountType
      };

      callApi({url, body, needAuth: true}).then(
        ({json, response}) => {
          this.againActivate = true;
        },
        (error) => {
          this.againActivate = false;
          if (error.errorCode !== 'RBF100202') {
            indexActions.setErrorMessage(error.message);
          }
        }
      );
    }
  }

  //发红包
  sponsor() {
    const {hongbaoExpired} = this.props;
    // 如果再次激活失败，则返回
    if (hongbaoExpired && this.againActivate === false) {
      return;
    }

    if (deviceEnv.inWx) {
      this.setState({
        weixinGuide: true
      });
      this.intervalId = setInterval(() => {
        if (window.wx && walletApi.signatureStatus()) {
          window.wx.showOptionMenu();
          this.share();
          clearInterval(this.intervalId);
        }
      }, 50);

    } else if (deviceEnv.inJdWallet) {
      this.share();
    }

    //埋点
    perfect.setBuriedPoint('hongbao_sponsor');
  }

  share() {
    //调起分享
    const urlRoot = prefect.getLocationRoot();
    let {identifier, title, skuName} = this.props;

    walletApi.share({
      url: `${urlRoot}authorize/${identifier}`,
      title: title || HONGBAO_TITLE,
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
          this.context.router.replace('/my?type=sponsor');
        }
      }
    });
  }

  //关闭错误提示信息
  onClose(e) {
    this.setState({
      visible: false
    });
    //回到首页
    this.context.router.replace('/');
  }

  //微信中关闭提示
  closeShareGuide() {
    this.setState({
      weixinGuide: false
    });
  }

  //关闭发送红包
  closeHongbao(e) {
    //防点透处理
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.preventDefault();
    e.nativeEvent.stopPropagation();
    setTimeout(() => {
      this.props.closeHongbao();
    }, 100);
  }

  render() {
    const {success, visible, weixinGuide} = this.state;
    let {skuName, skuIcon, closable} = this.props;
    if (success) {
      return (
        <div>
          <Modal
            visible={visible}
            className="hb-modal"
            bodyStyle={{height: '28rem'}}
            animation
            maskAnimation
          >
            <div className="hb-ellipse-arc-mask">
              {closable ? <span className="hb-btn-close" onTouchTap={this.closeHongbao}>+</span> : null}
              <div className="hb-ellipse-arc-flat flex-items-middle flex-items-center flex">
                <div style={{width: '100%', marginTop: '-15px'}}>
                  <h2 className="h1">红包已包好</h2>
                  <h4>京东红包</h4>
                  <div className="hb-product-wrap row">
                    <div className="col-7 p-r-0">
                      <img className="img-circle img-thumbnail hb-figure" src={skuIcon} alt=""/>
                    </div>
                    <div className="col-17 text-truncate-2 product-name">{skuName}</div>
                  </div>
                </div>
              </div>
              <div className="hb-btn-circle flex-items-middle flex-items-center font-weight-bold"
                   onTouchTap={this.sponsor}>发红包
              </div>
              <p className="text-center hb-logo-pos">
                <i className="hb-logo"></i>
              </p>
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
          <button className="btn btn-secondary" onTouchTap={this.onClose}>
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
  closable: PropTypes.bool,
  closeHongbao: PropTypes.func,
  hongbaoExpired: PropTypes.bool,
  indexActions: PropTypes.object,
};

Initiate.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default Initiate;
