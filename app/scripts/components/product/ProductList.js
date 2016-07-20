import React, {Component, PropTypes} from 'react';
import {findDOMNode} from 'react-dom';
import classnames from 'classnames';
import PullRefresh from 'reactjs-pull-refresh';
import ScrollLoad from '../../ui/ScrollLoad';
import base64 from 'js-base64';
import perfect from '../../utils/perfect'
import {scrollEvent, unmountScrollEvent} from '../../utils/scrollHideFixedElement';
import ProductCategory from './ProductCategory';

//图片
import noItems from '../../../images/no_items.png';

const {Base64} = base64;

class ProductList extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      showFoot: false,
      listLoading: true,
      disabled: document.body.scrollTop !== 0
    };

    this.handleChecked = this.handleChecked.bind(this);
    this.selectProduct = this.selectProduct.bind(this);
    this.loadMore = this.loadMore.bind(this);
    this.loadingFunction = this.loadingFunction.bind(this);
    this.onPanStart = this.onPanStart.bind(this);
    this.onPanEnd = this.onPanEnd.bind(this);
    this.onScroll = this.onScroll.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
  }

  componentWillMount() {
    //延迟显示底部按钮，解决 IOS 下底部按钮设置 fixed 的问题
    setTimeout(() => {
      this.setState({
        showFoot: true
      });
    }, 300);
  }

  componentDidMount() {
    const {productActions} = this.props;
    const {getProductList, getCategoryList} = productActions;
    getCategoryList();
    getProductList();

    //添加下拉刷新相关事件
    window.addEventListener('touchstart', this.onTouchStart, false);
    window.addEventListener('scroll', this.onScroll, false);
  }

  componentDidUpdate() {
    if (this.state.showFoot) {
      //滑动隐藏底部按钮
      scrollEvent({
        hideElement: this.refs.footer
      });
    }
  }

  componentWillUnmount() {
    unmountScrollEvent();
    window.removeEventListener('touchstart', this.onTouchStart, false);
    window.removeEventListener('scroll', this.onScroll, false);
  }

  //滚动监听，当 scrollTop 等于 0 时，激活下拉刷新
  onScroll(e) {
    const scrollTop = document.body.scrollTop;
    this.setState({
      disabled: scrollTop !== 0
    });
  }

  onTouchStart(e) {
    console.info(this.preventDefault);
    if (this.preventDefault && !this.state.disabled) {
      e.preventDefault();
    }
  }

  // 下拉刷新回调函数
  loadingFunction() {
    this.setState({
      listLoading: false
    });

    const {productActions, priceOrder, activeCategory} = this.props;
    const {clearProductList, getProductList, clearSelectProduct} = productActions;
    clearProductList();
    clearSelectProduct();
    return getProductList({
      category: activeCategory,
      priceOrder
    }).then(() => {

    });
  }

  // 下拉滑动开始事件
  onPanStart() {
    const {disabled} = this.state;
    if (!disabled) {
      this.preventDefault = true;
    }
  }

  // 下拉滑动结束事件
  onPanEnd() {
    this.preventDefault = false;
  }

  // 选择商品
  handleChecked(skuId) {
    const {productActions} = this.props;
    productActions.selectProduct(skuId);
  }

  // 选择商品后点击确认
  selectProduct(e) {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.preventDefault();
    e.nativeEvent.stopPropagation();

    const {selectedProduct} = this.props;
    if (!selectedProduct) {
      return;
    }

    //埋点
    perfect.setBuriedPoint('hongbao_product_confirm');

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

  // 进入商品详情
  productDetail(e, url, index) {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.preventDefault();
    e.nativeEvent.stopPropagation();
    //埋点
    perfect.setBuriedPoint(`hongbao_product_goods_${index + 1}`);
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

  renderProductItem(item, index) {
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
             onClick={(e) => this.productDetail(e, `/product/detail/${skuId}`, index)}>
          <img className="img-fluid" src={indexImg} alt=""/>
        </div>
        <div className="col-14"
             onClick={(e) => this.productDetail(e, `/product/detail/${skuId}`, index)}>
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
             onClick={(e) => this.productDetail(e, `/product/detail/${skuId}`, index)}>
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

    const {listLoading} = this.state;

    if (!ids) {
      return (
        listLoading ? <div className="page-loading">载入中，请稍后 ...</div> : null
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
                  className={classnames({loading: isFetching})}>
        <ul className="hb-list">
          {
            ids ? ids.map((item, index) => {
              return this.renderProductItem(entity[item], index);
            }) : null
          }
        </ul>
      </ScrollLoad>
    );
  }

  render() {
    const {
      selectedProduct, categoryList, activeCategory, priceOrder, productActions
    } = this.props;
    const {showFoot, disabled} = this.state;
    const btnDisabled = !selectedProduct;

    const categoryProps = {
      categoryList,
      activeCategory,
      priceOrder,
      productActions
    };
    return (
      <div>
        <PullRefresh loadingFunction={this.loadingFunction}
                     distanceToRefresh={0}
                     lockInTime={30}
                     hammerOptions={{touchAction: 'auto'}}
                     onPanStart={this.onPanStart}
                     onPanEnd={this.onPanEnd}
                     disabled={disabled}
                     ref="pullRefresh">

          <ProductCategory {...categoryProps}/>

          <article className="hb-wrap-mb-sm">
            {this.renderProduct()}
          </article>
        </PullRefresh>
        {
          showFoot ? (
            <footer className="hb-footer-fixed" ref="footer">
              <button className="btn btn-block btn-primary btn-lg btn-flat"
                      disabled={btnDisabled}
                      onClick={this.selectProduct}>
                确认礼物
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
