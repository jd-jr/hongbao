/**
 * 用户的收获地址列表
 *
 */
import React, {Component, PropTypes} from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import * as actions from '../../actions/userAddressList'
import className from 'classnames'
import {assign} from 'lodash'
import callApi from '../../fetch/'

//require('./style.css');
class Logistics extends Component {
  constructor(props) {
    super(props);
    this.state = {
      detail:[],
      orderId: '',
      phone:'',
      customerName:'',
      address:''
    }
  }

  componentWillMount() {


  }

  componentDidMount() {
    var that = this;
    const { params ,indexActions} = this.props;
    callApi({
      url:'http://10.13.84.211/redbag/giftRecordOrder/logistics',
      body:{
        gifRecordId:params.giftRecordId
      }
    }).then(function (res){
      console.log(res.json, '===>')
      that.setState(res.json.data);
    }, function (res){
      var msg = res.json&&res.json.msg||'网络开小差了!';
      indexActions.setErrorMessage(msg)
    })
  }

  componentWillUnMount() {

  }

  render() {
    var infoList = this.state.detail;

    return ( <div>
      <div className="user-info-panel hb-bg-white hb-bd-b">
        <div className="name-mobile">
          <span className="text-truncate">{this.state.customerName}</span>
          <span>{this.state.phone}</span>
        </div>
        <div className="address-panel">
          <span className="coordinates-icon"></span>
          <span>{this.state.address}</span>
        </div>
      </div>
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
        <div className="new-order-flow new-p-re">

          <ul className="new-of-storey">
            {
              infoList.map(function (item, index){
                return (
                  <li key={index}>
                    <span className={className({
                      "icon": true,
                      "on": index == 0
                    })}></span>
                    <span>{item.info}&nbsp;&nbsp;{item.operator}</span>
                    <span>{item.operatorTime}</span>
                  </li>
                );
              })
            }
          </ul>
        </div>
      </div>
    </div>)
  }
}

function mapStateToProps(state) {
  return {

  }
}
Logistics.contextTypes = {
  router: PropTypes.object.isRequired,
};
function mapDispatchToProps(dispatch) {
  return bindActionCreators(actions, dispatch);
}
export default connect(mapStateToProps, mapDispatchToProps)(Logistics);


