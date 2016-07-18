import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';

// 红包攻略
class Guide extends Component {

  render() {
    return (
      <div className="hb-guide-panel">
        <h3>红包攻略正在制作中，稍后敬请关注！谢谢您的合作！</h3>
        <Link to="/">发送红包</Link>
      </div>
    );
  }
}

export default Guide;
