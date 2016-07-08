/**
 * 用户的收获地址列表
 *
 */
import React, {Component, PropTypes} from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {assign} from  'lodash'
import className from 'classnames'
import Modal from 'reactjs-modal';
import * as actions from '../../actions/userAddressList'
import callApi from '../../fetch'
import {getSessionStorage} from '../../utils/sessionStorage';
//图片
import noItems from '../../../images/no_items.png';

class UserAddressList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showTip: false,
      showActionTip: false,
      actionTip: '确认使用该收货地址？',
      waitforModal: false
    };

    this.skuId = getSessionStorage('skuId');
    this.giftRecordId = getSessionStorage('giftRecordId');

    this.showTipWhenAction = this.showTipWhenAction.bind(this);
    this.editAddress = this.editAddress.bind(this);
    this.toggleActionTipState = this.toggleActionTipState.bind(this);
    this.sureAction = this.sureAction.bind(this);
    this.waitForGoods = this.waitForGoods.bind(this);
    this.toggleTipState = this.toggleTipState.bind(this);
    this.toggleTipState = this.toggleTipState.bind(this);
    this.goAddAddress = this.goAddAddress.bind(this);
    this.onModalClose = this.onModalClose.bind(this);
    this.currentItem = null;
  }

  componentWillMount() {
    const {address, setUserAddressList, indexActions} = this.props;
    if (!address) {
      callApi({
        url: 'user/address/list',
        body: {},
        needAuth: true
      }).then((res) => {
        const list = res.json.data || []
        setUserAddressList(list)
        this.checkGoodsStock(list)
      }, (error) => {
        if (error.errorCode !== 'RBF100300') {
          indexActions.setErrorMessage(error.message);
        }
      });
    }
  }

  checkGoodsStock(list) {
    const {updateUserAddress} = this.props;
    //检测收货地址
    list.forEach((item, index) => {
      callApi({
        url: 'user/address/areastock',
        body: {
          addressId: item.id,
          skuId: this.skuId
        },
        needAuth: true
      }).then((res) => {
        const stock = res.json.data;
        list[index].stock = stock;
        updateUserAddress({index, addedAddress: list[index]});
        if (item.addressDefault && !stock) {
          this.toggleTipState();
        }
      }, (res) => {
        list[index].stock = false;
        if (item.addressDefault) {
          this.toggleTipState();
        }
        updateUserAddress({index, addedAddress: list[index]});
      })
    })

  }

  goAddAddress() {
    const {resetTmpUserAddress} = this.props;
    resetTmpUserAddress();
    this.context.router.push('/addaddress');
  }

  //设置成默认地址
  setDefault(index, item) {
    const {setDefaultAddress, indexActions} = this.props;
    if (item.addressDefault) {
      return;
    }
    callApi({
      url: 'user/address/setdefault',
      body: {
        addressId: String(item.id)
      },
      needAuth: true
    }).then((res) => {
      setDefaultAddress(item.id);
    }, (error) => {
      if (error.errorCode !== 'RBF100300') {
        indexActions.setErrorMessage(error.message);
      }
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
    const {
      id, name, mobile, addressDetail,
      cityId, cityName, countyId, countyName, provinceId, provinceName, townId, townName
    } = item;
    const sltInfo = {
      cityId, cityName, countyId, countyName, provinceId, provinceName, townId, townName
    };
    const tmp = {
      id, name, mobile, addressDetail, sltInfo
    };
    initTmpUserAddress(tmp);
    this.context.router.push({
      pathname: `editaddress/${index}`
    })
  }

  deleteAddress(index, item) {
    const {deleteUserAddress, indexActions} = this.props;
    callApi({
      url: 'user/address/delete',
      body: {
        addressId: String(item.id)
      },
      needAuth: true
    }).then((res) => {
      deleteUserAddress(index)
    }, (error) => {
      if (error.errorCode !== 'RBF100300') {
        indexActions.setErrorMessage(error.message);
      }
    })
  }

  //切换显示删除 等操作提示弹窗
  toggleActionTipState(e) {
    if (e) {
      e.nativeEvent.preventDefault();
      e.nativeEvent.stopPropagation();
    }
    const {actionShowTip} = this.state;
    this.setState({
      actionShowTip: !actionShowTip
    })
  }

  //切换显示无货提示弹窗
  toggleTipState() {
    const {showTip} = this.state;
    this.setState({
      showTip: !showTip
    })
  }

  //展示操作提示
  showTipWhenAction(type, index, item) {
    let tipMsg = '';
    let callback = null;

    /*eslint-disable indent*/
    switch (type) {
      case 'SET_DFT':
        callback = this.setDefault.bind(this, index, item)
        tipMsg = '确认将该地址设置成默认地址吗?'
        break;
      case 'DELETE':
        callback = this.deleteAddress.bind(this, index, item);
        tipMsg = '确定删除该地址吗?'
        break;
      case 'USE':
        this.currentItem = item;
        if (!item.stock) {
          this.toggleTipState();
          return;
        }
        callback = this.sureUseAddress.bind(this, item);
        tipMsg = '确定使用该地址吗?';
        break;
      default:
        break;
    }

    this.setState({
      actionTip: tipMsg,
      sureAction: callback

    });
    this.toggleActionTipState();

  }

  //展示是否有货
  showStock(item) {
    if (item.stock === undefined) {
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
  sureUseAddress(item) {
    if (item.stock) {
      //确定下单
      this.generateOrder(item);
    } else {
      //提示
      this.toggleTipState();
    }
  }

  //点击确认按钮
  sureAction(e) {
    e.nativeEvent.preventDefault();
    e.nativeEvent.stopPropagation();
    this.state.sureAction();
    this.toggleActionTipState();
  }

  // 生成订单
  generateOrder(item, waitFor) {
    const {setModalCloseCallback, indexActions} = this.props;
    let _ret = {
      gifRecordId: this.giftRecordId,
      receiverName: item.name,
      receiverPhone: item.mobile,
      receiverEmail: item.email || '',
      receiverProvinceCode: item.provinceId,
      receiverProvinceName: item.provinceName,
      receiverCityName: '收货人市区编码',
      receiverCountryCode: '收货人区县编码',
      receiverCountryName: '收货人区县名称',
      receiverZipCode: ''
    };

    item.cityName && (_ret.receiverCityName = item.cityName);
    item.cityId && (_ret.receiverCityCode = item.cityId);
    item.countyId && (_ret.receiverCountryCode = item.countyId);
    item.countyName && (_ret.receiverCountryName = item.countyName);
    item.townId && (_ret.receiverTownCode = item.townId);
    item.townName && (_ret.receiverTownName = item.townName);

    item.fullAddress && (_ret.receiverAddress = item.fullAddress);

    const identifier = getSessionStorage('identifier');
    callApi({
      url: 'giftRecordOrder/createOrderAddress',
      body: _ret,
      needAuth: true
    }).then((json) => {
      if (waitFor) {
        this.toggleTipState();
        this.setState({
          waitforModal: true
        });
      } else {
        this.context.router.replace(`hongbao/detail/view/${identifier}`);
      }
    }, (error) => {
      if (error.errorCode !== 'RBF100300') {
        indexActions.setErrorMessage(error.message);
      }
      setModalCloseCallback(() => {
        this.context.router.replace(`hongbao/detail/view/${identifier}`);
      });
    });
  }

  //等待补货
  waitForGoods() {
    const {indexActions, address} = this.props;
    const url = 'wait/stock';
    const identifier = getSessionStorage('identifier');
    const giftRecordId = getSessionStorage('giftRecordId');
    const body = {
      identifier
    };

    callApi({url, body}).then(
      (res) => {
        this.generateOrder(this.currentItem || address[0], true);
      }, (error) => {
        if (error.errorCode !== 'RBF100300') {
          indexActions.setErrorMessage(error.message);
        }
      }
    );
  }

  onModalClose() {
    this.setState({
      waitforModal: false
    });
    const identifier = getSessionStorage('identifier');
    this.context.router.replace(`hongbao/detail/view/${identifier}`);
  }

  renderModal() {
    const {waitforModal} = this.state;
    if (waitforModal) {
      const footer = (
        <div className="text-center">
          <button className="btn btn-primary" onTouchTap={this.onModalClose}>
            我知道了
          </button>
        </div>
      );
      return (
        <Modal
          visible={waitforModal}
          style={{width: '70%'}}
          bodyStyle={{height: '7.5rem'}}
          onClose={this.onModalClose}
          footer={footer}
          animation
          maskAnimation
          preventTouchmove
          closable={false}
        >
          <div className="text-center">
            奖品是否有货，取决于京东补货速度。实物红包无法保证奖品寄出具体时间，您可联系客服咨询。客服电话：95118
          </div>
        </Modal>
      );
    }
  }

  //渲染地址列表
  /*eslint-disable prefer-template*/
  renderAddressList() {
    const {
      address
    } = this.props;

    if (!address) {
      return null;
    }

    if (address.length === 0) {
      return (
        <div className="m-t-3">
          <img className="hb-no-items" src={noItems}/>
          <p className="m-t-2 text-center text-muted">暂无地址</p>
        </div>
      );
    }

    return address.map((item, index) => {
      return (
        <div key={item.id}>
          <div className="hb-bd-t row hb-bg-white item"
               onTouchTap={() => this.showTipWhenAction('USE', index, item)}>
            <div className="col-6 text-truncate">{item.name}</div>
            <div className="col-10 ">{item.mobile}</div>
            <div className="col-24 hb-gray-l-t address-text text-truncate-2">
              {item.fullAddress}
            </div>
          </div>
          <div className="row hb-bg-white opt-item hb-bd-t hb-bd-b slt-radio-panel">
            <i className="line-v"></i>

            <label forHtml="slt-circle0" onTouchTap={() => this.showTipWhenAction('SET_DFT', index, item)}
                   className={(item.addressDefault ? 'checked' : '') + ' col-3'}></label>
                    <span className="col-8 push-2 hb-gray-l-t"
                          onTouchTap={() => this.showTipWhenAction('SET_DFT', index, item)}>设为默认</span>

            {this.showStock(item)}

            <span className="col-4 text-center" onTouchTap={() => this.editAddress(index, item)}>编辑</span>
                    <span className="col-4 text-center"
                          onTouchTap={() => this.showTipWhenAction('DELETE', index, item)}>删除</span>
          </div>
        </div>
      );
    })
  }

  render() {
    return (
      <div className="hb-address-panel">
        {this.renderModal()}
        <div className="hb-bd-t hb-bd-b row hb-bg-white item">
          <div className="col-21" onTouchTap={this.goAddAddress}>新建收货地址</div>
          <div className="col-3  arrow-hollow-right"></div>
        </div>
        <div>
          {
            this.renderAddressList()
          }
        </div>

        <div className={className({
          'tip-mask': true,
           'hb-hidden': !this.state.showTip
        })}>
          <div className="tip-alert">
            <div className="text-center">
              <div className="hb-bd-b">
                <h2 className="hb-f-16 tip-item title">您所选择的收货地址无货</h2>
                <div className="hb-f-12 sub-title">您可以有如下选择</div>
              </div>
              <div className="text-red tip-item hb-bd-b" onTouchTap={() => this.waitForGoods()}>等待京东补货</div>
              <div className="text-red tip-item" onTouchTap={this.toggleTipState}>取消</div>
            </div>
          </div>
        </div>

        <div className={className({
          'tip-mask': true,
           'hb-hidden': !this.state.actionShowTip
        })}>
          <div className="tip-alert">

            <div className="text-center">
              <div className="hb-bd-b tip-msg">
                {this.state.actionTip}
              </div>
              <div className="btn-panel">
                <a href="#" className="btn-cancel text-red tip-item hb-bd-r hb-link-block"
                   onTouchTap={this.toggleActionTipState}>取消</a>
                <a href="#" className="btn-sure text-red tip-item hb-link-block"
                   onTouchTap={this.sureAction}>确定</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    address: state.address
  }
}

UserAddressList.contextTypes = {
  router: PropTypes.object.isRequired,
};

UserAddressList.propTypes = {
  address: PropTypes.array,
  setUserAddressList: PropTypes.func,
  indexActions: PropTypes.object,
  updateUserAddress: PropTypes.func,
  resetTmpUserAddress: PropTypes.func,
  setDefaultAddress: PropTypes.func,
  initTmpUserAddress: PropTypes.func,
  deleteUserAddress: PropTypes.func,
  setModalCloseCallback: PropTypes.func,
};


function mapDispatchToProps(dispatch) {
  return bindActionCreators(actions, dispatch);
}
export default connect(mapStateToProps, mapDispatchToProps)(UserAddressList);

