/**
 * 用户的收获地址列表
 *
 */

import React, {Component, PropTypes} from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {assign} from  'lodash'
import Modal from 'reactjs-modal'
import className from 'classnames'

import * as actions from '../../actions/userAddressList'

import callApi from '../../fetch/'

class UserAddressList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showTip: false,
      showActionTip: false,
      actionTip: '确认使用该收货地址？'
    }
  }

  componentDidMount() {
    const {address, setUserAddressList} = this.props;
    var that = this;
    //this.toggleTipState()
    if(!address.length){
      callApi({
        url: 'user/address/list',
        body: {
          jdPin: "duobaodao3"
        }
      }).then(function (res) {
        console.log(res, '=====>')
        var list = res.json.data || []
        setUserAddressList(list)
        that.checkGoodsStock(list)
      })
    }

  }

  checkGoodsStock(list) {
    const {setUserAddressList, updateUserAddress} = this.props;
    var that = this;
    //检测收货地址
    list.forEach(function (item, index) {
      callApi({
        url: 'user/address/areastock',
        body: {
          jdPin: "duobaodao3",
          addressId: item.id,
          skuId: '100012'//需要从store中获取
        }
      }).then(function (res) {
        var stock = res.json.data;
        list[index].stock = stock;
        updateUserAddress({index, addedAddress: list[index]});
        if (item.addressDefault == true && !stock) {
          that.toggleTipState();
        }
      }, function (res) {
        list[index].stock = false;
        if (item.addressDefault == true) {

          that.toggleTipState();
        }
        updateUserAddress({index, addedAddress: list[index]});

      })
    })

  }

  componentWillUnMount() {

  }

  goAddAddress() {
    const {resetTmpUserAddress} = this.props;
    resetTmpUserAddress()
    this.context.router.push({
      pathname: 'addaddress'
    })
  }

  //设置成默认地址
  setDefault(index, item) {
    const {setDefaultAddress} = this.props;
    if (item.addressDefault) {
      return;
    }
    callApi({
      url: 'user/address/setdefault',
      body: {
        jdPin: "duobaodao3",
        addressId: item.id + ""
      }
    }).then(function (res) {
      console.log(res, '=====-')
      setDefaultAddress(item.id);
    })
  }

  /**
   * 跳转编辑地址组件
   * @param index 要编辑的地址在地址数组中的下标
   * @param item  当前编辑的地址的信息
   *
   * 1. 先去初始化临时地址数据
   */
  editAddress(index, item) {
    const {initTmpUserAddress} = this.props;
    var tmp = assign({}, item, {
      name: {
        val: item.name,
        valid: 1
      },
      mobile: {
        val: item.mobile,
        valid: 1
      },
      fullAddress: {
        val: item.fullAddress,
        valid: 1
      },
      addressDetail: {
        val: item.addressDetail,
        valid: 1
      },
    })
    initTmpUserAddress(tmp)
    this.context.router.push({
      pathname: 'editaddress/' + index
    })
  }

  deleteAddress(index, item) {
    const {deleteUserAddress} = this.props;
    callApi({
      url: 'user/address/delete',
      body: {
        jdPin: "duobaodao3",
        addressId: item.id + ""
      }
    }).then(function (res) {
      console.log(res, '=====-')
      deleteUserAddress(index)
    })
  }

  //切换显示删除 等操作提示弹窗
  toggleActionTipState() {

    var tipState = this.state.actionShowTip;
    this.setState({
      actionShowTip: !tipState
    })
  }

  //切换显示无货提示弹窗
  toggleTipState() {
    var actionState = this.state.showTip;
    this.setState({
      showTip: !actionState
    })
  }

  //展示操作提示
  showTipWhenAction(type, index, item) {
    var tipMsg = '';
    var callback = null;


    switch (type) {
      case 'SET_DFT':
        callback = this.setDefault.bind(this,index, item)
        tipMsg = '确认将该地址设置成默认地址吗?'
        break;
      case 'DELETE':
        callback = this.deleteAddress.bind(this,index, item);
        tipMsg = '确定删除该地址吗?'
        break;
      case 'USE':
        if(!item.stock){
          this.toggleTipState();
          return;
        }
        callback = this.sureUseAddress.bind(this,index, item);
        tipMsg = '确定使用该地址吗?'
        break;
      default:
        break;
    }

    this.setState({
      actionTip:tipMsg,
      sureAction: callback

    })
    this.toggleActionTipState();

  }

  //展示是否有货
  showStock(item) {
    console.log(item, 'item')
    if (item.stock == undefined) {
      return <span className="col-8 goods-state">获取中...</span>;
    }
    if (item.stock === true) {
      return <span className="col-8 goods-state">有货</span>;
    }
    if (item.stock === false) {
      return <span className="col-8 goods-state text-red">无货</span>;
    }
  }

  //确定使用这个地址作为收货地址
  sureUseAddress(index, item) {
    var that = this;
    if (item.stock) {
      //确定下单了??
      this.generateOrder(item)
        .then(function (){
          that.context.router.push({
            pathname:'/m-hongbao'
          })
        })
    } else {
      //提示
      this.toggleTipState();
    }
  }
  //点击确认按钮
  sureAction(){
    this.state.sureAction();
    this.toggleActionTipState();
  }
  generateOrder(item){
    var params = {
      "giftRecordId":"9",
      "receiverName":item.name,
      "receiverPhone":item.mobile,
      "receiverEmail":item.email,
      "receiverProvinceCode":item.provinceId,
      "receiverProvinceName":item.provinceName,

      "receiverCityName":"收货人市区编码",
      "receiverCountryCode":"收货人区县编码",
      "receiverCountryName":"收货人区县名称",
      "receiverAddresss":"收货人详细地址",
      "receiverZipCode":""
    }
    item.cityName&&(params.receiverCityName=item.cityName);
    item.cityId&&(params.receiverCityName=item.cityId);
    item.countyId&&(params.receiverCountryCode=item.countyId);
    item.countyName&&(params.receiverCountryName=item.countyName);
    item.townId&&(params.receiverTownCode=item.townId);
    item.townName&&(params.receiverTownName=item.townName);

    item.fullAddress&&(params.receiverAddresss=item.fullAddress);

    return callApi({
      url:'giftRecordOrder/createOrderAddress',
      body:params
    })
  }

  //等待补货
  waitForGoods(){
    this.toggleTipState()
  }
  render() {
    const {
      address
    } = this.props;
    var that = this;


    return (
      <div className="hb-address-panel">


        <div className="hb-bd-t hb-bd-b row hb-bg-white item">
          <div className="col-21" onClick={this.goAddAddress.bind(this)}>新建收货地址</div>
          <div className="col-3  arrow-hollow-right"></div>
        </div>
        <div>
          {
            address.map(function (item, index) {
              return (
                <div key={item.id}>
                  <div className=" hb-bd-t row hb-bg-white item" onClick={that.showTipWhenAction.bind(that,'USE',index, item)}>
                    <div className="col-6 text-truncate">{item.name}</div>
                    <div className="col-10 ">{item.mobile}</div>
                    <div className="col-24 hb-gray-l-t address-text text-truncate-2">
                      {item.fullAddress}
                    </div>
                  </div>
                  <div className="row hb-bg-white opt-item hb-bd-t hb-bd-b slt-radio-panel">
                    <i className="line-v"></i>

                    <label forHtml="slt-circle0" onClick={that.setDefault.bind(that, index, item)}
                           className={(item.addressDefault?'checked':'')+" col-3"}></label>
                    <span className="col-8 push-2 hb-gray-l-t"
                          onClick={that.showTipWhenAction.bind(that,'SET_DFT', index, item)}>设为默认</span>

                    {that.showStock(item)}

                    <span className="col-4 text-center" onClick={that.editAddress.bind(that, index, item)}>编辑</span>
                    <span className="col-4 text-center" onClick={that.showTipWhenAction.bind(that,'DELETE', index, item)}>删除</span>
                  </div>
                </div>
              );
            })
          }
        </div>


        <div className={className({
          "tip-mask": true,
           "hb-hidden": !this.state.showTip
        })}>
          <div className="tip-alert">

            <div className="text-center">
              <div className="hb-bd-b">
                <h2 className="hb-f-16 tip-item title">您所选择的收货地址无货</h2>
                <div className="hb-f-12 sub-title">您可以有如下选择</div>
              </div>
              <div className="text-red tip-item hb-bd-b" onClick={this.waitForGoods.bind(this)}>等待京东补货</div>
              <div className="text-red tip-item" onClick={this.toggleTipState.bind(this)}>取消</div>
            </div>
          </div>
        </div>

        <div className={className({
          "tip-mask": true,
           "hb-hidden": !this.state.actionShowTip
        })}>
          <div className="tip-alert">

            <div className="text-center">
              <div className="hb-bd-b tip-msg">
                {this.state.actionTip}
              </div>
              <div className="btn-panel">
                <a href="javascript:;" className="btn-cancel text-red tip-item hb-bd-r" onClick={this.toggleActionTipState.bind(this)}>取消</a>
                <a href="javascript:;" className="btn-sure text-red tip-item" onClick={this.sureAction.bind(this)}>确定</a>
              </div>
            </div>
          </div>
        </div>


      </div>


    );
  }
}

function mapStateToProps(state) {
  return {
    address: state.address
  }
}
UserAddressList.contextTypes = {
  router: PropTypes.object.isRequired,
};
function mapDispatchToProps(dispatch) {
  return bindActionCreators(actions, dispatch);
}
export default connect(mapStateToProps, mapDispatchToProps)(UserAddressList);

