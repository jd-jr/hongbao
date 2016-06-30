import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';

// 底部导航
class BottomNav extends Component {

  constructor(props, context) {
    super(props, context);
    this.createOrder = this.createOrder.bind(this);
    this.myHongbao = this.myHongbao.bind(this);
  }

  createOrder() {
    const {thirdAccId, accountType} = this.props;
    this.context.router.push({
      pathname: '/',
      query: {
        thirdAccId,
        accountType
      }
    });
  }

  myHongbao() {
    const {thirdAccId, accountType} = this.props;
    this.context.router.push({
      pathname: '/my',
      query: {
        thirdAccId,
        accountType
      }
    });
  }

  render() {
    const {type} = this.props;
    return (
      <footer className="hb-footer">
        <div className="row text-center">
          <div className={`col-12 border-second border-right${type === 'sponsor' ? ' hb-active-btn' : ''}`}
               onTouchTap={this.createOrder}>
            发起红包
          </div>
          <div className={`col-12${type === 'receive' ? ' hb-active-btn' : ''}`}
               onTouchTap={this.myHongbao}>
            我的红包
          </div>
        </div>
      </footer>
    );
  }
}


BottomNav.contextTypes = {
  router: PropTypes.object.isRequired
};

BottomNav.propTypes = {
  type: PropTypes.string,
  thirdAccId: PropTypes.string,
  accountType: PropTypes.string,
};

export default BottomNav;
