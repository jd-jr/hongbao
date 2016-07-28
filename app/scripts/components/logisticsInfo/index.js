/**
 * 用户的收获地址列表
 */
import React, {Component, PropTypes} from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import deviceEnv from 'jd-wallet-sdk/lib/utils/device-env';
import * as actions from '../../actions/userAddressList'
import className from 'classnames'
import {assign} from 'lodash'
import callApi from '../../fetch'
import errorHandler from '../../utils/errorHandler';
import Loading from '../../ui/Loading';
import perfect from '../../utils/perfect';

class Logistics extends Component {
  constructor(props) {
    super(props);
    this.state = {
      detail: [],
      orderId: '',
      phone: '',
      customerName: '',
      address: '',
      showConent: false,
      loading: true
    }
  }

  componentWillMount() {
    const {params, indexActions, setModalCloseCallback} = this.props;
    callApi({
      url: 'giftRecordOrder/logistics',
      body: {
        gifRecordId: params.giftRecordId
      }
    }).then((res) => {
      this.setState(assign({}, res.json.data, {showConent: true, loading: false}));
    }, (error) => {
      if (error.errorCode !== 'RBF100300') {
        this.setState({loading: false});
        setModalCloseCallback(() => {
          this.context.router.goBack();
        });
        const message = errorHandler(error);
        indexActions.setErrorMessage(message);
      }
    });
  }

  componentDidMount() {
    document.body.style.overflowY = 'auto';
    document.documentElement.style.overflowY = 'auto';
  }

  componentWillUnmount() {
    document.body.style.overflowY = 'hidden';
    document.documentElement.style.overflowY = 'hidden';
  }

  renderList(detail) {
    if (detail && detail.length > 0) {
      return (
        <div className="new-order-flow new-p-re">
          <ul className="new-of-storey">
            {
              detail.map((item, index) => {
                return (
                  <li key={index}>
                    <span className={className({
                      icon: true,
                      on: index === 0
                    })}></span>
                    <span>{item.info}&nbsp;&nbsp;{item.operator}</span>
                    <span>{item.operatorTime}</span>
                  </li>
                )
              })
            }
          </ul>
        </div>
      );
    }

    return (
      <div className="new-p-re">
        <ul className="new-of-storey">
          <li>
            <span className="icon on" style={{top: '18px'}}></span>
            <span>礼物领取成功，即将发出。</span>
            <span>{perfect.formatDate({time: new Date().getTime(), showYear: true})}</span>
          </li>
        </ul>
      </div>
    );
  }

  render() {
    const {detail, showConent, loading} = this.state;
    if (loading) {
      return (
        <Loading/>
      );
    }
    if (!showConent) {
      return null;
    }

    return (
      <div>
        {deviceEnv.inWx ? (
          <a style={{display: 'block'}} className="user-info-panel hb-bg-white hb-bd-b"
             href="https://qianbao.jd.com/p/page/download.htm">点击下载京东钱包，及时查看礼物配送信息！</a>
        ) : null}

        <div className="user-info-panel hb-bg-white hb-bd-b order-state-panel hb-bd-t">
          <div className="name-mobile">
            <span className="text-truncate">{this.state.customerName}</span>
            <span>{this.state.phone}</span>
          </div>
          <div className="address-panel">
            <span className="coordinates-icon"></span>
            <span>{this.state.address}</span>
          </div>
        </div>

        <div>
          <div className="order-state-panel hb-bg-white hb-bd-b hb-bd-t">
            <div>订单编号：{this.state.orderId}</div>
            <div>承运人：京东快递</div>
            <div className="hb-hidden">预计送达时间：2016-06-18</div>

            <div className="order-tip-panel hb-bd-t clearfix">
              <span className="info-tip-icon"></span>
              <span>如果您对奖品配送状态有疑问，请拨打电话95118咨询。</span>
            </div>
          </div>
          <div className="hb-bd-t order-info-panel">
            {this.renderList(detail)}
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {}
}
Logistics.contextTypes = {
  router: PropTypes.object.isRequired,
};

Logistics.propTypes = {
  params: PropTypes.object,
  indexActions: PropTypes.object,
  setModalCloseCallback: PropTypes.func
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators(actions, dispatch);
}
export default connect(mapStateToProps, mapDispatchToProps)(Logistics);


