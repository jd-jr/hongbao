/**
 * 选择省市区县
 */
import React, {Component, PropTypes} from 'react'
import {bindActionCreators} from 'redux'
import { connect } from 'react-redux'
import * as actions from '../../actions/userAddressList'
import callApi from '../../fetch/'

class SelectCity extends Component{

  constructor( props ){
    super( props );
    this.state = {
      list:[],
      type:0
    }
    this.areaTypes = [
      {
        search:'getProvices',
        key:'province',
      },{
        search: 'getCitys',
        key:'city'
      },{
        search: 'getCountys',
        key:'county'
      },{
        search: 'getTowns',
        key:'town'
      }

    ];
    this.fullAddress = '';
    this.sltInfo = {

    };

  }

  componentDidMount(){
    var that = this;
    var _index = this.state.type;
    var methodName = this.areaTypes[_index].search;
    this.getNextList(0,methodName)
      .then(function (res){
        console.log(res, 'sdf')
        that.setState({
          list:res.json.data,
          type:++_index
        })
      })

  }
  getNextList(areaId, methodName){
    return callApi({
      url:'user/address/getarealist',
      body:{
        areaId:areaId+'',
        methodName
      }
    })
  }
  showNextList(item, e){
    const { updateTmpUserAddress } = this.props;
    var that = this;
    var _index = this.state.type;
    var methodName = this.areaTypes[_index].search;

    var key = that.areaTypes[_index-1].key;

    this.getNextList(item.id,methodName)
      .then(function (res){
        if( res.json.data && _index<3){

          console.log(key, 'key')
          that.setState({
            list:res.json.data,
            type:++_index
          })
          that.sltInfo[key+'Name'] = item.name;
          that.sltInfo[key+'Id'] = item.id;
          that.fullAddress+=item.name;
        }else{
          //选择完成了
          that.sltInfo[key+'Name'] = item.name;
          that.sltInfo[key+'Id'] = item.id;
          that.fullAddress+=item.name;
          updateTmpUserAddress({
            fullAddress:{
              val: that.fullAddress,
              valid:1
            }
          })
          updateTmpUserAddress({
            sltInfo: that.sltInfo
          })

          window.history.go(-1)
        }

      })
  }
  componentWillUnMount(){


  }

  render(){
    var list = this.state.list;
    var that = this;
    console.log(list, 'list')
    return (
      <div className="address-list-panel">
        {
          list.map(function (item, index){
            return (
              <div className="item" key={item.id} onClick={that.showNextList.bind(that, item)}>{item.name}</div>
            )
          })
        }
      </div>
    );
  }

}


function mapStateToProps( state ){
  return {
    tmpUserAddress: state.tmpUserAddress
  }
}
SelectCity.contextTypes = {
  router: PropTypes.object.isRequired,
};
function mapDispatchToProps( dispatch ){
  return bindActionCreators(actions, dispatch);
}
export default connect(mapStateToProps, mapDispatchToProps)(SelectCity);
