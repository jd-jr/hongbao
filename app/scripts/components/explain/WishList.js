import React, {Component, PropTypes} from 'react';

class WishList extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
    };
  }

  componentWillMount() {

  }

  componentDidMount() {

  }

  shouldComponentUpdate(nextProps, nextState) {

  }

  componentDidUpdate() {

  }

  componentWillUnmount() {

  }

  render() {

    /*eslint-disable react/no-danger*/
    return (
      <div className="cate-wishlist">
        <div className="cate-gift-name">
          <input type="text" placeholder="请输入您想赠送的礼物名称" />
        </div>
        <div className="cate-gift-note">
          <textarea placeholder="说说你想送这个礼物的心愿或故事吧！"></textarea>
          <span className="cate-note-num">500/0</span>
        </div>
        <div className="cate-gift-pic">
          <img className="cate-pic" src="../../images/category/wish-01.jpg" alt="" />
          <img className="cate-pic" src="../../images/category/wish-01.jpg" alt="" />
          <img className="cate-pic" src="../../images/category/wish-01.jpg" alt="" />
          <img className="cate-pic" src="../../images/category/wish-01.jpg" alt="" />
          <img className="cate-pic" src="../../images/category/wish-01.jpg" alt="" />
          <div className="cate-pic cate-select-pic">
            <img src="../../images/category/icon-wish-pic.png" alt="" />
          </div>
        </div>
        <div className="cate-gift-submit">
          <button>提交</button>
        </div>
        <p className="text-center">提交心愿单就有机会看到您期望的礼物上架哦</p>
      </div>
  );
  }
}

WishList.contextTypes = {
  router: PropTypes.object.isRequired
};

WishList.propTypes = {
};

export default WishList;
