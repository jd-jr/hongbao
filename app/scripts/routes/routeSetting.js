import deviceEnv from 'jd-wallet-sdk/lib/utils/device-env';
import walletApi from 'jd-wallet-sdk';
import {WEIXIN_AUTHORIZE, REDIRECT_URI} from '../config';
import perfect from '../utils/perfect';
import {setSessionStorage, getSessionStorage} from '../utils/sessionStorage';

const routeSetting = {
  titles: {
    home: '实物红包',
    productList: '选择商品',
    product: '商品详情',
    productView: '商品详情',
    initiate: '实物红包',
    unpack: '',
    detail: '红包详情',
    my: '实物红包',
    myaddress: '我的收货地址',
    addaddress: '新增地址',
    editaddress: '编辑地址',
    selectcity: '选择省市区',
    logistics: '物流详情',
  },

  //设置 Title
  setTitle(key) {
    //设置标题
    walletApi.setTitle(this.titles[key] || '');
  },

  //进入一个新的路由触发的事件
  enterHandler(key) {
    if (key === 'home' || key === 'unpack') {
      const params = perfect.getLocationParams() || {};
      const {thirdAccId, accountType} = params;
      const _thirdAccId = getSessionStorage('thirdAccId');
      const _accountType = getSessionStorage('accountType');

      //如果在微信端，并且没有返回 accountId，需要微信授权
      if (deviceEnv.inWx) {
        if (thirdAccId && accountType) {
          setSessionStorage('thirdAccId', thirdAccId);
          setSessionStorage('accountType', accountType);
        } else if (!_thirdAccId && !_accountType) {//授权
          /**
           * 例子
           * https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx70b5cd13e1f6b778&redirect_uri=URL&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect
           */
          let currentUrl = location.href;
          currentUrl = encodeURIComponent(currentUrl);
          const requestNo = perfect.getRequestNo();
          let redirectUri = `${REDIRECT_URI}?requestNo=${requestNo}&skip_url=${currentUrl}`;
          redirectUri = encodeURIComponent(redirectUri);
          //console.info(`${WEIXIN_AUTHORIZE}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_base&state=weixin#wechat_redirect`);
          document.location.href = `${WEIXIN_AUTHORIZE}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_base&state=state#wechat_redirect`
        }
      }
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

