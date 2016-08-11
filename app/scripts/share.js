import React, {Component, PropTypes} from 'react';
import {render} from 'react-dom';
import '../styles/share.css';
import shareImg from '../images/share/share.gif';

// 红包分享
class Share extends Component {
  constructor(props) {
    super(props);
    this.bodyH = document.documentElement.clientHeight;
    //以 iPhone6 为基准来处理 375X667
    this.linkLgBottom = this.bodyH / 667 * 5.7;
    this.linkLgHeight = this.bodyH / 667 * 2.9;
    this.linkSmBottom = this.bodyH / 667 * 3;
  }

  render() {

    return (
      <div className="hb-share-bg"
           style={{backgroundImage: `url("${shareImg}")`, height: this.bodyH}}>
        <div className="hb-share-link" style={{bottom: `${this.linkLgBottom}rem`}}>
          <a className="hb-share-link-text hb-share-link-text-lg"
             style={{height: `${this.linkLgHeight}rem`}}
             href="./">发个京东红包</a>
        </div>
        <div className="hb-share-link" style={{bottom: `${this.linkSmBottom}rem`}}>
          <a className="hb-share-link-text hb-share-link-text-sm" href="./strategy">
            京东红包什么鬼
          </a>
          <a className="hb-share-link-text hb-share-link-text-sm" href="./my">
            查看我的红包
          </a>
        </div>
      </div>
    );
  }
}


render(
  <Share/>,
  document.getElementById('layout')
);

