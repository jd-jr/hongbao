/**
 * 选择省市区县
 */
import React, {Component, PropTypes} from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import * as actions from '../../actions/userAddressList'
import callApi from '../../fetch/'

class SelectCity extends Component {

  constructor(props) {
    super(props);
    this.state = {
      list: [],
      type: 0
    };

    this.areaTypes = [
      {
        search: 'getProvices',
        key: 'province',
      }, {
        search: 'getCitys',
        key: 'city'
      }, {
        search: 'getCountys',
        key: 'county'
      }, {
        search: 'getTowns',
        key: 'town'
      }

    ];
    this.sltInfo = {};
  }

  /*eslint-disable react/no-did-mount-set-state*/
  componentDidMount() {
    let _index = this.state.type;
    const methodName = this.areaTypes[_index].search;
    this.getNextList(0, methodName)
      .then((res) => {
        this.setState({
          list: res.json.data,
          type: ++_index
        })
      })
  }

  getNextList(areaId, methodName) {
    return callApi({
      url: 'user/address/getarealist',
      body: {
        areaId: String(areaId),
        methodName
      }
    })
  }

  showNextList(item, e) {
    const {indexActions} = this.props;
    let _index = this.state.type;
    const key = this.areaTypes[_index - 1].key;

    if (_index > 3) { //如果选择镇，则直接返回
      this.completeAddress(key, item);
      return;
    }
    const methodName = this.areaTypes[_index].search;

    /*eslint-disable prefer-template*/
    this.getNextList(item.id, methodName)
      .then((res) => {
        if (res.json.data) {
          this.setState({
            list: res.json.data,
            type: ++_index
          });
          this.sltInfo[key + 'Name'] = item.name;
          this.sltInfo[key + 'Id'] = item.id;
        } else {//如果没有查询到下一级地址，则直接选择并返回
          this.completeAddress(key, item);
        }
      }, (error) => {
        if (error.errorCode !== 'RBF100300') {
          indexActions.setErrorMessage(error.message);
        }
      })
  }

  //选择完成了
  completeAddress(key, item) {
    const {updateTmpUserAddress} = this.props;
    this.sltInfo[key + 'Name'] = item.name;
    this.sltInfo[key + 'Id'] = item.id;
    updateTmpUserAddress({
      sltInfo: this.sltInfo //省市区信息
    });
    this.context.router.goBack();
  }

  render() {
    const list = this.state.list || [];
    return (
      <div className="address-list-panel">
        {
          list.map((item, index) => {
            return (
              <div className="item" key={item.id} onTouchTap={this.showNextList.bind(this, item)}>{item.name}</div>
            )
          })
        }
      </div>
    );
  }
}


function mapStateToProps(state) {
  return {
    tmpUserAddress: state.tmpUserAddress
  }
}
SelectCity.contextTypes = {
  router: PropTypes.object.isRequired,
};

SelectCity.propTypes = {
  updateTmpUserAddress: PropTypes.func,
  indexActions: PropTypes.object
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators(actions, dispatch);
}
export default connect(mapStateToProps, mapDispatchToProps)(SelectCity);
