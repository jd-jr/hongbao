import 'isomorphic-fetch';
import assign from 'lodash/assign';
import {URL_ROOT, JD_LOGIN_URL, QB_LOGIN_URL} from '../config';
import perfect from '../utils/perfect';
import {getSessionStorage} from '../utils/sessionStorage';
// 定义 fetch 默认选项， 看 https://github.com/github/fetch
const defaultOptions = {
  method: 'post',
  credentials: 'include', //设置该属性可以把 cookie 信息传到后台
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json; charset=utf-8',
    'x-requested-with': 'XMLHttpRequest'
  }
};

function checkStatus(response) {
  const status = response.status;
  if (status >= 200 && status < 300) {
    return response;
  }
  let error = new Error(response.statusText);
  error.response = response;
  error.errorCode = status;
  throw error;
}

/**
 * 封装 fetch
 * 根据业务需求，还可以在出错的地方处理相应的功能
 * @param url
 * @param body //往后台传递的 json 参数
 * @param options // 可选参数项
 * @param loginVerify // 是否在该方法中校验登录
 * @returns {Promise.<TResult>}
 */
function callApi({url, body = {}, options, loginVerify = true}) {
  if (!url) {
    let error = new Error('请传入 url');
    error.errorCode = 0;
    return Promise.reject(error);
  }

  let clientInfo = getSessionStorage('clientInfo');
  clientInfo = perfect.parseJSON(clientInfo) || {};

  const protocol = location.protocol;
  let fullUrl;
  if (url.indexOf('http') === 0) {
    fullUrl = url;
  } else {
    fullUrl = (url.indexOf(URL_ROOT) === -1) ? protocol + URL_ROOT + url : protocol + url;
  }

  let _options = assign({}, defaultOptions, options);
  let _body = assign({}, {auth: clientInfo.auth}, body);
  _options.body = perfect.stringifyJSON(_body);

  return fetch(fullUrl, _options)
    .then(checkStatus)
    .then(response =>
      response.json().then(json => ({json, response}))
    ).then(({json, response}) => {
      //未登录
      if (response.ok && json.code === 'RBF100300') {
        if (loginVerify) {
          let activeUrl = location.href;
          if (activeUrl.indexOf('?') !== -1) {
            activeUrl += '&from=login';
          } else {
            activeUrl += '?from=login';
          }
          activeUrl = encodeURIComponent(activeUrl);
          location.href = JD_LOGIN_URL + encodeURIComponent(QB_LOGIN_URL + activeUrl);
        }
        let error = new Error(json.msg);
        error.errorCode = json.code;
        return Promise.reject(error);
      } else if (!response.ok || json.code !== 'RB000000') {
        //if (!response.ok) {
        // 根据后台实际返回数据来定义错误格式
        let error = new Error(json.msg || '获取数据出错');
        error.json = json;
        error.errorCode = json.code;
        return Promise.reject(error, json);
      }

      return {json, response};
    }).catch((error) => {
      return Promise.reject(error);
    });
}

export default callApi;
