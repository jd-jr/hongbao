// 正式环境
export const URL_ROOT = '//hongbao-api.jdpay.com/redbag/';

export const JD_LOGIN_URL = 'https://plogin.m.jd.com/user/login.action?appid=100&returnurl='; //联合登录 jd url
export const QB_LOGIN_URL = 'https://m.jdpay.com/wallet/login/sid?systemId=RBS&toUrl='; //联合登录m 站 url

// 微信授权 url
/**
 * 钱包公众号 wx7941145208535b53
 * 测试公众号 wx70b5cd13e1f6b778
 * @type {string}
 */
export const WEIXIN_AUTHORIZE = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx7941145208535b53';

// 微信授权后台 url
export const REDIRECT_URI = 'https://m.jdpay.com/webchat/ahthorize?';

//礼物图片链接
export const MYSTIC_GIFT = 'https://img11.360buyimg.com/wympay/jfs/t2722/281/3545161434/12132/3ca14378/57908f2aNd28e391d.png';

//默认头像
export const HEAD_PIC = 'https://static.jdpay.com/m-hongbao/images/headpic.png';
