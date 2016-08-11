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
    this.linkBottom = this.bodyH / 667 * 5.6;
  }

  render() {

    return (
      <div className="hb-share-bg"
           style={{backgroundImage: `url("${shareImg}")`, height: this.bodyH}}>
        <div className="hb-share-link" style={{bottom: `${this.linkBottom}rem`}}>
          <a className="hb-share-link-text hb-share-link-text-lg" href="">发个京东红包</a>
        </div>

        <a className="hb-share-link hb-share-link-default" href=""></a>
        <a className="hb-share-link hb-share-link-default" href=""></a>
      </div>
    );
  }
}


render(
  <Share/>,
  document.getElementById('layout')
);

