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
    }
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
    this.fullAddress = '';
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
    const {updateTmpUserAddress, indexActions} = this.props;
    let _index = this.state.type;
    const methodName = this.areaTypes[_index].search;

    const key = this.areaTypes[_index - 1].key;

    /*eslint-disable prefer-template*/
    this.getNextList(item.id, methodName)
      .then((res) => {
        if (res.json.data && _index < 3) {
          this.setState({
            list: res.json.data,
            type: ++_index
          })
          this.sltInfo[key + 'Name'] = item.name;
          this.sltInfo[key + 'Id'] = item.id;
          this.fullAddress += item.name;
        } else {
          //选择完成了
          this.sltInfo[key + 'Name'] = item.name;
          this.sltInfo[key + 'Id'] = item.id;
          this.fullAddress += item.name;
          updateTmpUserAddress({
            fullAddress: {
              val: this.fullAddress,
              valid: 1
            }
          })
          updateTmpUserAddress({
            sltInfo: this.sltInfo
          })

          window.history.go(-1)
        }

      }, (error) => {
        if (error.errorCode !== 'RBF100300') {
          indexActions.setErrorMessage(error.message);
        }
      })
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
