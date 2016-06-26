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
class AddAddress extends Component {
  constructor(props) {
    super(props);
    this.state = {}
    this.addressEntity = {}
    this.style ={
      color:'#999'
    }
  }

  componentWillMount() {
    const {tmpUserAddress} =this.props;
    this.setState(tmpUserAddress, function () {
      console.log(this.state, tmpUserAddress, 'nice')
    });

  }

  componentDidMount() {

  }

  componentWillUnMount() {

  }

  //将输入的值设置到state上
  setValue(type, e) {
    console.log(e.target.value, '=====')
    this.setState({
      [type]: {
        val: e.target.value,
        valid: -1
      }
    }, ()=> {
      console.log(this.state)
    })

  }

  //如果检测项不合法 提示错误
  showError(type, e) {
    const {updateTmpUserAddress} = this.props;
    if (type == 'addressDetail') {
      if (this.checkValid(type)) {
        this.setState({
          [type]: {
            val: e.target.value,
            valid: 1
          }
        })
        updateTmpUserAddress({
          addressDetail: {
            val: e.target.value,
            valid: 1
          }
        })
      } else {
        var val = e.target.value.replace(/^\s*|\s*$/, '')
        if (val == '') {
          this.setTipText(false, e);
        } else {
          this.setState({
            [type]: {
              val: e.target.value,
              valid: 0
            }
          })
        }
      }
    } else {
      if (!this.checkValid(type)) {
        this.setState({
          [type]: {
            val: e.target.value,
            valid: 0
          }
        })
      } else {
        this.setState({
          [type]: {
            val: e.target.value,
            valid: 1
          }
        })
        updateTmpUserAddress({
          [type]: {
            val: e.target.value,
            valid: 1
          }
        })
      }
    }
  }

  checkValid(type) {
    var val = this.state[type].val.replace(/^\s*|\s*$/, '');
    console.log(val)
    switch (type) {
      case 'name':
        return val.length > 0;
        break;
      case 'mobile':
        return (/^1[3578]\d{9}$/g).test(val);
        break;
      case 'addressDetail':
        return val.length > 0;
        break;
      default:
        return false;
        break;
    }
  }

  goSltCity() {
    const {initTmpUserAddress} = this.props;
    initTmpUserAddress(this.state)
    this.context.router.push({
      pathname: 'selectcity'
    })
  }

  setTipText(isInput, e) {
    var curValue = e.target.value.replace(/^\s*|\s*$/g, '');
    console.log(curValue == '', isInput)
    //刚输入的时候 置空提示文案 修改样式
    if (curValue == '请输入详细地址' && isInput == true) {
      this.setState({
        'addressDetail': {
          val: '',
          valid: -1
        }
      })
      this.style = {
        color:'#333'
      }
    } else if (curValue == '' && isInput == false) {
      this.setState({
        'addressDetail': {
          val: '请输入详细地址',
          valid: 0
        }
      })
      this.style = {
        color:'#999'
      }
    }

  }
  checkCanSub(){
    var t = this.props.tmpUserAddress;
    if( t.name.valid==1 && t.mobile.valid ==1 && t.fullAddress.valid == 1 && t.addressDetail.valid ==1 ){
      return true;
    }else{
      return false;
    }
  }
  //新增操作
  sureAction() {
    var addressEntity = this.generateParams();
    const {addUserAddress} = this.props;
    var that = this;
    if(!this.checkCanSub()){
      alert('信息不完整或有误');
      return;
    }
    callApi({
      url: 'user/address/save',
      body: {
        jdPin: 'duobaodao3',
        addressEntity
      }
    }).then(function (res) {
      var id = res.json.data;
      if (id) {
        var addedAddress = assign({}, addressEntity, {id})
        addUserAddress(addedAddress)
      }
      that.context.router.push({
        pathname: 'myaddress'
      })
    })

  }

  generateParams() {
    const {tmpUserAddress} = this.props;
    console.log(tmpUserAddress, 'sdf')
    var _ret = {
      addressDefault: false,
      name: tmpUserAddress.name.val,
      mobile: tmpUserAddress.mobile.val,
      fullAddress: tmpUserAddress.fullAddress.val + tmpUserAddress.addressDetail.val,
      addressDetail: tmpUserAddress.addressDetail.val
    };

    return assign({}, _ret, tmpUserAddress.sltInfo)
  }

  render() {
    var state = this.state;

    return (
      <div>
        <div className="mg-t-10 wg-address-panel">
          <div className="wg-address-item">
            <span className=" item-title">收货人</span>
            <div className=" item-input">
              <input type="text" placeholder="请输入姓名" value={state.name.val}
                     onChange={this.setValue.bind(this, 'name')}
                     onBlur={this.showError.bind(this, 'name')}/>
            </div>
            <i className={className({
              "error-icon ":true,
              "hb-hidden":(!this.state.name.valid==0)
            })}>x</i>
          </div>
          <div className="wg-address-item">
            <span className=" item-title">手机号码</span>
            <div className=" item-input">
              <input type="text" placeholder="手机号码"
                     value={state.mobile.val}
                     onChange={this.setValue.bind(this, 'mobile')}
                     onBlur={this.showError.bind(this, 'mobile')}/>
            </div>
            <i className={className({
              "error-icon ":true,
              "hb-hidden":(!this.state.mobile.valid==0)
            })}>x</i>
          </div>
          <div className="wg-address-item" onClick={this.goSltCity.bind(this)}>
            <span className=" item-title">所在省市</span>
            <div className=" item-input">
              <input type="text" disabled placeholder="请选择所在省市" value={state.fullAddress.val}/>
            </div>
            <i className="arrow-hollow-right"></i>
          </div>
          <div className="wg-address-item">
            <span className="fl item-title">详细地址</span>
            <div className="fl item-input">
              <textarea className="placeholder" style={this.style}
                        value={state.addressDetail.val}
                        onFocus={this.setTipText.bind(this, true)}
                        onChange={this.setValue.bind(this, 'addressDetail')}
                        onBlur={this.showError.bind(this, 'addressDetail')}></textarea>
            </div>
            <i className={className({
              "error-icon ":true,
              "hb-hidden":(!this.state.addressDetail.valid==0)
            })}>x</i>
          </div>
        </div>

        <a className="sure-btn" onClick={this.sureAction.bind(this)}>确定</a>

      </div>

    );
  }
}

function mapStateToProps(state) {
  return {
    tmpUserAddress: state.tmpUserAddress
  }
}
AddAddress.contextTypes = {
  router: PropTypes.object.isRequired,
};
function mapDispatchToProps(dispatch) {
  return bindActionCreators(actions, dispatch);
}
export default connect(mapStateToProps, mapDispatchToProps)(AddAddress);


