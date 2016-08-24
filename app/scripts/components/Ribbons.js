import React, {Component, PropTypes} from 'react';
import perfect from '../utils/perfect';

// 红包详情页面彩带组件
class Ribbons extends Component {

  constructor(props, context) {
    super(props, context);

    this.rootUrl = perfect.getLocationRoot() +'images/';
    this.W = window.innerWidth; //窗口宽
    this.H = window.innerHeight; //窗口高
  }

  componentDidMount(){
    const {hbSnowZone} = this.refs;
    const {seconds=8e3} = this.props;
    const timer = setInterval(function() {
      const left = Math.random() * this.W;
      const height = Math.random() * this.H;
      const num = Math.floor(Math.random() * 11 + 1);
      const src = this.rootUrl + "ribbons/" + num + ".png";

      let div = document.createElement("div");
      let img = document.createElement("img");
      div.appendChild(img);
      img.className = "hb-ribbons ribbons-" + num;
      img.src = src;
      div.style.left = left + "px";
      div.style.height = height + "px";
      div.className = "snow-zone";
      hbSnowZone.appendChild(div);
      setTimeout(function() {
        hbSnowZone.removeChild(div);
      }, 3e3);
    }.bind(this), 50);

    setTimeout(function() {
      clearInterval(timer);
    }.bind(this), seconds);
  }

  render() {
    return (
      <div className="hb-snow-zone" ref="hbSnowZone"></div>
    );
  }
}

Ribbons.propTypes = {
  seconds: PropTypes.number //彩带持续时长,默认8s
};

export default Ribbons;
