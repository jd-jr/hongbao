/**
 * 用户的收获地址列表
 *
 */

import React, {Component, PropTypes} from 'react'
import {bindActionCreators} from 'redux'
import { connect } from 'react-redux'
import * as actions from '../../actions/userAddressList.js'

import callApi from '../../fetch/'

class UserAddressList extends Component {
  constructor(props) {
    super(props);

  }

  componentDidMount() {
    const {address, setUserAddressList} = this.props;
    callApi({
      url: 'user/address/list',
      body:{
        jdPin:"duobaodao3"
      }
    }).then(function (res){
      console.log(res, '=====>')
      setUserAddressList(res.json.data||[])
    })

  }

  componentWillUnMount() {

  }
  goAddAddress(){
    console.log(this.context)
    this.context.router.push({
      pathname:'addaddress'
    })
  }
  //设置成默认地址
  setDefault(index, item){
    const { setDefaultAddress } = this.props;
    if(item.addressDefault){
      return;
    }
    callApi({
      url:'user/address/setdefault',
      body:{
        jdPin:"duobaodao3",
        addressId: item.id+""
      }
    }).then(function (res){
      console.log( res, '=====-')
      setDefaultAddress(item.id);
    })
  }
  editAddress(index, item){

  }
  deleteAddress(index, item){
    const { deleteUserAddress } = this.props;
    callApi({
      url:'user/address/delete',
      body:{
        jdPin:"duobaodao3",
        addressId: item.id+""
      }
    }).then(function (res){
      console.log( res, '=====-')
      deleteUserAddress(index)
    })
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
            address.map(function (item, index){
              return(
                <div key={item.id}>
                  <div className=" hb-bd-t row hb-bg-white item">
                    <div className="col-5 ">{item.name}</div>
                    <div className="col-10 ">{item.mobile}</div>
                    <div className="col-24 hb-gray-l-t address-text text-truncate-2">
                      {item.fullAddress}
                    </div>
                  </div>
                  <div className="row hb-bg-white opt-item hb-bd-t hb-bd-b slt-radio-panel">
                    <i className="line-v"></i>

                    <label forHtml="slt-circle0" onClick={that.setDefault.bind(that, index, item)} className={(item.addressDefault?'checked':'')+" col-3"}></label>
                    <span className="col-8 push-2 hb-gray-l-t" onClick={that.setDefault.bind(that, index, item)}>设为默认</span>


                    <span className="col-8 goods-state">无货</span>
                    <span className="col-4 text-center"  onClick={that.editAddress.bind(that, index, item)}>编辑</span>
                    <span className="col-4 text-center" onClick={that.deleteAddress.bind(that, index, item)}>删除</span>
                  </div>
                </div>
              );
            })
          }
        </div>



      </div>


    );
  }
}

function mapStateToProps( state ){
  return {
    address: state.address
  }
}
UserAddressList.contextTypes = {
  router: PropTypes.object.isRequired,
};
function mapDispatchToProps( dispatch ){
  return bindActionCreators(actions, dispatch);
}
export default connect(mapStateToProps, mapDispatchToProps)(UserAddressList);

