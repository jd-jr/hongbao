import deviceEnv from 'jd-wallet-sdk/lib/utils/device-env';
import weixin from 'jd-wallet-sdk/lib/weixin';
import walletApi from 'jd-wallet-sdk';
import {WEIXIN_AUTHORIZE, REDIRECT_URI} from '../config';
import perfect from '../utils/perfect';
import {setSessionStorage, getSessionStorage} from '../utils/sessionStorage';

const win = window;

//第一次进入
let firstEnter = true;

//微信 js sdk 是否验签
let verifySignature = false;

const routeSetting = {
  titles: {
    home: '京东红包',
    initiate: '京东红包',
    productList: '选择礼物',
    product: '礼物详情',
    productView: '礼物详情',
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
    help: '帮助',
    strategy: '红包攻略'
  },

  overflowYHidden: ['detail', 'my', 'productList'],

  //埋点
  buriedPoint: {
    home: 'hongbao_home_enter',
    productList: 'hongbao_product_enter',
    product: 'hongbao_product_detail_enter',
    authorize: 'hangbao_prepare_unpack',
  },

  shareFilter: ['home'],

  //设置 Title
  setTitle(key) {
    //设置标题
    walletApi.setTitle(this.titles[key] || '');
  },

  //设置埋点
  setBuriedPoint(key) {
    perfect.setBuriedPoint(this.buriedPoint[key]);
  },

  //微信分享
  weixinShare (key) {
  },

  //监听退出
  monitorExit() {
    const pathname = location.pathname;
    //如果再一次后退到抢红包页面，则直接退出
    if (pathname.indexOf('/authorize') !== -1 && getSessionStorage('goBack') === 'true') {
      setInterval(() => {
        if (window.wx) {
          window.wx.closeWindow();
        }
      });
      return;
    }
    //如果进入不是授权路由，则设置 goBack 为 true
    if (pathname.indexOf('/authorize') === -1) {
      setSessionStorage('goBack', 'true');
    }
  },

  //微信授权
  wxAuthorize (key) {
    //如果在微信端，并且没有返回 accountId，需要微信授权
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
  },

  //微信中隐藏分享菜单
  wxHideOptionMenu () {
    if (win.wx) {
      win.wx.hideOptionMenu();
    }
  },

  //微信中显示分享菜单
  wxShowOptionMenu () {
    if (win.wx) {
      win.wx.showOptionMenu();
    }
  },

  //设置分享菜单项目，只设置分享
  wxShowMenuItems () {
    if (win.wx) {
      win.wx.showMenuItems({
        menuList: ['menuItem:share:appMessage']
      });
    }
  },

  //设置 body 样式
  setBodyStyle (key) {
    const overflowY = this.overflowYHidden.indexOf(key) !== -1 ? 'hidden' : 'auto';
    document.body.style.overflowY = overflowY;
    document.documentElement.style.overflowY = overflowY;
  },

  //进入一个新的路由触发的事件
  enterHandler(key) {
    /*if (firstEnter && location.pathname === '/m-hongbao/my' && location.search === '?type=sponsor') {
      location.href = `${perfect.getLocationRoot()}my`;
    }
    firstEnter = false;*/

    if (deviceEnv.inWx) {
      //console.info(getSessionStorage('thirdAccId'));
      this.wxAuthorize(key);
      this.monitorExit();
      if (verifySignature) {
        //微信分享
        this.weixinShare(key);
        if (key === 'initiate' || key === 'test') {
          this.wxShowOptionMenu();
          this.wxShowMenuItems();
        } else {
          this.wxHideOptionMenu();
        }
      } else {
        //设置允许的权限
        const jsApiList = [
          'onMenuShareTimeline',
          'onMenuShareAppMessage',
          'onMenuShareQQ',
          'hideOptionMenu',
          'showOptionMenu',
          'hideMenuItems',
          'showMenuItems',
          'hideAllNonBaseMenuItem',
          'showAllNonBaseMenuItem',
          'closeWindow'];
        weixin.verifySignature({
          debug: Boolean(window.eruda),
          jsApiList,
          callback: () => {
            verifySignature = true;
            //微信分享
            this.weixinShare(key);
            if (key === 'initiate') {
              this.wxShowOptionMenu();
              this.wxShowMenuItems();
            } else {
              this.wxHideOptionMenu();
            }
          }
        });
      }
    }

    //设置 title
    this.setTitle(key);
    //设置埋点
    this.setBuriedPoint(key);

    //设置 body 样式
    this.setBodyStyle(key);
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

