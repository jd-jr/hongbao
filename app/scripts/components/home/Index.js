import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import walletApi from 'jd-wallet-sdk';
import deviceEnv from 'jd-wallet-sdk/lib/utils/device-env';
import base64 from 'js-base64';
import BottomNav from '../BottomNav';
import Loading from '../../ui/Loading';
import callApi from '../../fetch';
import {HONGBAO_TITLE, SHOW_FOOT_DELAY} from '../../constants/common';
import perfect from '../../utils/perfect'
import Initiate from './Initiate';
import Guide from '../Guide';
import HelpFeedback from '../HelpFeedback';
import {setSessionStorage, getSessionStorage} from '../../utils/sessionStorage';
import {setLocalStorage, getLocalStorage} from '../../utils/localStorage';

const {Base64} = base64;

class Home extends Component {
  constructor(props) {
    super(props);
    let {detail} = props;
    if (detail) {
      detail = decodeURIComponent(detail);
      detail = Base64.decode(detail);
      detail = perfect.parseJSON(detail);
    }

    const {skuName, skuId, bizPrice, indexImg} = (detail || {});
    const {hongbaoInfo} = props;
    let giftNum = '';
    let title = '';
    if (hongbaoInfo) {
      giftNum = hongbaoInfo.giftNum;
      title = hongbaoInfo.title;
    }
    this.state = {
      title,
      bizPrice: bizPrice || 0,
      skuId,
      skuName,
      indexImg,
      giftNum,
      selecting: Boolean(!skuId),
      visible: false,
      payDataReady: false,
      loadingStatus: false,
      checked: true, //同意条款
      showFoot: false,
      giftTitle: '可发1个红包，送给你想送的人',
      guide: getLocalStorage('guide-sponsor-hb') !== 'true'
    };

    this.selectProduct = this.selectProduct.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.payBefore = this.payBefore.bind(this);
    this.handleChecked = this.handleChecked.bind(this);
    this.replaceProduct = this.replaceProduct.bind(this);
    this.closeHongbao = this.closeHongbao.bind(this);
    this.closeGuide = this.closeGuide.bind(this);
    this.clearMenu = this.clearMenu.bind(this);
    this.imgUrl = 'sponsor-hb.png';

    //是否是发红包页面
    this.isInitiate = location.href.indexOf('/initiate') !== -1;

    // 如果是发红包页面，设置后退直接返回到首页
    if (this.isInitiate) {
      walletApi.setGoBackListener(() => {
        setTimeout(() => {
          walletApi.deleteGoBackListener();
          this.context.router.push('/');
        }, 100);
        return 1;
      });
    }
  }

  componentWillMount() {
    document.body.scrollTop = 0;
    //延迟显示底部按钮，解决 IOS 下底部按钮设置 fixed 的问题
    setTimeout(() => {
      this.setState({
        showFoot: true
      });
    }, SHOW_FOOT_DELAY);

    const fromLogin = location.href.indexOf('from=login');
    if (fromLogin !== -1) {
      const title = getSessionStorage('hb_title');
      const giftNum = getSessionStorage('hb_giftNum');
      this.setState({
        title,
        giftNum
      }, () => {
        this.pay();
      });
    }

    /**
     * deviceInfo  Android
     {
      IPAddress1: '',
      UUID:'',
      appId:'',
      channelInfo: '',
      clientVersion: '',
      deviceId: '',
      deviceType: '',
      imei: '',
      latitude: '',
      longitude: '',
      macAddress: '',
      networkType: '',
      osPlateform: '',
      osVersion: '',
      resolution: '',
      startNo: '',
      terminalType: ''
     }

     IOS

     {
      IDFA: '',
      IPAddress1: '', //没有值
      OpenUDID: '',
      UUID:'',  //没有值
      appId:'',
      channelInfo: '',
      clientVersion: '',
      deviceType: '',
      latitude: '',
      longitude: '',
      networkType: '',
      osPlateform: '',
      osVersion: '',
      resolution: '',
      startNo: '',
      terminalType: ''
     }
     */
    walletApi.getFinanceInfo((info) => {
      info = perfect.parseJSON(info);
      this.deviceInfo = info.deviceInfo;
    });
  }

  componentWillUnmount() {
    // 如果不是从更换点击，则清空红包临时输入信息
    if (!this.fromReplace) {
      const {homeAction} = this.props;
      homeAction.clearHongbaoInfo();
    }
    if (this.isInitiate) {
      walletApi.deleteGoBackListener();
    }
  }

  handleChange(e, type) {
    const {indexActions} = this.props;
    const {bizPrice, giftNum, selecting} = this.state;
    let value = e.target.value;
    if (type === 'giftNum') {
      if (selecting) {
        indexActions.setToast('请先选择礼物');
        return;
      }
      if (value === '') {
        this.setState({
          giftNum: '',
          giftTitle: '可发1个红包，送给你想送的人'
        });
        return;
      }
      if (!/^\+?[1-9][0-9]*$/.test(value)) {
        return;
      }
      value = parseInt(value, 10);

      this.setState({
        giftTitle: value > 1 ? '未获得礼物的用户可得京东钱包补贴的现金' : '可发1个红包，送给你想送的人'
      });

      if (bizPrice <= 5000 && value > 10) {
        indexActions.setToast('礼物价格小于50元，红包个数不可超过10个');
        this.setState({
          giftNum: 10
        });
        return;
      }

      const limit = bizPrice <= 100 ? bizPrice - 1 : 100;
      if (value > limit) {
        indexActions.setToast(`红包个数不能超过${limit}个`);
        this.setState({
          giftNum: limit
        });
        return;
      }

      this.setState({
        value
      });
    } else if (type === 'title') {
      if (value.length > 25) {
        return;
      }
    }

    this.setState({
      [type]: value
    });
  }

  //焦点离开时
  handleBlur(type) {
    perfect.setBuriedPoint(type === 'title' ? 'hongbao_home_title' : 'hongbao_home_quantity');
  }

  handleChecked() {
    const {checked} = this.state;
    this.setState({
      checked: !checked
    });
  }

  //选择礼物
  selectProduct(e) {
    //防点透处理
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.preventDefault();
    e.nativeEvent.stopPropagation();

    if (!this.state.selecting) {
      return;
    }
    //埋点
    perfect.setBuriedPoint('hongbao_home_select_product');
    this.context.router.push('/product');
  }

  //提交前校验表单
  verify() {
    const {indexActions} = this.props;
    const {checked, giftNum, title, bizPrice, skuId} = this.state;
    if (!skuId) {
      indexActions.setToast('请选择礼物');
      return;
    }

    let limit = bizPrice <= 100 ? bizPrice - 1 : 100;
    if (giftNum === '') {
      indexActions.setToast('请输入红包个数');
      return;
    }

    if (bizPrice <= 5000 && giftNum > 10) {
      indexActions.setToast('礼物价格小于50元，红包个数不可超过10个');
      return;
    }

    if (giftNum > limit) {
      indexActions.setToast(`红包个数不能超过${limit}个`);
      return;
    }
    if (title.length > 25) {
      indexActions.setToast('红包标题最多输入25个字');
      return;
    }
    if (!checked) {
      indexActions.setToast('请勾选服务协议，谢谢您的合作');
      return;
    }
    return true;
  }

  payBefore(e) {
    e.nativeEvent.preventDefault();
    e.nativeEvent.stopPropagation();

    if (!this.verify()) {
      return;
    }

    const {setClientInfo} = this.props;
    setClientInfo((status) => {
      if (status) {
        this.pay();
      }
    });
  }

  //支付
  pay() {
    const {skuId, giftNum, title, loadingStatus} = this.state;
    if (loadingStatus) {
      return;
    }

    this.setState({
      loadingStatus: true
    });

    const {indexActions} = this.props;
    const accountType = perfect.getAccountType();
    const thirdAccId = perfect.getThirdAccId();
    const url = 'create';
    const body = {
      skuId,
      giftNum,
      title: title || HONGBAO_TITLE,
      accountType
    };

    if (!deviceEnv.inJdWallet) {
      body.thirdAccId = thirdAccId
    }

    // 红包 id
    let identifier;

    callApi({url, body, needAuth: true}).then(
      ({json, response}) => {
        identifier = json.data;
        const url = 'pay';
        let body = {
          identifier
        };
        if (deviceEnv.inJdWallet) {
          /**
           终端类型  type 传入 DTO1：pc 端 DTO2：移动 App DTO3： 移动浏览器端
           终端 ip ip
           终端 mac 地址 mac
           终端 imei imei
           终端 idfv idfv
           终端 adid adid
           操作系统 os   DTO1：Android DTO2：IOS DTO3： Window， DTO4: Mac，OSO5: Linux
           osVersion
           */
          const {IPAddress1, macAddress, imei, osPlateform, osVersion, IDFA} = this.deviceInfo;
          // 安卓的IMEI  ios的IDFV
          // adid：advertisingIdentifier，也是ios的一个标识
          body = {
            identifier,
            type: 'DTO2',
            ip: IPAddress1,
            mac: macAddress,
            imei,
            idfv: IDFA || imei,
            adid: undefined,
            os: osPlateform === 'android' ? 'DTO1' : 'DTO2',
            osVersion
          }
        }
        return callApi({url, body, needAuth: true});
      },
      (error) => {
        if (error.errorCode === 'RBF100300') {//未登录
          setSessionStorage('hb_title', title);
          setSessionStorage('hb_giftNum', giftNum);
        }
        return Promise.reject(error);
      }
    ).then(
      ({json, response}) => {
        const {data} = json;
        this.basePayOrderInfo = {...data};
        this.setState({
          payDataReady: true,
          loadingStatus: false
        }, () => {
          this.clearMenu();
          this.refs.h5PayForm.submit();
        });
      },
      (error) => {
        return Promise.reject(error);
      }
    ).catch((error) => {
      if (error && error.errorCode !== 'RBF100300') {
        indexActions.setErrorMessage(error.message);
      }
      this.setState({
        loadingStatus: false
      });
    });

    //埋点
    perfect.setBuriedPoint('hongbao_home_btn_sponsor');
  }

  replaceProduct(e) {
    //防点透处理
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.preventDefault();
    e.nativeEvent.stopPropagation();

    //标示是从替换上点击
    this.fromReplace = true;

    const {homeAction} = this.props;
    const {giftNum, title} = this.state;
    homeAction.setHongbaoInfo({
      giftNum, title
    });
    //埋点
    perfect.setBuriedPoint('hongbao_home_replace_product');
    this.context.router.push('/product');
  }

  // 关闭发送红包
  closeHongbao() {
    this.context.router.replace('/');
  }

  //在钱包中去掉帮助页面分享
  clearMenu() {
    if (deviceEnv.inJdWallet) {
      walletApi.setMenu();
    }
  }

  //渲染支付表单
  renderH5PayForm() {
    const {payDataReady} = this.state;
    if (!payDataReady) {
      return null;
    }

    const {
      version, sign, merchant, device, tradeNum, tradeName, tradeDesc, tradeTime, amount, currency,
      note, notifyUrl, callbackUrl, ip, specCardNo, specId, specName, userType, userId, expireTime,
      orderType, industryCategoryCode, oriUrl, termInfo
    } = this.basePayOrderInfo;

    return (
      <form ref="h5PayForm" method="post" action={oriUrl}>
        <input type="hidden" name="version" value={version}/>
        <input type="hidden" name="merchant" value={merchant}/>
        <input type="hidden" name="device" value={device}/>
        <input type="hidden" name="note" value={note}/>
        <input type="hidden" name="tradeNum" value={tradeNum}/>
        <input type="hidden" name="tradeName" value={tradeName}/>
        <input type="hidden" name="tradeDesc" value={tradeDesc}/>
        <input type="hidden" name="tradeTime" value={tradeTime}/>
        <input type="hidden" name="amount" value={amount}/>
        <input type="hidden" name="currency" value={currency}/>
        <input type="hidden" name="notifyUrl" value={notifyUrl}/>
        <input type="hidden" name="callbackUrl" value={callbackUrl}/>
        <input type="hidden" name="ip" value={ip}/>
        <input type="hidden" name="sign" value={sign}/>
        <input type="hidden" name="userType" value={userType}/>
        <input type="hidden" name="userId" value={userId}/>
        <input type="hidden" name="expireTime" value={expireTime}/>
        <input type="hidden" name="orderType" value={orderType}/>
        <input type="hidden" name="industryCategoryCode" value={industryCategoryCode}/>
        <input type="hidden" name="specCardNo" value={specCardNo}/>
        <input type="hidden" name="specId" value={specId}/>
        <input type="hidden" name="specName" value={specName}/>
        <input type="hidden" name="termInfo" value={termInfo}/>
      </form>
    );
  }

  //关闭引导
  closeGuide(e) {
    //防点透处理
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.preventDefault();
    e.nativeEvent.stopPropagation();

    this.setState({
      guide: false
    });
    setLocalStorage('guide-sponsor-hb', 'true');
  }

  render() {
    let {
      giftNum, title, bizPrice, skuName, indexImg,
      selecting, checked, loadingStatus, giftTitle, guide
    } = this.state;
    const {pathname} = this.props;
    bizPrice = (bizPrice / 100).toFixed(2);

    let initiateCom = null;
    if (pathname && pathname.indexOf('/initiate') !== -1) {
      const {skuName, title, identifier, status, skuIcon} = this.props;
      const initiateProps = {
        skuName, title, identifier, status, skuIcon,
        closeHongbao: this.closeHongbao
      };
      initiateCom = (
        <Initiate {...initiateProps}/>
      );
    }

    return (
      <div>
        {guide ? <Guide closeGuide={this.closeGuide} imgUrl={this.imgUrl}/> : null}
        {initiateCom}
        {loadingStatus ? (<Loading loadingStatus={loadingStatus}/>) : null}
        {this.renderH5PayForm()}
        <div className="hb-main">
          <article className="hb-wrap m-t-2">
            <section>
              <div className="f-lg">
                <div className="hb-single p-y-1 m-b-1" onTouchTap={this.selectProduct}>
                  <span>发京东红包</span>
                  {
                    selecting ? (
                      <div className="pull-right">
                        <span className="text-muted">选择礼物</span>
                        <span className="arrow-hollow-right" style={{marginRight: '-4px'}}></span>
                      </div>
                    ) : (
                      <span className="pull-right">{bizPrice}元</span>
                    )
                  }
                </div>
              </div>

              {
                !selecting ? (
                  <div className="m-t-1 m-b-1">
                    <div className="hb-single">
                      <div className="row flex-items-middle">
                        <div className="col-4">
                          <img className="img-fluid" src={indexImg} alt=""/>
                        </div>
                        <div className="col-16">
                          <div className="text-truncate">{skuName}</div>
                          <div className="text-muted f-sm">{bizPrice ? `￥${bizPrice}` : ''}</div>
                        </div>
                        <div className="col-4 border-left border-second text-center p-a-0"
                             onTouchTap={this.replaceProduct}>
                          <span className="text-link">更换</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null
              }

              <div className="f-lg">
                <div className="hb-single p-y-1">
                  <span>红包个数</span>
                  <div className="pull-right text-right">
                    <input value={giftNum} onChange={(e) => this.handleChange(e, 'giftNum')}
                           onBlur={() => this.handleBlur('giftNum')}
                           className="hb-input text-right" type="tel" placeholder="填写个数"
                           style={{width: '100px'}}/>
                    <span className="pull-right">个</span>
                  </div>
                </div>
                <p className="f-sm m-l-0-75 text-muted">{giftTitle}</p>
              </div>

              <div className="f-lg">
                <div className="hb-single">
                <textarea maxLength="25" value={title} onChange={(e) => this.handleChange(e, 'title')}
                          onBlur={() => this.handleBlur('title')}
                          className="hb-textarea f-lg" placeholder={HONGBAO_TITLE}></textarea>
                </div>
              </div>
            </section>

            <section className="text-center hb-money">
              ¥{bizPrice}
            </section>

            <section className="m-t-2">
              <button className="btn btn-block btn-primary btn-lg" disabled={selecting || giftNum === ''}
                      onTouchTap={this.payBefore} style={{paddingTop: '0.725rem', paddingBottom: '0.725rem'}}>发起京东红包
              </button>
              <div className="hb-help-link f-sm">
                <Link to="/strategy" className="fl">如何发京东红包</Link>
                <a onClick={this.clearMenu}
                   className="fr"
                   href="http://m.wangyin.com/basic/findInfoByKeywordsH5?searchKey=%E4%BA%AC%E4%B8%9C%E7%BA%A2%E5%8C%85">帮助反馈</a>
              </div>
              <p className="text-center f-sm m-t-2 text-muted">
                <i className={`hb-radio-gray${checked ? ' checked' : ''}`} onTouchTap={this.handleChecked}></i>
                <span>同意并接受</span>
                <Link to="/protocol">《京东钱包京东红包服务协议》</Link>
              </p>
              <p className="text-center f-sm m-t-2 text-muted">
                <span>好友未领取实物，可于15天后申请退款 </span>
                {/*<a onClick={this.clearMenu}*/}
                   {/*href="http://m.wangyin.com/basic/findInfoByKeywordsH5?searchKey=%E4%BA%AC%E4%B8%9C%E7%BA%A2%E5%8C%85"><i*/}
                  {/*className="hb-help-icon"></i></a>*/}
              </p>
            </section>
            <p className="text-center hb-logo-gray-pos">
              <i className="hb-logo-gray"></i>
            </p>
          </article>
        </div>
        <HelpFeedback showFollowMe={true}/>
        {this.state.showFoot ? (<BottomNav type="sponsor"/>) : null}
      </div>
    );
  }
}

Home.propTypes = {
  detail: PropTypes.string,
  indexActions: PropTypes.object,
  setClientInfo: PropTypes.func,
  skuName: PropTypes.string,
  title: PropTypes.string,
  identifier: PropTypes.string,
  status: PropTypes.string,
  skuIcon: PropTypes.string,
  pathname: PropTypes.string,
  hongbaoInfo: PropTypes.object,
  homeAction: PropTypes.object
};

Home.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default Home;
