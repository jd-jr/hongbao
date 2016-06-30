import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import deviceEnv from 'jd-wallet-sdk/lib/utils/device-env';
import base64 from 'js-base64';
import BottomNav from '../BottomNav';
import Help from '../Help';
import Loading from '../../ui/Loading';
import callApi from '../../fetch';
import {HONGBAO_TITLE} from '../../constants/common';
import perfect from '../../utils/perfect'

const {Base64} = base64;

class Home extends Component {
  constructor(props) {
    super(props);
    let {detail} = props;
    if (detail) {
      detail = decodeURIComponent(detail);
      console.info(detail);
      detail = Base64.decode(detail);
      detail = perfect.parseJSON(detail);
    }

    const {skuName, skuId, bizPrice, indexImg} = (detail || {});
    this.state = {
      title: '',
      bizPrice: bizPrice || 0,
      skuId,
      skuName,
      indexImg,
      giftNum: 1,
      selecting: Boolean(!skuId),
      visible: false,
      payDataReady: false,
      loadingStatus: false,
      checked: true, //同意条款
      mystic: false // 是否为神秘奖品
    };
    this.selectProduct = this.selectProduct.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.payBefore = this.payBefore.bind(this);
    this.handleChecked = this.handleChecked.bind(this);
    this.handleMystery = this.handleMystery.bind(this);
  }

  componentWillMount() {
    const fromLogin = location.href.indexOf('from=login');
    if (fromLogin !== -1) {
      this.pay();
    }
  }

  handleChange(e, type) {
    let value = e.target.value;
    if (type === 'giftNum') {
      if (value === '') {
        this.setState({
          giftNum: ''
        });
        return;
      }
      if (!/^\+?[1-9][0-9]*$/.test(value)) {
        return;
      }
      value = parseInt(value, 10);
      if (value > 50) {
        this.setState({
          giftNum: 50
        });
        return;
      }
    } else if (type === 'title') {
      if (value.length > 30) {
        return;
      }
    }

    this.setState({
      [type]: value
    });
  }

  handleChecked() {
    const {checked} = this.state;
    this.setState({
      checked: !checked
    });
  }

  handleMystery() {
    const {mystic} = this.state;
    this.setState({
      mystic: !mystic
    });
  }

  //选择商品
  selectProduct() {
    this.context.router.push('/product');
  }

  payBefore(e) {
    e.nativeEvent.preventDefault();
    e.nativeEvent.stopPropagation();

    const {setClientInfo} = this.props;
    setClientInfo((status) => {
      if (status) {
        this.pay();
      }
    });
  }

  //支付
  pay() {
    const {indexActions, thirdAccId, accountType} = this.props;
    const {skuId, giftNum, title, loadingStatus, mystic} = this.state;
    if (loadingStatus) {
      return;
    }

    this.setState({
      loadingStatus: true
    });

    const url = 'create';
    const body = {
      skuId,
      giftNum,
      title: title || HONGBAO_TITLE,
      accountType: accountType || perfect.getAccountType()
    };

    if (!deviceEnv.inJdWallet) {
      body.thirdAccId = thirdAccId
    }

    // 红包 id
    let identifier;

    callApi({url, body}).then(
      ({json, response}) => {
        identifier = json.data;
        const url = 'pay';
        const body = {
          identifier,
          mystic
        };
        return callApi({url, body});
      },
      (error) => {
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
      orderType, industryCategoryCode, oriUrl
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
      </form>
    );
  }

  render() {
    let {giftNum, title, bizPrice, skuName, indexImg, selecting, checked, loadingStatus, mystic} = this.state;

    const {thirdAccId, accountType} = this.props;
    bizPrice = (bizPrice / 100).toFixed(2);

    return (
      <div>
        {loadingStatus ? (<Loading loadingStatus={loadingStatus}/>) : null}
        {this.renderH5PayForm()}
        <article className="hb-wrap m-t-3">
          <section>
            <div>
              <div className="hb-single" onTouchTap={this.selectProduct}>
                <span>发实物红包</span>
                {
                  selecting ? (
                    <span className="pull-right arrow-hollow-right"></span>
                  ) : (
                    <span className="pull-right">{bizPrice}元</span>
                  )
                }
              </div>
              <p className="f-xs m-l-1 text-muted">未中奖用户可随机获得钱包补贴的现金红包</p>
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
                      <div className="col-4 border-left border-second text-center">
                        <Link to="/product">更换</Link>
                      </div>
                    </div>
                  </div>
                  <p className="f-xs m-l-1 text-muted">
                    <i className={`hb-radio${mystic ? ' checked' : ''}`} onTouchTap={this.handleMystery}></i>
                    隐藏实物图片和名称，给小伙伴们发神秘奖品
                  </p>
                </div>
              ) : null
            }

            <div>
              <div className="hb-single">
                <span>红包个数</span>
                <div className="pull-right">
                  <input value={giftNum} onChange={(e) => this.handleChange(e, 'giftNum')}
                         className="hb-input text-right" type="tel" placeholder="填写个数"/>
                  <span className="pull-right">个</span>
                </div>
              </div>
              <p className="f-xs m-l-1 text-muted">包含实物和现金红包</p>
            </div>

            <div>
              <div className="hb-single">
                <textarea maxLength="30" value={title} onChange={(e) => this.handleChange(e, 'title')}
                          className="hb-textarea" placeholder={HONGBAO_TITLE}></textarea>
              </div>
            </div>
          </section>

          <section className="text-center hb-money">
            ¥{bizPrice}
          </section>

          <section className="m-t-2">
            <button className="btn btn-block btn-primary btn-lg" disabled={selecting}
                    onTouchTap={this.payBefore}>发起实物红包
            </button>
            <p className="text-center f-sm m-t-2 text-muted">
              <i className={`hb-radio${checked ? ' checked' : ''}`} onTouchTap={this.handleChecked}></i>
              <span>同意并接受</span> <a href="#">《京东钱包实物红包服务协议》</a>
            </p>
            <p className="text-center f-sm m-t-2 text-muted">中奖者未领取实物，可于7天后申请退款</p>
            <p className="text-center">
              <i className="hb-logo"></i>
            </p>
          </section>
        </article>

        <Help/>
        <BottomNav type="sponsor" thirdAccId={thirdAccId} accountType={accountType} />
      </div>
    );
  }
}

Home.propTypes = {
  detail: PropTypes.string,
  indexActions: PropTypes.object,
  setClientInfo: PropTypes.func,
  thirdAccId: PropTypes.string,
  accountType: PropTypes.string,
};

Home.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default Home;
