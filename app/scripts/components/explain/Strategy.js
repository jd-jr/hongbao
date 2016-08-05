import React, {Component, PropTypes} from 'react';
import offset from 'perfect-dom/lib/offset';
import perfect from '../../utils/perfect';
// 红包攻略
class Strategy extends Component {
  constructor(props) {
    super(props);
    this.state = {
      active: 0
    };

    this.switch = function (active) {
      return function () {
        const el = this.refs[`strategy${active}`];
        const top = offset(el).top;
        document.body.scrollTop = top;
        this.onscroll();
      }.bind(this);
    }.bind(this);

    this.onscroll = this.onscroll.bind(this);
  }

  componentDidMount() {
    window.addEventListener('scroll', this.onscroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.onscroll);
  }

  onscroll() {
    this.calculateTop();
    const scrollTop = document.body.scrollTop;
    const scrollHeight = document.body.scrollHeight;
    let active = 0;
    if ((scrollTop + 5 >= this.top3) || scrollTop > scrollHeight - 700) {
      active = 3;
    } else if (scrollTop + 5 >= this.top2) {
      active = 2;
    } else if (scrollTop + 5 >= this.top1) {
      active = 1;
    }
    this.setState({
      active
    });
  }

  calculateTop() {
    //计算坐标
    const {strategy1, strategy2, strategy3} = this.refs;
    this.top1 = offset(strategy1).top;
    this.top2 = offset(strategy2).top;
    this.top3 = offset(strategy3).top;
  }

  render() {
    const rootUrl = perfect.getLocationRoot() + 'images/strategy/';
    const {active} = this.state;
    return (
      <div>
        <div className="hb-strategy-nav">
          <span className={active === 0 ? 'active' : ''} onTouchTap={this.switch(0)}>产品简介</span>
          <span className={active === 1 ? 'active' : ''} onTouchTap={this.switch(1)}>场景示例</span>
          <span className={active === 2 ? 'active' : ''} onTouchTap={this.switch(2)}>红包玩法</span>
          <span className={active === 3 ? 'active' : ''} onTouchTap={this.switch(3)}>帮助反馈</span>
        </div>

        <ul className="hb-strategy-img">
          <li ref="strategy0"><img src={`${rootUrl}strategy_01.jpg`} alt="红包攻略"/></li>
          <li ref="strategy1"><img src={`${rootUrl}strategy_02.jpg`} alt="红包攻略"/></li>
          <li><img src={`${rootUrl}strategy_03.jpg`} alt="红包攻略"/></li>
          <li ref="strategy2"><img src={`${rootUrl}strategy_04.jpg`} alt="红包攻略"/></li>
          <li><img src={`${rootUrl}strategy_05.jpg`} alt="红包攻略"/></li>
          <li><img src={`${rootUrl}strategy_06.jpg`} alt="红包攻略"/></li>
          <li><img src={`${rootUrl}strategy_07.jpg`} alt="红包攻略"/></li>
          <li><img src={`${rootUrl}strategy_08.jpg`} alt="红包攻略"/></li>
          <li><img src={`${rootUrl}strategy_09.jpg`} alt="红包攻略"/></li>
          <li><img src={`${rootUrl}strategy_10.jpg`} alt="红包攻略"/></li>
          <li><img src={`${rootUrl}strategy_11.jpg`} alt="红包攻略"/></li>
          <li><img src={`${rootUrl}strategy_12.jpg`} alt="红包攻略"/></li>
          <li><img src={`${rootUrl}strategy_13.jpg`} alt="红包攻略"/></li>
          <li><img src={`${rootUrl}strategy_14.jpg`} alt="红包攻略"/></li>
          <li ref="strategy3"><img src={`${rootUrl}strategy_15.jpg`} alt="红包攻略"/></li>
        </ul>
      </div>
    );
  }
}

export default Strategy;
