import React, {Component, PropTypes} from 'react';
import Modal from 'reactjs-modal';
import callApi from '../../fetch';
import HongbaoInfo from './HongbaoInfo';
import {HONGBAO_VALID_STATUS} from '../../constants/common';

class HongbaoDetail extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      unpackModal: false, //拆红包弹框
      hongbaoStatus: null, //红包状态
      unpacked: props.view === 'view', //拆红包之后或者不需要弹出拆红包弹框
      user: null //用户信息
    };
    this.unpack = this.unpack.bind(this);
  }

  componentDidMount() {
    const {unpacked} = this.state;
    if (!unpacked) {
      this.validateHongbao();
    }
  }

  /**
   * 检测红包是否可以领取
   * 红包状态对应的返回结果字段 json.data，状态有以下几种
   NEED_PAY 需要支付
   OK 可以
   RECEIVE_COMPLETE 红包被领取完成
   EXPIRED 红包过期
   FAIL 其他未知状态
   HAS_RECEIVE 已经领取过
   REDBAG_NOT_FOUND  红包不存在
   */
  validateHongbao() {
    const url = 'prepare/receive';
    const {id} = this.props;
    // id 表示红包 id
    const body = {
      identifier: id
    };

    callApi({url, body}).then(
      ({json, response}) => {
        const {status, user} = json.data;
        if (HONGBAO_VALID_STATUS.indexOf(status) === -1) {
          alert(1);
        } else {
          this.setState({
            unpackModal: true,
            hongbaoStatus: status,
            user
          });
        }
      },
      (error) => {

      }
    );
  }

  // 拆开红包
  unpack() {
    const url = 'receive';
    const {id} = this.props;
    // id 表示红包 id
    const body = {
      identifier: id,
      accountType: 'WALLET',
      thirdAccId: Math.ceil(Math.random() * 1000000)
    };

    callApi({url, body}).then(
      ({json, response}) => {
        this.setState({
          unpacked: true,
          unpackModal: false
        });
      },
      (error) => {

      }
    );
  }

  renderModal() {
    const {unpackModal, user} = this.state;
    const {face, nickname} = user || {};
    let modal;
    if (unpackModal) {
      modal = (
        <Modal
          visible={unpackModal}
          className="hb-modal"
          bodyStyle={{height: '35rem'}}
        >
          <div className="hb-ellipse-arc-mask">
            <div className="hb-ellipse-arc-flat text-center">
              <section className="m-t-2">
                <div>
                  <img className="img-circle img-thumbnail hb-figure" src={face} alt=""/>
                </div>
                <div className="m-t-1">{nickname}</div>
                <div>发了一个实物红包</div>
              </section>
              <h2 className="m-t-2">我在京东钱包发起了个实物和现金红包，快来抢啊！</h2>
            </div>
            <div className="hb-btn-circle flex-items-middle flex-items-center" onTouchTap={this.unpack}>開</div>
          </div>
        </Modal>
      );
    }
    return modal;
  }

  render() {
    const {unpacked} = this.state;

    if (unpacked) {
      const {participantPagination, hongbaoInfo, hongbaoDetailAction, id} = this.props;
      const infoProp = {participantPagination, hongbaoInfo, hongbaoDetailAction, id};
      return (
        <HongbaoInfo {...infoProp}/>
      );
    }

    return (
      <article>
        {this.renderModal()}
      </article>
    );
  }
}

HongbaoDetail.contextTypes = {
  router: PropTypes.object.isRequired
};

HongbaoDetail.propTypes = {
  id: PropTypes.string,
  view: PropTypes.string,
  hongbaoInfo: PropTypes.object,
  participantPagination: PropTypes.object,
  hongbaoDetailAction: PropTypes.object,
};

export default HongbaoDetail;
