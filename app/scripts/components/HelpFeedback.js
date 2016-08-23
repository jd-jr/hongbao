//noinspection JSUnresolvedVariable
import React, {Component, PropTypes} from 'react';
import walletApi from 'jd-wallet-sdk';
import deviceEnv from 'jd-wallet-sdk/lib/utils/device-env';
import perfect from '../utils/perfect';

// 帮助反馈 & 底部关注我
class HelpFeedback extends Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      showHelpFeed: props.showHelpFeed, // 默认显示顶部"帮助反馈"路由
      showFollowMe: props.showFollowMe, // 默认显示底部"关注我"
      showCode: false // 默认不显示遮罩和二维码
    };
    this.followMe = this.followMe.bind(this);
    this.closeCode = this.closeCode.bind(this);

    this.rootUrl = perfect.getLocationRoot() +'images/';
  }

  componentWillMount() {
    // setTimeout(() => {
    //   this.setState({
    //     showHelpFeed: true,
    //     showFollowMe: true
    //   });
    // }, 300);
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

  //在钱包中去掉帮助页面分享
  clearMenu() {
    if (deviceEnv.inJdWallet) {
      walletApi.setMenu();
    }
  }

  render() {
    const {showCode, showHelpFeed, showFollowMe} = this.state;

    return (
      <div>
        <div className="hb-mask hb-help-mask" style={{display: showCode?'block':'none'}}></div>
        <div className="hb-help-text text-center" style={{display: showCode?'block':'none'}}>
          <img className="hb-help-code" src={this.rootUrl + "wallet-hb-code.png"} alt="" />
          <img className="hb-help-close"
               onClick={this.closeCode}
               src={this.rootUrl + "close.png"} alt="" />
        </div>
        {showHelpFeed?
          (<a className="hb-help-feedback"
              onClick={this.clearMenu}
              href="http://m.wangyin.com/basic/findInfoByKeywordsH5?searchKey=%E4%BA%AC%E4%B8%9C%E7%BA%A2%E5%8C%85">帮助反馈</a>):null}

        {showFollowMe && deviceEnv.inWx ?
          (<a className="hb-follow-me"
              href="#"
              onClick={this.followMe}>
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
  showHelpFeed: PropTypes.bool,
  showFollowMe: PropTypes.bool
};

export default HelpFeedback;
