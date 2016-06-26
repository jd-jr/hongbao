/**
 * 用户的收获地址列表
 *
 */

import React, {Component, PropTypes} from 'react'


//require('./style.css');
class EditAddress extends Component {
  constructor(props) {
    super(props);

  }

  componentDidMount() {

  }

  componentWillUnMount() {

  }

  render() {


    return (
      <div>
        <div className="mg-t-10 wg-address-panel">
          <div className="wg-address-item">
            <span className=" item-title">收货人</span>
            <div className=" item-input">
              <input type="text" placeholder="请输入姓名"/>
            </div>
          </div>
          <div className="wg-address-item">
            <span className=" item-title">手机号码</span>
            <div className=" item-input">
              <input type="text" placeholder="手机号码"/>
            </div>
          </div>
          <div className="wg-address-item">
            <span className=" item-title">所在省市</span>
            <div className=" item-input">
              <input type="text" disabled placeholder="请选择所在省市"/>
            </div>
            <i className="arrow-hollow-right"></i>
          </div>
          <div className="wg-address-item">
            <span className="fl item-title">详细地址</span>
            <div className="fl item-input">
              <textarea className="placeholder">请输入详细地址</textarea>
            </div>
          </div>
        </div>

        <a className="sure-btn">确定</a>

      </div>

    );
  }
}

export default EditAddress;
