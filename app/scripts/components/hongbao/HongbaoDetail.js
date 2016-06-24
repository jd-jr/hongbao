import React, {Component, PropTypes} from 'react';
import Modal from 'reactjs-modal';
import callApi from '../../fetch';
import HongbaoInfo from './HongbaoInfo';
import {HONGBAO_VALID_STATUS, HONGBAO_TITLE} from '../../constants/common';

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
    this.hongbaoDetail = this.hongbaoDetail.bind(this);
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
        this.context.router.replace(`/hongbao/detail/view/${id}`);
      },
      (error) => {

      }
    );
  }

  hongbaoDetail() {
    const {id} = this.props;
    this.context.router.replace(`/hongbao/detail/view/${id}`);
  }

  modalBody() {
    const {user, hongbaoStatus} = this.state;
    const {face, nickname, title} = user || {};
    return (
      <div className="hb-ellipse-arc-mask">
        <div className="hb-ellipse-arc-flat text-center">
          <section className="m-t-2">
            <div>
              <img className="img-circle img-thumbnail hb-figure" src={face} alt=""/>
            </div>
            <div className="m-t-1">{nickname}</div>
            <div>发了一个实物红包</div>
          </section>
          <h2 className="m-t-2">{hongbaoStatus === 'OK' ? (title || HONGBAO_TITLE) : '手慢了，红包派完了'}</h2>
        </div>
        {hongbaoStatus === 'OK' ?
          (<div className="hb-btn-circle flex-items-middle flex-items-center" onTouchTap={this.unpack}>開</div>)
          : null}

        <div className="hb-luck-link" onTouchTap={this.hongbaoDetail}>
          看看大家的手气
        </div>
      </div>
    );
  }

  renderModal() {
    const {unpackModal} = this.state;
    let modal;
    if (unpackModal) {
      modal = (
        <Modal
          visible={unpackModal}
          className="hb-modal"
          bodyStyle={{height: '35rem'}}
        >
          {this.modalBody()}
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
