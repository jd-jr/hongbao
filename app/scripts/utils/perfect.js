const win = window;
const doc = document;

const docEl = doc.documentElement;
const resizeEvt = 'orientationchange' in win ? 'orientationchange' : 'resize';

// 实物红包 utils 函数
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

  // 返回根路径
  getPathname () {
    return `${location.origin}/m-hongbao/`;
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
   * 标准创建时间,支持各种浏览器方式
   * new Date(y, m, d, h, M, s, ms)
   * @param input 支持 yyyy-MM-dd HH:mm:ss.SSS 或 yyyy-MM-dd HH:mm:ss:SSS 或者
   * yyyy/MM/dd HH:mm:ss.SSS
   * 2016-06-02 13:01:50.333  2016-06-02 13:01:50:333
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
  }
};

export default perfect;

