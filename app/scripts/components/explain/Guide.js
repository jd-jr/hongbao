import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';

// 红包攻略
class Guide extends Component {

  componentDidMount() {
    document.body.style.overflowY = 'auto';
    document.documentElement.style.overflowY = 'auto';
  }

  componentWillUnmount() {
    document.body.style.overflowY = 'hidden';
    document.documentElement.style.overflowY = 'hidden';
  }

  render() {
    return (
      <div className="hb-guide-panel p-a-3">
        <h3>红包攻略正在制作中，稍后敬请关注！</h3>
        <Link to="/">发送红包</Link>
      </div>
    );
  }
}

export default Guide;
