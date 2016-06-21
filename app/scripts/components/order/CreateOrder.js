import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import Modal from 'reactjs-modal';
import BottomNav from '../BottomNav';
import prefect from '../../utils/perfect';
import Loading from '../../ui/Loading';
import callApi from '../../fetch';
import walletApi from 'jd-wallet-sdk';

class CreateOrder extends Component {
  constructor(props) {
    super(props);
    const {skuName, skuId, bizPrice} = props;
    this.state = {
      title: '',
      bizPrice,
      skuId,
      skuName,
      giftNum: 1,
      cash: 0,
      selecting: Boolean(!skuId),
      visible: false
    };
    this.selectProduct = this.selectProduct.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.wrapHongbao = this.wrapHongbao.bind(this);
    this.sponsor = this.sponsor.bind(this);
    this.loadingStatus = false;
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
    }

    this.setState({
      [type]: value
    });
  }

  //选择商品
  selectProduct() {
    this.context.router.push('/product');
  }

  wrapHongbao() {
    const {selecting} = this.state;
    if (selecting) {
      return;
    }
    this.setState({
      visible: true
    });
  }

  sponsor(e) {
    e.nativeEvent.preventDefault();
    e.nativeEvent.stopPropagation();

    const {skuId, giftNum, title} = this.state;
    if (this.loadingStatus) {
      return;
    }

    this.loadingStatus = true;
    const url = 'create';
    const body = {
      skuId,
      giftNum,
      title,
      accountType: 'WALLET',
      thirAccId: '123456',
      customerId: '1234567890'
    };

    callApi({url, body}).then(
      ({json, response}) => {
        this.loadingStatus = false;
        const identifier = json.data.identifier;
        //调起分享
        const pathname = prefect.getPathname();
        walletApi.share({
          url: `${pathname}unpack/${identifier}`,
          title: '实物红包',
          desc: '实物红包',
          channel: 'WX',
          callback: (status) => {
            if (status === 'SUCCESS') {
              //回到首页
              this.context.router.push('/');
            }
          }
        });
      },
      (error) => {
        this.loadingStatus = false;
      }
    );
  }

  renderModal() {
    const {visible} = this.state;
    let modal;
    if (visible) {
      modal = (
        <Modal
          visible={visible}
          className="hb-modal"
          bodyStyle={{height: '32rem'}}
        >
          <div className="hb-ellipse-arc-mask">
            <div className="hb-ellipse-arc-flat flex-items-middle flex-items-center">
              <div>
                <h2>红包已包好</h2>
                <h4>实物和现金红包</h4>
              </div>
            </div>
            <div className="hb-btn-circle flex-items-middle flex-items-center" onTouchTap={this.sponsor}>发红包</div>
          </div>
        </Modal>
      );
    }
    return modal;
  }

  render() {
    let {giftNum, title, bizPrice, skuName, cash, selecting} = this.state;
    if (bizPrice) {
      bizPrice = (bizPrice / 100).toFixed(2);
    }

    return (
      <div>
        <Loading loadingStatus={this.loadingStatus}/>
        {this.renderModal()}
        <article className="hb-wrap">
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
                <div className="hb-single m-t-1 m-b-1">
                  <div className="row flex-items-middle">
                    <div className="col-4">
                      <img className="img-fluid"
                           src="//img30.360buyimg.com/cms/jfs/t2767/199/1633966269/88015/5c2f906b/57451706N0a0381dc.jpg"
                           alt=""/>
                    </div>
                    <div className="col-16">
                      <div className="text-truncate">{skuName}</div>
                      <div className="text-muted f-sm">{bizPrice ? `￥ ${bizPrice}` : ''}</div>
                    </div>
                    <div className="col-4 border-left border-second text-center">
                      <Link to="/product">更换</Link>
                    </div>
                  </div>
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
                <textarea value={title} onChange={(e) => this.handleChange(e, 'title')}
                          className="hb-textarea" placeholder="我在京东钱包发起了个实物和现金红包，快来抢啊！"></textarea>
              </div>
              <p className="f-xs m-l-1 text-muted">未中奖用户可随机获得钱包补贴的现金红包</p>
            </div>
          </section>

          <section className="text-center h1">
            ¥{cash.toFixed(2)}
          </section>

          <section className="m-t-2">
            <button className="btn btn-block btn-primary btn-lg" disabled={selecting}
                    onTouchTap={this.wrapHongbao}>发起实物红包
            </button>
            <p className="text-center f-sm m-t-2 text-muted">
              <i></i><span>同意并接受</span> <a href="#">《京东钱包实物红包服务协议》</a>
            </p>
            <p className="text-center f-sm m-t-2 text-muted">中奖者未领取实物，将于15天后发起退款</p>
          </section>

        </article>

        <BottomNav type="sponsor"/>
      </div>
    );
  }
}

CreateOrder.contextTypes = {
  router: PropTypes.object.isRequired,
  skuName: PropTypes.string,
  skuId: PropTypes.string,
  bizPrice: PropTypes.number,
};

export default CreateOrder;
