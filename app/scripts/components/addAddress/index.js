/**
 * 用户的收获地址列表
 *
 */

import React, {Component, PropTypes} from 'react'


//require('./style.css');
class AddAddress extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name:'',
      mobile:'',
      fullAddress:'',
      addressDetail:''
    }
  }

  componentDidMount() {

  }

  componentWillUnMount() {

  }
  //将输入的值设置到state上
  setValue(type, e){
    console.log(e.target.value, '=====')
    this.setState({
      [type]:e.target.value
    }, ()=>{
      console.log(this.state)
    })

  }
  checkValid(type){
    var val = this.state[type];
    switch (type){
      case 'name':
        return val>0;
        break;
      default:
        return false;
        break;
    }
  }
  goSltCity(){

  }
  render() {


    return (
      <div>
        <div className="mg-t-10 wg-address-panel">
          <div className="wg-address-item">
            <span className=" item-title">收货人</span>
            <div className=" item-input">
              <input type="text" placeholder="请输入姓名"
                     onChange={this.setValue.bind(this, 'name')}
                     onBlur={this.checkValid.bind(this, 'name')}/>
            </div>
          </div>
          <div className="wg-address-item">
            <span className=" item-title">手机号码</span>
            <div className=" item-input">
              <input type="text" placeholder="手机号码"
                     onChange={this.setValue.bind(this, 'mobile')}
                     onBlur={this.checkValid.bind(this, 'mobile')}/>
            </div>
            <i className="error-icon">x</i>
          </div>
          <div className="wg-address-item">
            <span className=" item-title">所在省市</span>
            <div className=" item-input" onClick={this.goSltCity.bind(this)}>
              <input type="text" disabled placeholder="请选择所在省市"/>
            </div>
            <i className="arrow-hollow-right"></i>
          </div>
          <div className="wg-address-item">
            <span className="fl item-title">详细地址</span>
            <div className="fl item-input">
              <textarea className="placeholder"
                        onChange={this.setValue.bind(this, 'addressDetail')}
                        onBlur={this.checkValid.bind(this, 'addressDetail')}>请输入详细地址</textarea>
            </div>
          </div>
        </div>

        <a className="sure-btn">确定</a>

      </div>

    );
  }
}

export default AddAddress;
