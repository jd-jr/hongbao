import React, {Component, PropTypes} from 'react';
import iScroll from 'iscroll/build/iscroll-probe';
import ReactIScroll from 'reactjs-iscroll';
import base64 from 'js-base64';
import perfect from '../../utils/perfect'
const {Base64} = base64;

//图片
import noItems from '../../../images/no_items.png';

class ProductList extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      productChecked: null
    };
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleSelectTab = this.handleSelectTab.bind(this);
    this.handleOrder = this.handleOrder.bind(this);
    this.handleRefresh = this.handleRefresh.bind(this);
    this.handleChecked = this.handleChecked.bind(this);
    this.selectProduct = this.selectProduct.bind(this);

    this.touchEnable = false; //是否可以移动
    this.touchMaxDistance = 0; //移动最大距离
    this.touchOffset = 0; // 移动的偏移量
    this.startX = 0; //开始坐标
  }

  componentDidMount() {
    const {productActions} = this.props;
    const {getProductList, getCategoryList} = productActions;
    getCategoryList();
    getProductList();
  }

  shouldComponentUpdate(nextProps, nextState) {
    const {
      categoryList,
      productPagination
    } = nextProps;

    if (categoryList.ids && productPagination.ids) {
      return true;
    }
    return false;
  }

  componentDidUpdate() {
    if (this.touchEnable) {
      const navCW = this.refs.categoryNav.clientWidth;
      const navSW = this.refs.categoryNav.scrollWidth;
      this.touchMaxDistance = navSW - navCW;
    }
  }

  // 选择商品
  handleChecked(skuId) {
    this.setState({
      productChecked: skuId
    });
  }

  //选择商品
  selectProduct() {
    const {productChecked} = this.state;
    if (!productChecked) {
      return;
    }
    const {
      productPagination: {entity}
    } = this.props;

    const {skuName, skuId, bizPrice, indexImg} = entity[productChecked];

    let detail = perfect.stringifyJSON({skuName, skuId, bizPrice, indexImg});
    detail = Base64.encode(detail);
    detail = encodeURIComponent(detail);
    //浏览器发送 http 请求数据时,会自动把 + 转换为空格,所以先对 + Unicode编码 为 %2B
    detail = detail.replace(/\+/g, '%2B');
    this.context.router.replace({
      pathname: '/',
      query: {
        detail,
      }
    });
  }

  //切换标签
  handleSelectTab(e, id) {
    const {productActions, priceOrder} = this.props;
    const {switchCategory, clearProductList, getProductList} = productActions;
    switchCategory(id);
    clearProductList();
    getProductList({
      category: id,
      priceOrder
    });
  }

  // 排序
  handleOrder(e) {
    const {productActions, priceOrder, activeCategory} = this.props;
    const {switchPriceOrder, clearProductList, getProductList} = productActions;
    const _priceOrder = priceOrder === 'asc' ? 'desc' : 'asc';
    switchPriceOrder(_priceOrder);
    clearProductList();
    getProductList({
      category: activeCategory,
      priceOrder: _priceOrder
    });
  }

  handleTouchStart(e) {
    if (!this.touchEnable) {
      return;
    }
    const nativeEvent = e.nativeEvent;
    const touchObj = nativeEvent.changedTouches[0];
    this.startX = touchObj.clientX;
  }

  handleTouchMove(e) {
    const nativeEvent = e.nativeEvent;
    const touchObj = nativeEvent.changedTouches[0];
    let offset = this.startX - touchObj.clientX;
    //向左滑动
    if (offset > 0) {
      if (offset + this.touchOffset > this.touchMaxDistance) {
        this.touchOffset = this.touchMaxDistance;
      } else {
        this.touchOffset += offset;
      }
    } else {//向右滑动
      if (offset + this.touchOffset < 0) {
        this.touchOffset = 0;
      } else {
        this.touchOffset += offset;
      }
    }

    this.refs.categoryNav.style.webkitTransform = `translateX(-${this.touchOffset}px)`;
    this.refs.categoryNav.style.transform = `translateX(-${this.touchOffset}px)`;
  }

  productDetail(e, url) {
    e.preventDefault();
    e.stopPropagation();
    this.context.router.push(url);
  }

  //调用 IScroll refresh 后回调函数
  handleRefresh(downOrUp, callback) {
    const {
      productPagination, productActions, activeCategory, priceOrder
    } = this.props;
    const {clearProductList, getProductList} = productActions;

    if (downOrUp === 'up') { // 加载更多
      getProductList({
        category: activeCategory,
        priceOrder
      }).then(() => {
        callback();
      });
    } else { // 刷新
      clearProductList();
      getProductList({
        category: activeCategory,
        priceOrder
      }).then(() => {
        callback();
      });
    }
  }

  //渲染商品分类
  renderCategory() {
    const {
      categoryList,
      activeCategory,
      priceOrder
    } = this.props;

    const {ids, entity} = categoryList;
    const len = ids ? ids.length : 0;
    if (len > 4) { //开启移动
      this.touchEnable = true;
      this.touchMaxDistance = 0;
    }

    return (
      <div className="row text-nowrap">
        <div className="col-3" style={{paddingRight: '0px'}}>
          <span className={`hb-product-nav-btn${activeCategory === null ? ' active' : ''}`}
                onTouchTap={(e) => this.handleSelectTab(e, null)}
                style={{width: '100%'}}>全部</span>
        </div>
        <div className="col-17" style={{overflow: 'hidden'}}>
          <div ref="categoryNav" onTouchStart={this.handleTouchStart}
               onTouchMove={this.handleTouchMove}>
            {
              ids && ids.length > 0 ?
                ids.map((item, index) => {
                  const record = entity[item];
                  const {id, categoryName} = record;
                  return (
                    <span key={id}
                          className={`hb-product-nav-btn${activeCategory === id ? ' active' : ''}`}
                          onTouchTap={(e) => this.handleSelectTab(e, id)}>
                    {categoryName}
                  </span>
                  );
                }) : null
            }
          </div>
        </div>
        <div className="col-4 hb-product-nav-btn pos-r" onTouchTap={this.handleOrder}>
          <span>价格</span>
          <span className={`arrow-top pos-a m-l-0-3 ${priceOrder === 'asc' ? 'arrow-primary' : 'arrow-gray'}`}
                style={{top: '0.9rem'}}></span>
          <span className={`arrow-bottom pos-a m-l-0-3 ${priceOrder === 'desc' ? 'arrow-primary' : 'arrow-gray'}`}
                style={{bottom: '0.9rem'}}></span>
        </div>
      </div>
    );
  }

  renderProductItem(item) {
    const {skuId, skuName, indexImg, bizPrice} = item;
    const {productChecked} = this.state;
    return (
      <li key={skuId} className="row flex-items-middle">
        <div className="col-3 text-right">
          <i className={`hb-radio-gray${productChecked === skuId ? ' checked' : ''}`}
             onTouchTap={() => this.handleChecked(skuId)}></i>
        </div>
        <div className="col-4"
             onTouchTap={(e) => this.productDetail(e, `/product/detail/${skuId}`)}>
          <img className="img-fluid" src={indexImg} alt=""/>
        </div>
        <div className="col-14"
             onTouchTap={(e) => this.productDetail(e, `/product/detail/${skuId}`)}>
          <div className="text-truncate">{skuName}</div>
          <div className="f-sm hb-product-info">
            <span>¥ {(bizPrice / 100).toFixed(2)}</span>
          </div>
        </div>
        <div className="col-3 text-center"
             onTouchTap={(e) => this.productDetail(e, `/product/detail/${skuId}`)}>
          <span className="arrow-hollow-right"></span>
        </div>
      </li>
    );
  }

  renderProduct() {
    const {
      productPagination
    } = this.props;

    const {ids, entity, lastPage} = productPagination;

    if (!ids) {
      return (
        <div className="page-loading">载入中，请稍后 ...</div>
      );
    } else if (ids.length === 0) {
      return (
        <div className="m-t-3">
          <img className="hb-no-items" src={noItems}/>
          <p className="m-t-2 text-center text-muted">暂无商品</p>
        </div>
      );
    }

    return (
      <ReactIScroll iScroll={iScroll}
                    handleRefresh={this.handleRefresh}
                    pullUp={!lastPage}
                    className="hb-iscroll">
        <ul className="hb-list">
          {
            ids ? ids.map((item) => {
              return this.renderProductItem(entity[item]);
            }) : null
          }
        </ul>
      </ReactIScroll>
    );
  }

  render() {
    const {productChecked} = this.state;
    return (
      <div>
        <header className="hb-product-nav">
          {this.renderCategory()}
        </header>
        <article className="hb-wrap-mb">
          {this.renderProduct()}
        </article>
        <footer className="hb-footer-fixed">
          <button className="btn btn-block btn-primary btn-lg btn-flat"
                  onTouchTap={this.selectProduct}
                  disabled={!productChecked}>
            确认商品
          </button>
        </footer>
      </div>
    );
  }
}

ProductList.contextTypes = {
  router: PropTypes.object.isRequired
};

ProductList.propTypes = {
  productActions: PropTypes.object,
  productPagination: PropTypes.object,
  categoryList: PropTypes.object,
  activeCategory: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string
  ]),
  priceOrder: PropTypes.string,
};

export default ProductList;
