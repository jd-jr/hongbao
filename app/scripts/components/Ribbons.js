import React, {Component, PropTypes} from 'react';
import perfect from '../utils/perfect';

// 红包详情页面彩带组件
class Ribbons extends Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      showSnow: true //是否显示彩带
    };

    this.rootUrl = perfect.getLocationRoot() +'images/';
    this.rednerSnow = this.rednerSnow.bind(this);
    this.W = window.innerWidth; //窗口宽
    this.H = window.innerHeight; //窗口高
  }

  componentDidMount(){
    // console.log(ReactDOM.find(body));
    // var aa = setInterval(function() {
    //   this.snow(left, height, src);
    // }.bind(this), 50);
    //
    setTimeout(function() {
      this.setState({
        showSnow: false
      })
    }.bind(this), 5e3)
  }

  componentWillUnmount(){
    // this.intervals.forEach(clearInterval);
    // this.timeouts.forEach(clearTimeout);
  }

  rednerSnow() {
    const {showSnow} = this.state;
    if (!showSnow) return;

    let snows = [];
    for (let i=0; i < 60; i++) {
      const left = Math.random() * this.W;
      const height = Math.random() * this.H + 50;
      const num = Math.floor(Math.random() * 11 + 1);
      const src = this.rootUrl + "ribbons/" + num + ".png";
      snows.push({
        left, height, num, src
      })
    }

    // console.log(snows)
    return (
      <div className="hb-snow-zone">
        {
          snows.map((item, index)=>{
            return (
              <div key={index} className="snow-zone" style={{left: item.left + "px", height: item.height + "px"}}>
                <img src={item.src} alt="" className={"hb-ribbons ribbons-" + item.num}/>
              </div>
            )
          })
        }
      </div>
    )
  }

  render() {
    return (
      <div>{this.rednerSnow()}</div>
    );
  }
}

Ribbons.propTypes = {
  seconds: PropTypes.number
};

export default Ribbons;
