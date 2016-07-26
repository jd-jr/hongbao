import React, {Component, PropTypes} from 'react';
import deviceEnv from 'jd-wallet-sdk/lib/utils/device-env';
import perfect from '../../utils/perfect';
import emsCnpl from '../../../images/wallet-ems-cnpl.png';

class QrCode extends Component {
  constructor(props, context) {
    super(props, context);
    this.focusonQrCode = this.focusonQrCode.bind(this);
  }

  // 关注二维码
  focusonQrCode() {
    const {type} = this.props;
    //埋点
    perfect.setBuriedPoint(`hongbao_${type || 'receive'}_qrcode`);
  }

  render() {
    if (!deviceEnv.inWx) {
      return (
        <section className="hb-single row m-a-1 p-y-0-5">
          <div className="col-5 text-left p-a-0" onTouchTap={this.focusonQrCode}>
            <img className="img-fluid" src={emsCnpl} alt=""/>
          </div>
          <div className="col-19 flex flex-items-center flex-items-column">
            <div>关注京东钱包，及时查看红包信息！</div>
            <div className="text-muted">长按识别二维码</div>
          </div>
        </section>
      );
    }

    return null;
  }
}


QrCode.propTypes = {
  type: PropTypes.string,
};

export default QrCode;
