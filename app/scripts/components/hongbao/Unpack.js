import React, {Component, PropTypes} from 'react';
import Modal from 'reactjs-modal';
import callApi from '../../fetch';
import {HONGBAO_INVALID_STATUS, HONGBAO_TITLE} from '../../constants/common';

class Unpack extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      unpackModal: false, //拆红包弹框
      hongbaoStatus: null, //红包状态
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
    const {id, thirdAccId, indexActions} = this.props;
    // id 表示红包 id
    const body = {
      identifier: id,
      accountType: 'WECHAT',
      thirdAccId
    };

    callApi({url, body}).then(
      ({json, response}) => {
        const {status, user} = json.data;
        if (HONGBAO_INVALID_STATUS.indexOf(status) !== -1) {
          if (status === 'NEED_PAY') {
            indexActions.setErrorMessage('该红包还未支付！');
          } else {
            indexActions.setErrorMessage('改红包不存在或已被删除');
          }
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
    const {hongbaoStatus} = this.state;
    const {id, thirdAccId} = this.props;
    if (hongbaoStatus === 'HAS_RECEIVE') {
      //FIXME 线上环境换成 replace
      this.context.router.push(`/hongbao/detail/${id}/${thirdAccId}`);
      return;
    }
    const url = 'receive';
    const body = {
      identifier: id,
      accountType: 'WECHAT',
      thirdAccId
    };

    callApi({url, body}).then(
      ({json, response}) => {
        //FIXME 线上环境换成 replace
        this.context.router.push(`/hongbao/detail/${id}/${thirdAccId}`);
      },
      (error) => {

      }
    );
  }

  hongbaoDetail() {
    const {id, thirdAccId} = this.props;
    this.context.router.push(`/hongbao/detail/${id}/${thirdAccId}`);
  }

  modalBody() {
    const {user, hongbaoStatus} = this.state;
    const {face, nickname, title} = user || {};

    let hongbaoTitle = null;
    /**
     NEED_PAY 需要支付
     OK 可以
     RECEIVE_COMPLETE 红包被领取完成
     EXPIRED 红包过期
     FAIL 其他未知状态
     HAS_RECEIVE 已经领取过
     REDBAG_NOT_FOUND  红包不存在
     */
    /*eslint-disable indent*/
    switch (hongbaoStatus) {
      case 'OK':
      case 'HAS_RECEIVE':
        hongbaoTitle = (
          <h2 className="m-t-2">{title || HONGBAO_TITLE}</h2>
        );
        break;
      case 'RECEIVE_COMPLETE':
        hongbaoTitle = (
          <h2 className="m-t-2">手慢了，红包派完了</h2>
        );
        break;
      case 'EXPIRED':
        hongbaoTitle = (
          <h2 className="m-t-2">该红包已超过24小时。如已领取，可在“我的红包”中查看</h2>
        );
        break;
      default:
        hongbaoTitle = null;
        break;
    }

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
          {hongbaoTitle}
        </div>
        {
          hongbaoStatus !== 'RECEIVE_COMPLETE' ? (
            <div className="hb-btn-circle flex-items-middle flex-items-center" onTouchTap={this.unpack}>開</div>
          ) : null
        }
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
    return (
      <article>
        {this.renderModal()}
      </article>
    );
  }
}

Unpack.contextTypes = {
  router: PropTypes.object.isRequired
};

Unpack.propTypes = {
  id: PropTypes.string,
  thirdAccId: PropTypes.string,
  indexActions: PropTypes.object
};

export default Unpack;
