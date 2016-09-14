import React, {Component, PropTypes} from 'react';
import deviceEnv from 'jd-wallet-sdk/lib/utils/device-env';
import callApi from '../../fetch';
import perfect from '../../utils/perfect';
//import FileInput from '../../ui/FileInput';
import Loading from '../../ui/Loading';

class WishList extends Component {
  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  static propTypes = {
    indexActions: PropTypes.object,
    setClientInfo: PropTypes.func
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      productName: '',
      remark: '',
      productPicPreviewList: [],
      productPicList: [],
      enterLen: 0,
      submitStatus: false
    };

    this.textMaxLen = 500;
    this.isLogin = false;
  }

  verify() {
    const {productName, remark} = this.state;
    const {indexActions} = this.props;
    if (!productName) {
      indexActions.setToast('请输入您想赠送的礼物名称');
      return;
    }
    if (!remark) {
      indexActions.setToast('说说你想送这个礼物的心愿或故事吧！');
      return;
    }
    return true;
  }

  saveBefore = (e) => {
    e.nativeEvent.preventDefault();
    e.nativeEvent.stopPropagation();

    if (!this.verify()) {
      return;
    }

    if (this.isLogin) {
      this.save();
    } else {
      const {setClientInfo} = this.props;
      setClientInfo((status) => {
        if (status) {
          this.save();
          this.isLogin = true;
        }
      });
    }
  };

  //保存心愿单
  save() {
    if (this.state.submitStatus) {
      return;
    }
    this.setState({
      submitStatus: true
    });
    const url = 'addUserWish';
    const {productName, remark, productPicList} = this.state;
    const thirdAccId = perfect.getThirdAccId();
    const accountType = perfect.getAccountType();
    const body = {
      productName, remark, productPicList,
      thirdAccId, accountType
    };
    callApi({url, body, needAuth: true}).then((res) => {
      this.setState({
        submitStatus: false
      });
      this.props.indexActions.setToast('保存成功，感谢您的参与！');
      this.context.router.push('/category');
    }, (error) => {
      this.setState({
        submitStatus: false
      });
      this.props.indexActions.setErrorMessage(error.message);
    });
  };

  handleChange = (e) => {
    const target = e.target;
    const value = target.value;
    const name = target.name;
    const state = {};
    if (name === 'remark') {
      const textLen = value.length;
      if (textLen > 500) {
        return;
      }
      state.enterLen = textLen;
    }

    state[name] = value;
    this.setState(state);
  };

  uploadImg = (e) => {
    const maxSize = 200 * 1024;   //200KB
    const files = e.target.files;   //读取文件
    for (let i = 0, len = files.length; i < len; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        let result = e.target.result;
        const img = new Image();
        img.src = result;
        if (result.length > maxSize) {
          result = perfect.compress(img);
        }
        const {productPicPreviewList} = this.state;
        productPicPreviewList.push(result);
        this.setState({
          productPicPreviewList
        });
        this.saveImgBefore(result);
      };
    }
  };

  saveImgBefore(imgFiles) {
    if (this.isLogin) {
      this.saveImg(imgFiles);
    } else {
      const {setClientInfo} = this.props;
      setClientInfo((status) => {
        if (status) {
          this.saveImg(imgFiles);
          this.isLogin = true;
        }
      });
    }
  }

  saveImg(imgFiles) {
    const thirdAccId = perfect.getThirdAccId();
    const accountType = perfect.getAccountType();
    const body = {
      imgFiles: [imgFiles],
      thirdAccId,
      accountType
    };

    callApi({url: 'uploadWishImg', body, needAuth: true}).then((res) => {
      if (res.json.data && res.json.data.length > 0) {
        this.setState({
          productPicList: res.json.data
        });
      }
    }, (error) => {
      this.props.indexActions.setErrorMessage(error.message);
    });
  }

  render() {
    const {productName, remark, enterLen, productPicPreviewList, submitStatus} = this.state;
    return (
      <div className="cate-wishlist">
        {submitStatus ? (<Loading/>) : null}
        <div className="cate-gift-name">
          <input type="text" placeholder="请输入您想赠送的礼物名称" maxLength="100"
                 className="hb-input"
                 value={productName} name="productName" onChange={this.handleChange}/>
        </div>
        <div className="cate-gift-note">
          <textarea placeholder="说说你想送这个礼物的心愿或故事吧！" maxLength="500"
                    className="hb-textarea f-lg" value={remark} name="remark" onChange={this.handleChange}></textarea>
          <span className="cate-note-num">{this.textMaxLen}/{enterLen}</span>
        </div>
        <div className="cate-gift-pic">
          {/*{productPicPreviewList.map((item, index) => {
            return (
              <img key={index} className="cate-pic" src={item}/>
            );
          })}*/}
          {/*<FileInput className="cate-pic cate-select-pic" onChange={this.uploadImg}
           accept="image/*">
           <img src="../../images/category/icon-wish-pic.png" alt=""/>
           </FileInput>*/}
        </div>
        <div className="cate-gift-submit">
          <button onClick={this.saveBefore}>提交</button>
        </div>
        <p className="text-center">提交心愿单就有机会看到您期望的礼物上架哦</p>
      </div>
    );
  }
}


export default WishList;
