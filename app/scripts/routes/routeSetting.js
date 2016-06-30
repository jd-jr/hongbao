import deviceEnv from 'jd-wallet-sdk/lib/utils/device-env';
import {WEIXIN_AUTHORIZE, REDIRECT_URI} from '../config';
import perfect from '../utils/perfect';
import {setSessionStorage} from '../utils/sessionStorage';

const routeSetting = {
  //进入一个新的路由触发的事件
  enterHandler(key) {
    const params = perfect.getLocationParams() || {};
    const {thirdAccId, accountType} = params;
    //如果在微信端，并且没有返回 accountId，需要微信授权
    if (deviceEnv.inWx) {
      if (thirdAccId && accountType) {
        setSessionStorage('thirdAccId', thirdAccId);
        setSessionStorage('accountType', accountType);
      } else { //授权
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

