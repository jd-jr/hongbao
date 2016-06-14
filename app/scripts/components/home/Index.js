import React, {Component, PropTypes} from 'react';

class Home extends Component {

  render() {
    return (
      <div className="perfect">
        实物红包首页
      </div>
    );
  }
}

Home.contextTypes = {
  router: PropTypes.object.isRequired
};

export default Home;
