import {WEIXIN_AUTHORIZE} from '../config';

const routeSetting = {
  //进入一个新的路由触发的事件
  enterHandler(key) {
    const redirectUri = encodeURIComponent(location.href);
    console.info(`${WEIXIN_AUTHORIZE}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_userinfo&state=weixin#wechat_redirect`);
    document.location.href = `${WEIXIN_AUTHORIZE}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_userinfo&state=weixin#wechat_redirect`
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

