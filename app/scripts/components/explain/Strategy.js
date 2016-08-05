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
        this.setState({
          active
        });
        const el = this.refs[`strategy${active}`];
        const top = offset(el).top;
        document.body.scrollTop = top;
      }.bind(this);
    }.bind(this);
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
