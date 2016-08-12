import React, {Component, PropTypes} from 'react';
import {render} from 'react-dom';
import weixin from 'jd-wallet-sdk/lib/weixin';
import '../styles/share.css';
import {SHARE_ICON_URL} from './constants/common';

/**
 * 获得地址栏传递参数
 * @returns {null}
 */
function getLocationParams() {
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
}

// 红包分享
class Share extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: 'none'
    };

    //以 iPhone6 为基准来处理 375X667
    const bodyW = document.documentElement.clientWidth;
    this.linkLgHeight = bodyW / 375 * 41;
    this.linkSmHeight = bodyW / 375 * 25;

    //FIXME，上线前需要修改
    this.rootUrl = '/m-hongbao/images/share/';
    this.imgOnload = this.imgOnload.bind(this);
  }

  componentDidMount() {
    const {shareImg} = this.refs;
    shareImg.addEventListener('load', this.imgOnload);

    weixin.share({
      url: location.href,
      title: '分享标题，待定',
      desc: '分享描述，待定',
      imgUrl: SHARE_ICON_URL,
      channel: 'WX'
    });
  }

  componentWillUnmount() {
    const {shareImg} = this.refs;
    shareImg.removeEventListener('load', this.imgOnload);
  }

  imgOnload() {
    this.setState({
      show: 'block'
    });
  }

  renderBody() {
    const rootUrl = this.rootUrl;
    const params = getLocationParams() || {};
    let {type, headpic, nickname, skuname, skuicon, amount} = params;
    headpic = decodeURIComponent(headpic);
    skuicon = decodeURIComponent(skuicon);
    //中实物或现金
    if (type === 'gift' || type === 'cash') {
      return (
        <div>
          <div className="hb-share-item">
            <div>
              <img className="hb-img-circle"
                   src={headpic} alt=""/>
            </div>
            <img ref="shareImg" src={`${rootUrl}share-gift_01.png`} alt="红包分享"/>
          </div>
          <div className="hb-share-item" style={{display: this.state.show}}>
            <div className="hb-share-text" style={type === 'gift' ? {} : {marginTop: '0.7rem'}}>
              <div>我在 <span className="hb-share-text-underline">{nickname}</span> 发的京东红包里抢到了</div>
              {type === 'gift' ? (<div className="hb-skuname">{skuname}</div>) : null}
            </div>
            <img src={`${rootUrl}share-gift_02.png`} alt="红包分享"/>
          </div>
          {
            type === 'gift' ? (
              <div className="hb-share-item" style={{display: this.state.show}}>
                <div className="hb-skuicon-wrap">
                  <img className="hb-skuicon"
                       src={skuicon} alt=""/>
                </div>
                <img src={`${rootUrl}share-gift_03.png`} alt="红包分享"/>
              </div>
            ) : (
              <div className="hb-share-item" style={{display: this.state.show}}>
                <div className="hb-cash">
                  <span>{amount}</span>
                  <span className="hb-cash-unit"> 元</span>
                </div>
                <img src={`${rootUrl}share-cash_03.png`} alt="红包分享"/>
              </div>
            )
          }
        </div>
      );
    }

    //通用分享
    return (
      <div>
        <div className="hb-share-item">
          <img src={`${rootUrl}share-common_01.png`} alt="红包分享"/>
        </div>
        <div className="hb-share-item">
          <img src={`${rootUrl}share-common_02.png`} alt="红包分享"/>
        </div>
      </div>
    );
  }

  render() {
    const rootUrl = this.rootUrl;
    return (
      <div className="hb-share-panel">
        {this.renderBody()}
        <div className="hb-share-item">
          <div className="hb-share-link">
            <a className="hb-share-link-text hb-share-link-text-lg"
               style={{height: `${this.linkLgHeight}px`}} href="./">发个京东红包</a>
          </div>
          <img src={`${rootUrl}share-common_03.png`} alt="红包分享"/>
        </div>
        <div className="hb-share-item">
          <div className="hb-share-link" style={{height: `${this.linkSmHeight}px`}}>
            <a className="hb-share-link-text hb-share-link-text-sm" href="./strategy">
              京东红包什么鬼
            </a>
            <a className="hb-share-link-text hb-share-link-text-sm" href="./my">
              查看我的红包
            </a>
          </div>
          <img src={`${rootUrl}share-common_04.png`} alt="红包分享"/></div>
      </div>
    );
  }
}


render(
  <Share/>,
  document.getElementById('layout')
);

