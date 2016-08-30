import React, {Component, PropTypes} from 'react';
import deviceEnv from 'jd-wallet-sdk/lib/utils/device-env';
import {setSessionStorage, getSessionStorage, removeSessionStorage} from '../utils/sessionStorage';
import perfect from '../utils/perfect';
import Draggabilly from 'draggabilly'

// 帮助反馈 & 底部关注我
class HelpFeedback extends Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      showFollowMe: props.showFollowMe, // 是否显示底部"关注我"按钮浮层
      showCode: false // 默认不显示遮罩和二维码
    };
    this.followMe = this.followMe.bind(this);
    this.closeCode = this.closeCode.bind(this);

    this.rootUrl = perfect.getLocationRoot() +'images/';
  }

  componentDidMount(){
    //"关注我"添加拖动效果
    const {btnFollowMe} = this.refs;
    if (!btnFollowMe) return;

    //获取记录位置信息
    const {rememberPos} = this.props;
    let {top, left} = {top: window.innerHeight - 120, left: window.innerWidth - 60};
    let hongbaoFollowMeButton = getSessionStorage('hongbaoFollowMeButton');
    if (hongbaoFollowMeButton) {
      if (rememberPos) {
        hongbaoFollowMeButton = perfect.parseJSON(hongbaoFollowMeButton) || {};
        top = hongbaoFollowMeButton.top;
        left = hongbaoFollowMeButton.left;
      } else {
        removeSessionStorage('hongbaoFollowMeButton');
      }
    }
    btnFollowMe.style.top = `${top}px`;
    btnFollowMe.style.left = `${left}px`;

    //初始化"关注我"按钮
    const draggabilly = new Draggabilly(btnFollowMe, {
      containment: true
    });
    draggabilly.on('staticClick', () => {})
      .on('dragStart', () => {});
    draggabilly.on('dragEnd', () => {
      if (rememberPos) {
        top = parseFloat(btnFollowMe.style.top);
        left = parseFloat(btnFollowMe.style.left);
        setSessionStorage('hongbaoFollowMeButton', `{"left":${left},"top":${top}}`);
      }
    });
  }

  followMe(e) {
    //阻止冒泡事件会导致fixed穿透&微信中二次drag失败问题
    e.preventDefault();
    // e.stopPropagation();
    // e.nativeEvent.preventDefault();
    // e.nativeEvent.stopPropagation();

    this.setState({showCode: true});
  }

  closeCode() {
    this.setState({showCode: false});
  }

  render() {
    const {showCode, showFollowMe} = this.state;

    return (
      <div className="hb-helpfeedback">
        <div className="hb-helpfeedback-wrap text-center" style={{display: showCode?'block':'none'}}>
          <div className="hb-code-close">
            <img className="hb-help-code" src={this.rootUrl + "wallet-hb-code.png"} alt="" />
            <img className="hb-help-close"
               onTouchTap={this.closeCode}
               src={this.rootUrl + "close.png"} alt="" />
          </div>
        </div>
        {showFollowMe && deviceEnv.inWx ?
          (<a className="hb-follow-me"
              href="#"
              ref="btnFollowMe"
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

HelpFeedback.defaultProps = {
  showFollowMe: false,
  rememberPos: true
};

HelpFeedback.propTypes = {
  showFollowMe: PropTypes.bool, //是否显示"关注我"按钮浮层
  rememberPos: PropTypes.bool //是否记忆历史位置
};

export default HelpFeedback;
