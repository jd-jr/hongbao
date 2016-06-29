
//FIXME 测试数据
const accountIds = [
  'otEnCjuXgorSu0yCkWLZC4cuh5D0',
  'otEnCjrz_3PMW-DZx_s2VnoKx6Cc',
  'otEnCjmW191iFeVOb5Ft2uZXBeMo',
  'otEnCju_FqhkHHdoCSvEF0y8PZ5I',
  'otEnCjml8gOGmIfUBCX73kwHOOPY',
  'otEnCjl9xilxOMUWliE9651mUGg8',
  'otEnCjr7J1-9mhlGUyxQVtNxBGL0',
  'otEnCjo1dD0xg37IJkONGYUKRAq4',
  'otEnCjuG5nFAJt9q-8NmQx-Op7jc',
  'otEnCjmfmUsNJnSvLQTB2B1K_dgI'];

const routeSetting = {
  //进入一个新的路由触发的事件
  enterHandler(key) {
    const currentUrl = location.href;
    accountIds[Math.floor(Math.random() * 10)];
    // id 表示红包 id
    location.href = `${currentUrl}/${accountIds[Math.floor(Math.random() * 10)]}`;
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

