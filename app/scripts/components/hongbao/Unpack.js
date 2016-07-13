import React, {Component, PropTypes} from 'react';
import Modal from 'reactjs-modal';
import callApi from '../../fetch';
import {HONGBAO_INVALID_STATUS, HONGBAO_TITLE} from '../../constants/common';
import perfect from '../../utils/perfect';
import {setSessionStorage, getSessionStorage} from '../../utils/sessionStorage';

class Unpack extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      unpackModal: false, //拆红包弹框
      hongbaoStatus: null, //红包状态
      user: null, //用户信息
      unpackStatus: false //防止重复提交
    };
    this.unpack = this.unpack.bind(this);
    this.hideUnpack = this.hideUnpack.bind(this);
    this.clientWidth = document.documentElement.clientWidth;
  }

  componentDidMount() {
    this.validateHongbao();
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
    const {identifier, indexActions, showDetail} = this.props;
    const accountType = perfect.getAccountType();
    const thirdAccId = perfect.getThirdAccId();
    // id 表示红包 id
    const body = {
      identifier,
      accountType,
      thirdAccId
    };

    callApi({url, body}).then(
      ({json, response}) => {
        const {status, user} = json.data;
        if (HONGBAO_INVALID_STATUS.indexOf(status) !== -1) {
          if (status === 'NEED_PAY') {
            indexActions.setErrorMessage('该红包还未支付！');
          } else if (status === 'REDBAG_NOT_FOUND') {
            indexActions.setErrorMessage('该红包不存在或已被删除');
          }
        } else {
          //如果领取过，直接打开
          if (status === 'HAS_RECEIVE') {
            showDetail(true);
          } else {
            this.setState({
              unpackModal: true,
              hongbaoStatus: status,
              user
            }, () => {
              showDetail(true);
            });
          }
        }
      },
      (error) => {

      }
    );
  }

  // 拆开红包
  unpack(e) {
    //防点透处理
    e.nativeEvent.preventDefault();
    e.nativeEvent.stopPropagation();
    setTimeout(() => {
      this.setState({
        unpackModal: false, //隐藏红包
      });
    }, 100);

    if (this.state.unpackStatus) {
      return;
    }
    //防重处理
    this.setState({
      unpackStatus: true,
    });
    const {hongbaoStatus} = this.state;
    const {identifier} = this.props;
    const accountType = perfect.getAccountType();
    const thirdAccId = perfect.getThirdAccId();
    if (hongbaoStatus === 'HAS_RECEIVE') {
      this.hideUnpack();
      return;
    }
    const url = 'receive';
    const body = {
      identifier,
      accountType,
      thirdAccId
    };

    callApi({url, body}).then(
      ({json, response}) => {
        this.hideUnpack(true);
      },
      (error) => {
        this.hideUnpack(true);
      }
    );
  }

  /**
   * 隐藏拆红包弹框
   * @param reLoad 如果为 true 则重新加载红包详情数据
   */
  hideUnpack(reLoad) {
    const {hongbaoDetailAction, identifier, showDetail} = this.props;
    this.setState({
      unpackStatus: false
    });
    showDetail();

    if (reLoad) {
      let body = {
        identifier
      };
      hongbaoDetailAction.clearHongbaoDetail();
      hongbaoDetailAction.clearParticipant();
      hongbaoDetailAction.getParticipantList(body);

      const accountType = perfect.getAccountType();
      const thirdAccId = perfect.getThirdAccId();
      body = {
        identifier,
        accountType,
        thirdAccId
      };

      hongbaoDetailAction.getHongbaoDetail(body)
    }
  }

  // 红包弹框内容
  modalBody() {
    const {user, hongbaoStatus, sku} = this.state;
    const {face, nickname, title} = user || {};
    const {skuIcon, skuName} = sku || {};

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
          <h2 className="m-t-1 text-truncate-2">{title || HONGBAO_TITLE}</h2>
        );
        break;
      case 'RECEIVE_COMPLETE':
        hongbaoTitle = (
          <h2 className="m-t-1 text-truncate-2">手慢了，红包派完了</h2>
        );
        break;
      case 'EXPIRED':
        hongbaoTitle = (
          <h2 className="m-t-1 text-truncate-2">该红包已超过24小时。如已领取，可在“我的红包”中查看</h2>
        );
        break;
      default:
        hongbaoTitle = null;
        break;
    }

    return (
      <div className="hb-ellipse-arc-mask">
        <div className="hb-ellipse-arc-flat text-center">
          <section className="m-t-0-5">
            <div>
              <img className="img-circle img-thumbnail hb-figure" src={face} alt=""/>
            </div>
            <div className="m-t-1">{nickname}</div>
            <div>发了一个京东红包</div>
          </section>
          <section className="hb-product-wrap row" style={{minWidth: `${this.clientWidth * 0.7}px`}}>
            <div className="col-7 text-left">
              <img className="img-circle img-thumbnail hb-figure" src={skuIcon} alt=""/>
            </div>
            <div className="col-17 text-truncate-2 product-name">{skuName}</div>
          </section>

          {hongbaoTitle}
        </div>
        {
          hongbaoStatus !== 'RECEIVE_COMPLETE' && hongbaoStatus !== 'EXPIRED' ? (
            <div className="hb-btn-circle flex-items-middle flex-items-center font-weight-bold"
                 onTouchTap={this.unpack}>開</div>
          ) : null
        }
        <div className="hb-luck-link" onTouchTap={this.hideUnpack}>
          看看大家的手气
        </div>
      </div>
    );
  }

  renderModal() {
    const {unpackModal} = this.state;
    let modal;
    modal = (
      <Modal
        visible={unpackModal}
        className="hb-modal"
        bodyStyle={{height: '35rem'}}
        animation
        maskAnimation
      >
        {this.modalBody()}
      </Modal>
    );
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
  identifier: PropTypes.string,
  indexActions: PropTypes.object,
  showDetail: PropTypes.func,
  hongbaoDetailAction: PropTypes.object,
};

export default Unpack;
