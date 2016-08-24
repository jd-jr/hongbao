## 帮助文档

测试
oes2kw1U2d1IpBwRbiIucIS6WWe0

//设置这个，可以在浏览器中测试
sessionStorage.setItem('thirdAccId', 'oes2kw5y2ldnplZA1ovDw6wAxV0g');

//最新的
sessionStorage.setItem('thirdAccId', 'otEnCjvzbHr98hVnBL87DinhvKZ8');


联合登录，线上环境
https://plogin.m.jd.com/user/login.action?appid=100&returnurl=https%3A%2F%2Fm.jdpay.com%2Fwallet%2Flogin%2Fsid%3FsystemId%3DRBS%26toUrl%3Dhttps%253A%252F%252Fstatic.jdpay.com%252Fm-hongbao%252F%253Ffrom%253Dlogin

联合登录，测试环境
http://plogin.m.jd.com/user/login.action?appid=100&returnurl=http%3A%2F%2Fm.jdpay.com%2Fwallet%2Flogin%2Fsid%3FsystemId%3DRBS%26toUrl%3Dhttp%253A%252F%252Fhongbao.jdpay.com%253A8083%252Fm-hongbao%252Ffrom%253Dlogin

微信授权,测试环境

https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx70b5cd13e1f6b778&redirect_uri=http%3A%2F%2Frmk.jdpay.com%3A8011%2Fwebchat%2Fahthorize%3FrequestNo%3D155dce595619c28%26skip_url%3Dhttp%253A%252F%252Fhongbao.jdpay.com%253A8083%252Fm-hongbao%252Funpack%252Fd0b6805449b9dac9&response_type=code&scope=snsapi_base&state=weixin#wechat_redirect

微信授权，生产环境
https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx7941145208535b53&redirect_uri=https%3A%2F%2Fm.jdpay.com%2Fwebchat%2Fahthorize%3FrequestNo%3D155dce595619c28%26skip_url%3Dhttps%253A%252F%252Fstatic.jdpay.com%252Fm-hongbao%252Funpack%252Fd0b6805449b9dac9&response_type=code&scope=snsapi_base&state=weixin#wechat_redirect

抢红包授权,生产环境

https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx7941145208535b53&redirect_uri=https%3A%2F%2Fm.jdpay.com%2Fwebchat%2Fahthorize%3FrequestNo%3D155dce595619c28%26skip_url%3Dhttps%253A%252F%252Fstatic.jdpay.com%252Fm-hongbao%252Funpack%252Fd0b6805449b9dac9&response_type=code&scope=snsapi_base&state=weixin#wechat_redirect


钱包登录测试账号
hyc2017
123qwe


jd 商城 app 分享接口

http://192.168.144.123/wiki/index.php?title=M%E9%A1%B5%E5%86%85%E5%88%86%E4%BA%AB%E8%B0%83%E7%94%A8

分享代码

jdShare: function (opts) {
    try {
        if (!isIos) {  //安卓
            // 仅当 shareHelper对象存在时才能下发分享配置，更老版本不支持；未来如果该对象删除了也不出错
            if (window.shareHelper) {
                // jdApp 5.0版本新增方法
                if (typeof shareHelper.initShare === 'function') {
                    /**
                     * channel 参数可设置，配置后，分享面板仅出现配置过的项目; 如果为空，则显示默认全部
                     */
                    shareHelper.initShare(JSON.stringify({
                        "title": opts.title,
                        "content": opts.desc,
                        "shareUrl": opts.link,
                        "iconUrl": opts.imgUrl,
                        "shareActionType": "S",
                        "channel": "",
                        "callback": "N",
                        "eventId": ""
                    }));
   }
                else if (typeof shareHelper.setShareInfo === 'function') {
                    shareHelper.setShareInfo(opts.title, opts.desc, opts.link, opts.imgUrl)
                }
            }
        } else if (isIos) {
            var link;
            // jdApp 5.0及以上版本
            if (isJdAppGt500) {
                jsonObj = {
                    category: "jump",
                    des: "share",
                    type: "111",
                    title: opts.title,
                    content: opts.desc,
                    shareUrl: opts.link,
                    //分享的图片url，自定义， V 5.0 之前，使用该字段下发分享icon url
                    imageUrl: opts.imgUrl,
                    //分享的图片url，自定义，V 5.0 之后，使用该字段下发分享 icon url
                    iconUrl: opts.imgUrl,
                    channel: "",
                    isCallBack: "N",
                    shareActionType: "S"
     }
                link = 'openApp.jdmobile://virtual?params=' + JSON.stringify(jsonObj);
            } else {
                // 包括 jdApp5.0以下，以及非 jdApp
                link = 'openapp.jdmobile://communication?params={' +
                    '"action":"syncShareData",' +
                    '"title":"' + opts.title + '",' +
                    '"content":"' + opts.desc + '",' +
                    '"shareUrl":"' + opts.link + '",' +
                    '"iconUrl":"' + opts.imgUrl + '",' +
                    '"isCallBack":"N"' +
                    '}';
            }
            location.href = link;
        }

    } catch (e) {
    }
},


微信缓存的处理

https://segmentfault.com/q/1010000002599890
