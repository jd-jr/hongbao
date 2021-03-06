import deviceEnv from 'jd-wallet-sdk/lib/utils/device-env';
import {getSessionStorage} from '../utils/sessionStorage';
import {JD_LOGIN_URL, QB_LOGIN_URL} from '../config';

const win = window;
const doc = document;

const docEl = doc.documentElement;
const resizeEvt = 'orientationchange' in win ? 'orientationchange' : 'resize';

// 京东红包 utils 函数
const perfect = {
  adjustFontSize () {
    function recalc() {
      let clientWidth = docEl.clientWidth;
      if (!clientWidth) {
        return;
      }
      if (clientWidth > 600) {
        clientWidth = 600;
      }
      docEl.style.fontSize = `${10 * (clientWidth / 375)}px`;
    }

    if (doc.addEventListener) {
      win.addEventListener(resizeEvt, recalc, false);
      doc.addEventListener('DOMContentLoaded', recalc, false);
    }
  },

  /**
   * 获得地址栏传递参数
   * @returns {null}
   */
  getLocationParams() {
    let search = location.search;
    if (search.length > 1) {
      let params = {};
      search = search.substring(1);
      search.split('&').forEach((item) => {
        let tempParam = item.split('=');
        params[tempParam[0]] = tempParam[1] === '' ? null : decodeURIComponent(tempParam[1]);
      });
      return params;
    }
    return null;
  },

  /**
   * 返回 location.origin, 例如： http://duobao.jdpay.com:8082
   * @returns {string}
   */
  getLocationOrigin () {
    return location.origin;
  },

  /**
   * 返回根路径，例如 http://duobao.jdpay.com:8082/m-duobao/
   * @returns {*}
   */
  getLocationRoot () {
    const pathname = location.pathname;
    const origin = location.origin;
    if (process.env.NODE_ENV !== 'production') {
      return origin + '/';
    }
    const root = pathname.match(/\/[a-zA-Z0-9-_]+\//)[0];
    return origin + root;
  },

  /**
   * 返回上下文路径，例如 /m-duobao/
   * @returns {*}
   */
  getLocationContext () {
    return location.pathname.match(/\/[a-zA-Z0-9-_]+\//)[0];
  },

  // 格式化 json 数据
  parseJSON (str) {
    if (!str) {
      return null;
    }
    let json;
    try {
      json = JSON.parse(str);
    } catch (e) {
      json = null;
      console.info(e);
    }
    return json;
  },

  // 把 json 数据转换为字符串
  stringifyJSON (json) {
    let str;
    try {
      str = JSON.stringify(json);
    } catch (e) {
      str = null;
      console.info(e);
    }
    return str;
  },

  /**
   * 时间格式转换 time ms
   * @param time
   * @param showMs 是否显示毫秒
   * @param showYear 是否显示年
   * @returns {*}
   */
  /*eslint-disable prefer-template*/
  formatDate ({time, showMs = false, showYear = false}) {
    if (!time) {
      return '';
    }
    let date = new Date(time);
    // 在 ios 下需要显式的转换为字符串
    if (date.toString() === 'Invalid Date') {
      date = this.createDate(time);
      if (date.toString() === 'Invalid Date') {
        return '';
      }
    }
    const H = date.getHours() <= 9 ? '0' + date.getHours() : date.getHours();
    const M = date.getMinutes() <= 9 ? '0' + date.getMinutes() : date.getMinutes();
    const S = date.getSeconds() <= 9 ? '0' + date.getSeconds() : date.getSeconds();
    let MS = date.getMilliseconds();
    if (MS <= 9) {
      MS = '00' + MS;
    } else if (MS <= 99) {
      MS = '0' + MS;
    }

    const hms = showMs ? ` ${H}:${M}:${S}.${MS}` : ` ${H}:${M}:${S}`;
    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    month = month <= 9 ? '0' + month : month;

    let day = date.getDate();
    day = day <= 9 ? '0' + day : day;

    return (showYear ? year + '-' : '') + month + '-' + day + hms;
  },

  /**
   * 标准创建时间格式 new Date(y, m, d, h, M, s, ms)
   * 如果对于时间格式比较复杂的情况，可参考 Moment 库 http://momentjs.com/
   *
   * @param input 支持 yyyy-MM-dd HH:mm:ss.SSS 或 yyyy-MM-dd HH:mm:ss:SSS 或 yyyy/MM/dd HH:mm:ss.SSS
   * 2016-06-02 13:01:50.333  2016-06-02 13:01:50:333 2016/06/02 13:01:50:333
   * @returns {Date}
   */
  createDate (input) {
    if (!input || typeof input !== 'string') {
      return null;
    }
    let y = 0, m = 0, d = 0, h = 0, M = 0, s = 0, ms = 0;
    const inputs = input.replace(/\//g, '-').split(' ');
    if (inputs.length > 0) {
      const ymd = inputs[0].split('-');
      y = Number(ymd[0]);
      m = Number(ymd[1]) - 1;
      d = Number(ymd[2]);
    }
    if (inputs.length === 2) {
      const hms = inputs[1].split(':');
      h = Number(hms[0]);
      M = Number(hms[1]);
      //格式 2016-06-02 13:01:50.333
      const sms = hms[2].split('.');
      if (sms.length === 2) {
        s = Number(sms[0]);
        ms = Number(sms[1]);
      } else {
        s = Number(hms[2]);
      }
      // 格式 2016-06-02 13:01:50:333
      if (hms[3]) {
        ms = hms[3];
      }
    }
    const date = new Date(y, m, d, h, M, s, ms);
    return date;
  },

  /**
   * 格式化时间
   * @param time 毫秒
   */
  formatMillisecond(millisecond) {
    let hours;
    let minute;
    let second;
    second = Math.ceil(millisecond / 1000);
    if (second < 60) {
      return `${second}秒钟`;
    }
    minute = Math.ceil(second / 60);
    if (minute < 60) {
      return `${minute}分钟`;
    }
    hours = Math.round(minute / 60);
    return `${hours}小时`;
  },

  /**
   * 如果图片没有设置 http 或 https，需要动态添加
   * @param url
   * @returns {*}
   */
  setUrlProtocol(url) {
    if (url.indexOf('http') === 0) {
      return url;
    }
    return location.protocol + url;
  },

  /**
   * 判断样式在浏览器中是否支持
   * @param styleProp
   * @returns {boolean}
   */
  styleSupport(styleProp) {
    const prefix = ['webkit', 'moz', 'ms'];
    const $el = document.createElement('div');
    const styleText = $el.style;
    if (styleText[styleProp] !== undefined) {
      return true;
    }

    for (let i = 0; i < 3; i++) {
      const _styleProp = prefix[i] + styleProp[0].toUpperCase() + styleProp.substring(1);
      if (styleText[_styleProp] !== undefined) {
        return true;
      }
    }
    return false;
  },

  /**
   * 返回 requestNo
   * 算法：前面部分为转换后十六进制的时间戳毫秒值，后面部分为转换后十六进制的随机值
   */
  getRequestNo() {
    const time = new Date().getTime().toString(16);
    const random = Math.ceil(Math.random() * 100000).toString(16);
    return time + random;
  },

  /**
   * 获取账户 id
   * @returns {*}
   */
  getThirdAccId() {
    const thirdAccId = getSessionStorage('thirdAccId');
    if (thirdAccId) {
      return thirdAccId;
    }
    return null;
  },

  /**
   * 获取账户类型
   * @returns {*}
   */
  getAccountType() {
    const accountType = getSessionStorage('accountType');
    if (accountType) {
      return accountType;
    } else if (deviceEnv.inJdWallet) {
      return 'WALLET';
    }
    return 'WECHAT';
  },

  /**
   * 设置腾讯埋点
   */
  setBuriedPoint(enventId, params) {
    if (window.MtaH5) {
      if (params) {
        MtaH5.clickStat(enventId);
      } else {
        MtaH5.clickStat(enventId, params)
      }

    }
  },

  /**
   * 联合登录
   * @param url 联合后返回的地址
   */
  unionLogin(url) {
    url = encodeURIComponent(url);
    location.href = JD_LOGIN_URL + encodeURIComponent(QB_LOGIN_URL + url);
  },

  /**
   * 判断是否为数字
   * @param value
   * @param allowStr 是否允许验证字符串
   * @returns {Boolean}
   */
  isNumber(value, allowStr = true) {
    return (typeof value === 'number' && isFinite(value))
      || (allowStr === false ? false : parseFloat(value) == value);
  },

  /**
   * 压缩图片
   * @param img
   * @returns {string}
   */
  compress(img) {
    const canvas = document.createElement('canvas'),
      ctx = canvas.getContext('2d');

    canvas.width = img.width;
    canvas.height = img.height;

    //利用canvas进行绘图
    ctx.drawImage(img, 0, 0, img.width, img.height);
    //将原来图片的质量压缩到原先的0.2倍。
    const data = canvas.toDataURL('image/jpeg', 0.2); //data url的形式

    return data;
  }
};

export default perfect;

