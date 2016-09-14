import React, {Component, PropTypes} from 'react';
import Modal from 'reactjs-modal';
import prefect from '../../utils/perfect';
import walletApi from 'jd-wallet-sdk';
import deviceEnv from 'jd-wallet-sdk/lib/utils/device-env';
import {HONGBAO_TITLE, HONGBAO_DESC} from '../../constants/common';
import weixinShareGuide from '../../../images/weixin-share-guide.png';
import {SHARE_ICON_URL} from '../../constants/common';
import perfect from '../../utils/perfect';

// 发起红包组件
class Initiate extends Component {
  constructor(props) {
    super(props);
    let {status} = this.props;
    this.state = {
      success: status === 'true',
      weixinGuide: false
    };

    this.sponsor = this.sponsor.bind(this);
    this.onClose = this.onClose.bind(this);
    this.closeShareGuide = this.closeShareGuide.bind(this);
    this.closeHongbao = this.closeHongbao.bind(this);

    //设置分享图片
    if (deviceEnv.inJdWallet) {
      walletApi.shareIconURL(SHARE_ICON_URL, 'hongbao');
    }
    //微信授权
    this.intervalId;

    this.iphone4 = window.screen.height <= 480;
  }

  componentWillMount() {
    const {success} = this.state;
    let {indexActions, setModalCloseCallback} = this.props;
    if (success) {
      //支付失败的情况
      indexActions.setErrorMessage('支付失败');
      setModalCloseCallback(()=> {
        //回到首页
        this.context.router.replace('/');
      });
    }
  }

  componentDidMount() {
    if (deviceEnv.inWx) {
      this.intervalId = setInterval(() => {
        if (window.wx && walletApi.signatureStatus()) {
          window.wx.showOptionMenu();
          this.share();
          clearInterval(this.intervalId);
        }
      }, 50);
    }
  }

  //发红包
  sponsor() {
    if (deviceEnv.inWx) {
      this.setState({
        weixinGuide: true
      });
    } else {
      this.share();
    }

    //埋点
    perfect.setBuriedPoint('hongbao_sponsor');
  }

  share() {
    //调起分享
    const urlRoot = prefect.getLocationRoot();
    let {identifier, title} = this.props;

    if (deviceEnv.inJdWallet || deviceEnv.inWx) {
      walletApi.share({
        url: `${urlRoot}authorize/${identifier}`,
        title: title || HONGBAO_TITLE,
        desc: HONGBAO_DESC,
        imgUrl: SHARE_ICON_URL,
        channel: 'WX',
        debug: Boolean(window.eruda),
        callback: (status) => {
          if (deviceEnv.inWx) {
            //回到领取页面
            this.context.router.replace('/my?type=sponsor');
          }
          if (status === 'SUCCESS') {
            //回到领取页面
            this.context.router.replace('/my?type=sponsor');
          }
        }
      });
    } else if (deviceEnv.inJdApp) { //设置在 jd app 分享
      // 设置分享回调函数
      window.jdappShareRes = (result) => {
        /**
         * 返回结果：
         * obj.shareResult：0，成功；1：失败；2，取消；
         * obj.shareChannel：weixin：微信好友和微信朋友圈；qq：QQ好友；qzone：QQ空间；weibo：新浪微博；
         */
        if (result && result.shareResult === 0) {
          //回到领取页面
          this.context.router.replace('/my?type=sponsor');
        }
      };

      if (deviceEnv.inAndroid) {
        //先初始化分享参数
        const shareParms = {
          shareUrl: `${urlRoot}authorize/${identifier}`, //分享的url
          iconUrl: SHARE_ICON_URL,
          title: title || HONGBAO_TITLE,
          content: HONGBAO_DESC,
          shareActionType: 'P',
          channel: 'Wxfriends,Wxmoments'
        };
        try {
          /* global shareHelper */
          shareHelper.initShare(JSON.stringify(shareParms));
        } catch (e) {
          console.info(e);
        }
      } else if (deviceEnv.inIos) {
        //在 jd app 5.0 以上版本
        const shareParms = {
          category: 'jump',
          des: 'share', //系统固定值 share
          type: '111', //系统固定值 111
          title: title || HONGBAO_TITLE,
          content: HONGBAO_DESC,
          //分享的图片url，自定义， V 5.0 之前，使用该字段下发分享icon url
          shareUrl: `${urlRoot}authorize/${identifier}`,
          //分享的图片url，自定义，V 5.0 之后，使用该字段下发分享 icon url
          imageUrl: SHARE_ICON_URL,
          iconUrl: SHARE_ICON_URL,
          channel: 'Wxfriends,Wxmoments',
          isCallBack: 'N',
          shareActionType: 'P'
        };

        location.href = `openApp.jdmobile://virtual?params=${JSON.stringify(shareParms)}`;
      }
    }

    //漏斗埋点
    perfect.setBuriedPoint('quanbufasonghon-1', {'hbsendbtn1':'true'});
    perfect.setBuriedPoint('ercifasonghongb', {'hbsendbtn2':'true'});
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
    const {success, weixinGuide} = this.state;
    let {skuName, skuIcon} = this.props;
    if (success) {
      return (
        <div>
          <Modal
            visible
            className="hb-modal"
            bodyStyle={{height: '28rem'}}
            animation
            maskAnimation
          >
            <div className="hb-ellipse-arc-mask">
              <span className="hb-btn-close" onTouchTap={this.closeHongbao}>+</span>
              <div className="hb-ellipse-arc-flat flex-items-middle flex-items-center flex">
                <div style={{width: '100%', marginTop: '-15px'}}>
                  <h2 className="h1">红包已包好</h2>
                  <h4>京东红包</h4>
                  <div className="hb-product-wrap row">
                    <div className={`${this.iphone4 ? 'col-5' : 'col-4'} p-r-0 p-l-0-3 text-left`}>
                      <img className="img-circle img-thumbnail hb-figure" src={skuIcon} alt=""/>
                    </div>
                    <div className="col-19 text-truncate-2 product-name">{skuName}</div>
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
    return null;
  }
}

Initiate.propTypes = {
  skuName: PropTypes.string,
  title: PropTypes.string,
  identifier: PropTypes.string,
  status: PropTypes.string,
  skuIcon: PropTypes.string,
  closeHongbao: PropTypes.func,
  indexActions: PropTypes.object,
  setModalCloseCallback: PropTypes.func,
};

Initiate.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default Initiate;
