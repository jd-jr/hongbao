import React, {Component, PropTypes} from 'react';
import BottomNav from '../BottomNav';

class Home extends Component {

  render() {
    return (
      <div>
        <article className="hb-wrap">
          实物红包首页
        </article>
        <BottomNav type="sponsor"/>
      </div>
    );
  }
}

export default Home;
