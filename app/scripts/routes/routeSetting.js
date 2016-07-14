import deviceEnv from 'jd-wallet-sdk/lib/utils/device-env';
import walletApi from 'jd-wallet-sdk';
import {WEIXIN_AUTHORIZE, REDIRECT_URI} from '../config';
import perfect from '../utils/perfect';
import {setSessionStorage, getSessionStorage} from '../utils/sessionStorage';
import {HONGBAO_TITLE} from '../constants/common';
import {MYSTIC_GIFT} from '../config';
import prefect from '../utils/perfect';

const routeSetting = {
  titles: {
    home: '京东红包',
    initiate: '京东红包',
    productList: '选择商品',
    product: '商品详情',
    productView: '商品详情',
    authorize: '京东红包',
    unpack: '红包详情',
    detail: '红包详情',
    my: '京东红包',
    myaddress: '我的收货地址',
    addaddress: '新增地址',
    editaddress: '编辑地址',
    selectcity: '选择省市区',
    logistics: '物流详情',
    protocol: '服务协议',
    help: '帮助'
  },

  shareFilter: ['home'],
  //设置 Title
  setTitle(key) {
    //设置标题
    walletApi.setTitle(this.titles[key] || '');
  },

  //微信分享
  weixinShare (key) {
    //初始化微信分享
    /*walletApi.share({
      url: location.href,
      title: HONGBAO_TITLE,
      desc: '京东红包',
      imgUrl: MYSTIC_GIFT,
      channel: 'WX',
      debug: Boolean(window.eruda),
      callback: (status) => {
        if (status === 'SUCCESS') {
          this.setState({
            visible: false
          });
          //回到首页
          this.context.router.replace('/');
        }
      }
    });*/
  },

  //进入一个新的路由触发的事件
  enterHandler(key) {
    //如果在微信端，并且没有返回 accountId，需要微信授权
    if (deviceEnv.inWx) {
      const pathname = location.pathname;
      //如果再一次后退到抢红包页面，则直接退出
      if (pathname.indexOf('/authorize') !== -1 && getSessionStorage('goBack') === 'true') {
        window.history.go(-1);
      }

      //如果进入不是授权路由，则设置 goBack 为 true
      if (pathname.indexOf('/authorize') === -1) {
        setSessionStorage('goBack', 'true');
      }

      if (key === 'home' || key === 'authorize' || key === 'unpack') {
        const params = perfect.getLocationParams() || {};
        const {thirdAccId, accountType} = params;
        const _thirdAccId = getSessionStorage('thirdAccId');
        const _accountType = getSessionStorage('accountType');

        if (thirdAccId && accountType) {
          setSessionStorage('thirdAccId', thirdAccId);
          setSessionStorage('accountType', accountType);
        } else if (!_thirdAccId && !_accountType) {//授权
          /**
           * 例子
           * https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx70b5cd13e1f6b778&redirect_uri=URL&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect
           */
          const href = location.href;
          let currentUrl = key === 'authorize' ? href.replace('authorize', 'unpack') : href;
          currentUrl = encodeURIComponent(currentUrl);
          const requestNo = perfect.getRequestNo();
          let redirectUri = `${REDIRECT_URI}?requestNo=${requestNo}&skip_url=${currentUrl}`;
          redirectUri = encodeURIComponent(redirectUri);
          //console.info(`${WEIXIN_AUTHORIZE}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_base&state=weixin#wechat_redirect`);
          document.location.href = `${WEIXIN_AUTHORIZE}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_base&state=state#wechat_redirect`
        }
      }

      //微信分享
      this.weixinShare(key);
    }

    //设置 title
    this.setTitle(key);
  },

  // 离开一个路由触发的事件
  leaveHandler(key) {
  }
};

let enterHandler = routeSetting.enterHandler.bind(routeSetting);
let leaveHandler = routeSetting.leaveHandler.bind(routeSetting);

export default {
  enterHandler,
  leaveHandler
};

