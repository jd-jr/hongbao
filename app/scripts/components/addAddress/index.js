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

//添加和修改地址
class AddAddress extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: null,
      name: '',
      mobile: '',
      addressDetail: '',
      sltInfo: null, //省市区信息
      submitState: false, //提交状态
      addressDefault: false, //是否为默认地址
    };
    this.skuId = getSessionStorage('skuId');
    this.giftRecordId = getSessionStorage('giftRecordId');
    this.sureAction = this.sureAction.bind(this);
    this.setValue = this.setValue.bind(this);
    this.goSltCity = this.goSltCity.bind(this);
  }

  componentWillMount() {
    const {tmpUserAddress} = this.props;
    const {id, name, mobile, addressDetail, sltInfo, addressDefault} = tmpUserAddress;
    this.setState({id, name, mobile, addressDetail, sltInfo, addressDefault});
  }

  //将输入的值设置到state上
  setValue(type, e) {
    this.setState({
      [type]: e.target.value
    })
  }

  //进入省市列表
  goSltCity() {
    const {initTmpUserAddress} = this.props;
    initTmpUserAddress(this.state);
    this.context.router.push({
      pathname: 'selectcity'
    })
  }

  checkCanSub() {
    const {name, mobile, addressDetail, sltInfo} = this.state;

    if (name === '') {
      return '请输入姓名';
    }
    if (mobile === '') {
      return '请输入手机号码';
    }
    if (!(/^1[3-9]\d{9}$/g).test(mobile)) {
      return '您输入的手机号格式不正确，请重新输入';
    }

    if (!sltInfo || !sltInfo.provinceId) {
      return '请选择所在省市区';
    }

    if (addressDetail === '') {
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
      const id = index ? addressEntity.id : res.json.data;
      if (id) {
        addedAddress = assign({}, addressEntity, {id});
        if (index) {
          updateUserAddress({index, addedAddress});
        } else {
          addUserAddress(addedAddress);
        }
        //设置新增地址的货源状态
        return callApi({
          url: 'user/address/areastock',
          body: {
            addressId: id,
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

  //返回地址信息
  generateParams() {
    const {id, name, mobile, addressDetail, sltInfo, addressDefault} = this.state;

    const {cityName, countyName, provinceName, townName} = sltInfo;
    let provinceCity = provinceName + cityName + countyName + (townName || '');
    const _ret = {
      addressDefault,
      name,
      mobile,
      fullAddress: provinceCity + addressDetail,
      addressDetail
    };

    const {params} = this.props;
    const {index} = params;
    if (index) {
      _ret.id = id;
    }
    return assign({}, _ret, sltInfo);
  }

  render() {
    let {name, mobile, sltInfo, addressDetail, submitState} = this.state;
    let provinceCity = '';
    if (sltInfo) {
      const {cityName, countyName, provinceName, townName} = sltInfo;
      provinceCity = provinceName + cityName + countyName + (townName || '');
    }

    return (
      <div>
        {
          submitState ? <Loading/> : null
        }
        <div className="mg-t-10 wg-address-panel">
          <div className="wg-address-item">
            <span className=" item-title">收货人</span>
            <div className=" item-input">
              <input className="hb-input" type="text" placeholder="请输入姓名" maxLength="20"
                     value={name}
                     onChange={(e) => this.setValue('name', e)}/>
            </div>
          </div>
          <div className="wg-address-item">
            <span className=" item-title">手机号码</span>
            <div className=" item-input">
              <input className="hb-input" type="tel" placeholder="请输入手机号码" maxLength="11"
                     value={mobile}
                     onChange={(e) => this.setValue('mobile', e)}/>
            </div>
          </div>
          <div className="wg-address-item" onTouchTap={this.goSltCity}>
            <span className=" item-title">所在省市</span>
            <div className=" item-input">
              <input className="hb-input" type="text" readOnly placeholder="请选择所在省市"
                     value={provinceCity}/>
            </div>
            <i className="arrow-hollow-right"></i>
          </div>
          <div className="wg-address-item">
            <span className="fl item-title">详细地址</span>
            <div className="fl item-input">
              <textarea className="hb-textarea" placeholder="请输入详细地址" maxLength="40"
                        value={addressDetail}
                        onChange={(e) => this.setValue('addressDetail', e)}></textarea>
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


