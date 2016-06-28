import React, {Component, PropTypes} from 'react';
import Modal from 'reactjs-modal';
import prefect from '../../utils/perfect';
import walletApi from 'jd-wallet-sdk';
import {HONGBAO_TITLE} from '../../constants/common';

class Initiate extends Component {
  constructor(props) {
    super(props);
    const {status} = this.props;
    this.state = {
      success: status === 'true',
      visible: true
    };

    this.sponsor = this.sponsor.bind(this);
    this.onClose = this.onClose.bind(this);
  }

  //发红包
  sponsor() {
    //调起分享
    const urlRoot = prefect.getLocationRoot();
    const {identifier, title, skuName} = this.props;
    walletApi.share({
      url: `${urlRoot}hongbao/detail/${identifier}`,
      title: title || HONGBAO_TITLE,
      desc: skuName,
      channel: 'WX',
      callback: (status) => {
        if (status === 'SUCCESS') {
          this.setState({
            visible: false
          });
          //回到首页
          this.context.router.replace('/');
        }
      }
    });
  }

  onClose(e) {
    this.setState({
      visible: false
    });
    //回到首页
    this.context.router.replace('/');
  }

  render() {
    const {success, visible} = this.state;
    if (success) {
      return (
        <Modal
          visible={visible}
          className="hb-modal"
          bodyStyle={{height: '32rem'}}
        >
          <div className="hb-ellipse-arc-mask">
            <div className="hb-ellipse-arc-flat flex-items-middle flex-items-center flex">
              <div>
                <h2>红包已包好</h2>
                <h4>实物和现金红包</h4>
              </div>
            </div>
            <div className="hb-btn-circle flex-items-middle flex-items-center" onTouchTap={this.sponsor}>发红包</div>
          </div>
        </Modal>
      );
    }

    if (visible) {
      const footer = (
        <div className="text-center">
          <button className="btn btn-secondary" onClick={this.onClose}>
            确认
          </button>
        </div>
      );

      return (
        <Modal
          visible={visible}
          style={{width: '70%'}}
          bodyStyle={{height: '5rem'}}
          onClose={this.onClose}
          title="支付结果"
          footer={footer}
        >
          <div className="text-center">支付失败</div>
        </Modal>
      );
    }

    return null;
  }
}

Initiate.propTypes = {
  skuName: PropTypes.string,
  title: PropTypes.string,
  identifier: PropTypes.string,
  status: PropTypes.string,
};

Initiate.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default Initiate;
