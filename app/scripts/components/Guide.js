import React, {Component} from 'react';
import perfect from '../utils/perfect';

class Leading extends Component {
  constructor(props) {
    super(props);
    this.rootUrl = perfect.getLocationRoot() + 'images/guide/';
    this.bodyH = document.documentElement.clientHeight;
  }

  render() {
    const {closeGuide, imgUrl} = this.props;

    return (
      <div className="hb-guide-img"
           onTouchTap={closeGuide}>
        <img src={this.rootUrl + imgUrl} height={this.bodyH} alt=""/>
      </div>
    );
  }
}

export default Leading;
