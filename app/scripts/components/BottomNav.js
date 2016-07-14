import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';

// 底部导航
class BottomNav extends Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      showBottomNav: false
    };
    this.createOrder = this.createOrder.bind(this);
    this.myHongbao = this.myHongbao.bind(this);
  }

  componentWillMount() {
    setTimeout(() => {
      this.setState({
        showBottomNav: true
      });
    }, 150);
  }

  createOrder(e) {
    e.nativeEvent.preventDefault;
    e.nativeEvent.stopPropagation();
    this.context.router.push('/');
  }

  myHongbao(e) {
    e.nativeEvent.preventDefault;
    e.nativeEvent.stopPropagation();
    this.context.router.push('/my');
  }

  render() {
    const {type} = this.props;
    if (!this.state.showBottomNav) {
      return null;
    }
    return (
      <footer className="hb-footer">
        <div className="row text-center">
          <div className={`col-12 border-second border-right${type === 'sponsor' ? ' hb-active-btn' : ''}`}
               onTouchTap={this.createOrder}>
            发起红包
          </div>
          <div className={`col-12${type === 'receive' ? ' hb-active-btn' : ''}`}
               onClick={this.myHongbao}>
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
};

export default BottomNav;
