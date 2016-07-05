/**
 * 添加或修改地址
 */
import React, {Component, PropTypes} from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {assign, keys, trim} from 'lodash'
import * as actions from '../../actions/userAddressList'
import callApi from '../../fetch/'
import Loading from '../../ui/Loading';
import {getSessionStorage} from '../../utils/sessionStorage';

class AddAddress extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.sureAction = this.sureAction.bind(this);
    this.skuId = getSessionStorage('skuId');
    this.giftRecordId = getSessionStorage('giftRecordId');
  }

  componentWillMount() {
    const {tmpUserAddress, params} = this.props;
    this.setState(tmpUserAddress);

    if (params.index) {
      this.setState({
        tmpFullAddress: tmpUserAddress.fullAddress.val.replace(tmpUserAddress.addressDetail.val, '')
      });
    }
  }

  //将输入的值设置到state上
  setValue(type, e) {
    this.setState({
      [type]: {
        val: e.target.value,
        valid: -1
      }
    })
  }

  //如果检测项不合法 提示错误
  showError(type, e) {
    const {updateTmpUserAddress} = this.props;
    if (type === 'addressDetail') {
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
        const val = e.target.value.replace(/^\s*|\s*$/, '')
        if (val !== '') {
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
        });
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
    const val = this.state[type].val.replace(/^\s*|\s*$/, '');
    /*eslint-disable indent*/
    switch (type) {
      case 'name':
        return val.length > 0;
      case 'mobile':
        return (/^1[3-9]\d{9}$/g).test(val);
      case 'addressDetail':
        return val.length > 0;
      default:
        return false;
    }
  }

  goSltCity() {
    const {initTmpUserAddress} = this.props;
    initTmpUserAddress(this.state)
    this.context.router.push({
      pathname: 'selectcity'
    })
  }

  checkCanSub() {
    const t = this.props.tmpUserAddress;
    if (t.name.valid !== 1) {
      return '请输入姓名';
    }
    if (trim(this.refs.mobile.value) === '') {
      return '请输入手机号码';
    }
    if (t.mobile.valid !== 1) {
      return '您输入的手机号格式不正确，请重新输入';
    }
    if (t.fullAddress.valid !== 1) {
      return '请选择所在省市';
    }
    if (t.addressDetail.valid !== 1) {
      return '请输入详细地址';
    }
    return true;
  }

  //新增操作
  sureAction() {
    const addressEntity = this.generateParams();
    const {addUserAddress, updateUserAddress, params, indexActions} = this.props;
    const message = this.checkCanSub();
    if (message !== true) {
      indexActions.setErrorMessage(message);
      return;
    }

    //防重处理
    const {submitState} = this.state;
    if (submitState) {
      return;
    }
    this.setState({
      submitState: true
    });

    const {index} = params;
    const url = index ? 'user/address/update' : 'user/address/save';
    const body = index ? {
      addressId: addressEntity.id,
      addressEntity
    } : {
      addressEntity
    };

    let addedAddress;
    callApi({
      url,
      body,
      needAuth: true
    }).then((res) => {
      const addressId = index ? addressEntity.id : res.json.data;
      if (addressId) {
        addedAddress = assign({}, addressEntity, {addressId});
        if (index) {
          updateUserAddress({index, addedAddress});
        } else {
          addUserAddress(addedAddress);
        }

        //设置新增地址的货源状态
        return callApi({
          url: 'user/address/areastock',
          body: {
            addressId,
            skuId: this.skuId
          },
          needAuth: true
        });
      }
    }, (error) => {
      indexActions.setErrorMessage(error.message);
      this.setState({
        submitState: false
      });
    }).then((res) => {
      if (res) {
        const stock = res.json.data;
        addedAddress.stock = stock;
        updateUserAddress({index: index || 0, addedAddress});

        this.context.router.replace({
          pathname: '/myaddress'
        })
      }
    }, (error) => {
      //请求失败按照无货处理
      addedAddress.stock = false;
      updateUserAddress({index: index || 0, addedAddress});

      this.context.router.replace({
        pathname: '/myaddress'
      })
    });
  }

  generateParams() {
    const {tmpUserAddress, params} = this.props;
    const fullAddress = params.index ?
    this.state.tmpFullAddress + tmpUserAddress.addressDetail.val :
    tmpUserAddress.fullAddress.val + tmpUserAddress.addressDetail.val;

    const _ret = {
      addressDefault: false,
      name: tmpUserAddress.name.val,
      mobile: tmpUserAddress.mobile.val,
      fullAddress,
      addressDetail: tmpUserAddress.addressDetail.val
    };

    /*eslint-disable*/
    if (params.index) {
      for (let k in tmpUserAddress) {
        const _val = tmpUserAddress[k];
        if (k != null && !(({}).toString.call(_val) === '[object Object]')) {
          _ret[k] = _val;
        }
      }

      delete _ret.stock;
      delete _ret.tmpFullAddress;
    }

    return assign({}, _ret, tmpUserAddress.sltInfo)
  }

  render() {
    const state = this.state;
    const index = this.props.params.index;
    const fullAddress = index ? state.tmpFullAddress : state.fullAddress.val;

    return (
      <div>
        {
          state.submitState ? <Loading/> : null
        }
        <div className="mg-t-10 wg-address-panel">
          <div className="wg-address-item">
            <span className=" item-title">收货人</span>
            <div className=" item-input">
              <input className="hb-input" type="text" placeholder="请输入姓名" maxLength="20"
                     value={state.name.val}
                     onChange={this.setValue.bind(this, 'name')}
                     onBlur={this.showError.bind(this, 'name')}/>
            </div>
          </div>
          <div className="wg-address-item">
            <span className=" item-title">手机号码</span>
            <div className=" item-input">
              <input ref="mobile" className="hb-input" type="tel" placeholder="请输入手机号码" maxLength="11"
                     value={state.mobile.val}
                     onChange={this.setValue.bind(this, 'mobile')}
                     onBlur={this.showError.bind(this, 'mobile')}/>
            </div>
          </div>
          <div className="wg-address-item" onTouchTap={this.goSltCity.bind(this)}>
            <span className=" item-title">所在省市</span>
            <div className=" item-input">
              <input className="hb-input" type="text" readOnly placeholder="请选择所在省市"
                     value={fullAddress}/>
            </div>
            <i className="arrow-hollow-right"></i>
          </div>
          <div className="wg-address-item">
            <span className="fl item-title">详细地址</span>
            <div className="fl item-input">
              <textarea className="hb-textarea" placeholder="请输入详细地址" maxLength="40"
                        value={state.addressDetail.val}
                        onChange={this.setValue.bind(this, 'addressDetail')}
                        onBlur={this.showError.bind(this, 'addressDetail')}></textarea>
            </div>
          </div>
        </div>

        <a className="sure-btn" onTouchTap={this.sureAction}>确定</a>

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

AddAddress.propTypes = {
  tmpUserAddress: PropTypes.object,
  addUserAddress: PropTypes.func,
  updateUserAddress: PropTypes.func,
  updateTmpUserAddress: PropTypes.func,
  initTmpUserAddress: PropTypes.func,
  params: PropTypes.object,
  indexActions: PropTypes.object,
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators(actions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(AddAddress);


