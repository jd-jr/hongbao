//noinspection JSUnresolvedVariable
import React, {Component, PropTypes} from 'react';
import deviceEnv from 'jd-wallet-sdk/lib/utils/device-env';
import perfect from '../utils/perfect';
import Draggabilly from 'draggabilly'

// 帮助反馈 & 底部关注我
class HelpFeedback extends Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      showFollowMe: props.showFollowMe, // 默认显示底部"关注我"
      showCode: false // 默认不显示遮罩和二维码
    };
    this.followMe = this.followMe.bind(this);
    this.closeCode = this.closeCode.bind(this);

    this.rootUrl = perfect.getLocationRoot() +'images/';
  }

  componentDidMount(){
    //"关注我"添加拖动效果
    const followMe = this.refs.followMe;
    if (!followMe) return;

    const documentEl = document.documentElement;
    followMe.style.top = `${documentEl.clientHeight * 0.85}px`;
    followMe.style.left = `${documentEl.clientWidth - 60}px`;
    new Draggabilly(followMe, {
      containment: documentEl
    })
  }

  followMe(e) {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.preventDefault();
    e.nativeEvent.stopPropagation();

    this.setState({showCode: true});
  }

  closeCode(e) {
    this.setState({showCode: false});
  }

  render() {
    const {showCode, showFollowMe} = this.state;

    return (
      <div>
        <div className="hb-mask hb-help-mask" style={{display: showCode?'block':'none'}}></div>
        <div className="hb-help-text text-center" style={{display: showCode?'block':'none'}}>
          <img className="hb-help-code" src={this.rootUrl + "wallet-hb-code.png"} alt="" />
          <img className="hb-help-close"
               onTouchTap={this.closeCode}
               src={this.rootUrl + "close.png"} alt="" />
        </div>
        {showFollowMe && deviceEnv.inWx ?
          (<a className="hb-follow-me"
              href="#"
              ref="followMe"
              onTouchTap={this.followMe}>
          <img src={this.rootUrl + "follow-me.png"} alt="" />
        </a>):null}
      </div>
    );
  }
}


HelpFeedback.contextTypes = {
  router: PropTypes.object.isRequired
};

HelpFeedback.propTypes = {
  showFollowMe: PropTypes.bool
};

export default HelpFeedback;
