import React, {Component, PropTypes} from 'react';
import classnames from 'classnames';
import ScrollLoad from '../../ui/ScrollLoad';
import base64 from 'js-base64';
import perfect from '../../utils/perfect'
import {scrollEvent, unmountScrollEvent} from '../../utils/scrollHideFixedElement';

//图片
import noItems from '../../../images/no_items.png';

const {Base64} = base64;

class ProductList extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      showFoot: false,
      reset: false
    };
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleSelectTab = this.handleSelectTab.bind(this);
    this.handleOrder = this.handleOrder.bind(this);
    this.handleChecked = this.handleChecked.bind(this);
    this.selectProduct = this.selectProduct.bind(this);
    this.loadMore = this.loadMore.bind(this);

    this.touchEnable = false; //是否可以移动
    this.touchMaxDistance = 0; //移动最大距离
    this.touchOffset = 0; // 移动的偏移量
    this.startX = 0; //开始坐标
    this.debounceInt = 20; //防抖处理
  }

  componentWillMount() {
    //延迟显示底部按钮，解决 IOS 下底部按钮设置 fixed 的问题
    setTimeout(() => {
      this.setState({
        showFoot: true
      });
    }, 400);
  }

  componentDidMount() {
    const {productActions} = this.props;
    const {getProductList, getCategoryList} = productActions;
    getCategoryList();
    getProductList();
  }

  shouldComponentUpdate(nextProps, nextState) {
    const {reset} = nextState;
    if (reset === true) {
      return true;
    }
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
    if (this.state.showFoot) {
      scrollEvent({
        hideElement: this.refs.footer
      });
    }
  }

  componentWillUnmount() {
    unmountScrollEvent();
  }

  // 选择商品
  handleChecked(skuId) {
    const {productActions} = this.props;
    productActions.selectProduct(skuId);
  }

  // 选择商品后点击确认
  selectProduct(e) {
    e.preventDefault;
    e.stopPropagation();
    e.nativeEvent.preventDefault;
    e.nativeEvent.stopPropagation();

    const {selectedProduct} = this.props;
    if (!selectedProduct) {
      return;
    }
    const {
      productPagination: {entity}
    } = this.props;

    const {skuName, skuId, bizPrice, indexImg} = entity[selectedProduct];

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
    this.setState({
      reset: true
    });
    const {productActions, priceOrder} = this.props;
    const {switchCategory, clearProductList, getProductList, clearSelectProduct} = productActions;
    switchCategory(id);
    clearProductList();
    getProductList({
      category: id,
      priceOrder
    });
    clearSelectProduct();
  }

  // 排序
  handleOrder(e) {
    this.setState({
      reset: true
    });
    const {productActions, priceOrder, activeCategory} = this.props;
    const {switchPriceOrder, clearProductList, getProductList, clearSelectProduct} = productActions;
    const _priceOrder = priceOrder === 'asc' ? 'desc' : 'asc';
    switchPriceOrder(_priceOrder);
    clearProductList();
    getProductList({
      category: activeCategory,
      priceOrder: _priceOrder
    });
    clearSelectProduct();
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
    if (Math.abs(offset) < this.debounceInt) {
      return;
    }

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

  // 进入商品详情
  productDetail(e, url) {
    e.preventDefault();
    e.stopPropagation();
    this.context.router.push(url);
  }

  //加载更多
  loadMore() {
    const {
      productActions, activeCategory, priceOrder
    } = this.props;

    const {getProductList} = productActions;

    getProductList({
      category: activeCategory,
      priceOrder
    });
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
    let {skuId, skuName, indexImg, bizPrice, itemTag} = item;
    if (itemTag) {
      itemTag = itemTag.split(',');
    }

    const {selectedProduct} = this.props;
    return (
      <li key={skuId} className="row flex-items-middle">
        <div className="col-3 text-right p-y-1" onTouchTap={() => this.handleChecked(skuId)}>
          <i className={`hb-radio-gray${selectedProduct === skuId ? ' checked' : ''}`}></i>
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
            {
              itemTag && itemTag.map((item, index) => {
                let tagClass;
                /*eslint-disable indent*/
                switch (item) {
                  case '火爆':
                    tagClass = 'hb-product-tag-primary';
                    break;
                  case '新品':
                    tagClass = 'hb-product-tag-info';
                    break;
                  case '流行':
                    tagClass = 'hb-product-tag-success';
                    break;
                  default:
                    tagClass = '';
                }
                return (
                  <span key={index} className={`hb-product-tag ${tagClass}`}>{item}</span>
                );
              })
            }
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

    const {ids, entity, lastPage, isFetching} = productPagination;

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
      <ScrollLoad loadMore={this.loadMore}
                  hasMore={!lastPage}
                  isLoading={isFetching}
                  className={classnames({loading: isFetching})}
                  loader={<div className=""></div>}>
        <ul className="hb-list">
          {
            ids ? ids.map((item) => {
              return this.renderProductItem(entity[item]);
            }) : null
          }
        </ul>
      </ScrollLoad>
    );
  }

  render() {
    const {selectedProduct} = this.props;
    const {showFoot} = this.state;
    return (
      <div>
        <header className="hb-product-nav">
          {this.renderCategory()}
        </header>
        <article className="hb-wrap-mb">
          {this.renderProduct()}
        </article>
        {
          showFoot ? (
            <footer className="hb-footer-fixed" ref="footer">
              <button className="btn btn-block btn-primary btn-lg btn-flat"
                      onClick={this.selectProduct}
                      disabled={!selectedProduct}>
                确认商品
              </button>
            </footer>
          ) : null
        }
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
  selectedProduct: PropTypes.string,
};

export default ProductList;
