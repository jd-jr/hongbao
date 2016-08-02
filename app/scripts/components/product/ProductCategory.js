import React, {Component, PropTypes} from 'react';
import perfect from '../../utils/perfect';
import offset from 'perfect-dom/lib/offset';

//商品分类
class ProductCategory extends Component {
  constructor(props, context) {
    super(props, context);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleSelectTab = this.handleSelectTab.bind(this);
    this.handleOrder = this.handleOrder.bind(this);

    //商品分类相关属性
    this.touchEnable = false; //是否可以移动
    this.touchMaxDistance = 0; //移动最大距离
    this.startX = 0; //开始坐标
    this.debounceInt = 20; //防抖处理
  }

  componentDidMount() {
    //添加事件
    const {categoryNav} = this.refs;
    categoryNav.addEventListener('touchstart', this.handleTouchStart);
    categoryNav.addEventListener('touchmove', this.handleTouchMove);
  }

  componentDidUpdate() {
    if (this.touchEnable) {
      const {categoryNav} = this.refs;
      const navCW = categoryNav.clientWidth;
      const navSW = categoryNav.scrollWidth;
      this.touchMaxDistance = navSW - navCW + 20;
    }
  }

  componentWillUnmount() {
    const {categoryNav} = this.refs;
    categoryNav.removeEventListener('touchstart', this.handleTouchStart);
    categoryNav.removeEventListener('touchmove', this.handleTouchMove);
  }

  //切换标签
  handleSelectTab(e, id, categoryName) {
    if (id) {
      const target = e.target;
      const w = target.clientWidth;
      const {categoryNav} = this.refs;
      const navCW = categoryNav.clientWidth;
      const xy = offset(target);
      const navXy = offset(categoryNav);
      let shifting = xy.left + w / 2 - navXy.left - navCW / 2;
      console.info(shifting);
      if (shifting < 0) {
        shifting = 0;
      }
      if (shifting > this.touchMaxDistance) {
        shifting = this.touchMaxDistance;
      }
      categoryNav.style.webkitTransform = `translateX(-${shifting}px)`;
      categoryNav.style.transform = `translateX(-${shifting}px)`;
    }

    const {productActions, priceOrder} = this.props;
    const {switchCategory, clearProductList, getProductList, clearSelectProduct} = productActions;
    switchCategory(id);
    clearProductList();
    getProductList({
      category: id,
      priceOrder
    });
    clearSelectProduct();

    const enventId = categoryName ? id : 'all';
    //埋点
    perfect.setBuriedPoint(`hongbao_product_${enventId}`);
  }

  // 排序
  handleOrder(e) {
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
    //埋点
    perfect.setBuriedPoint('hongbao_product_price');
  }

  handleTouchStart(e) {
    if (!this.touchEnable) {
      return;
    }
    const touchObj = e.changedTouches[0];
    this.startX = touchObj.clientX;
    const transform = this.refs.categoryNav.style.webkitTransform;
    const translateX = transform.match(/\d+/);
    this.translateX = translateX ? parseInt(translateX[0], 10) : 0;
  }

  handleTouchMove(e) {
    const touchObj = e.changedTouches[0];
    let offset = this.startX - touchObj.clientX;
    if (Math.abs(offset) < this.debounceInt) {
      return;
    }
    let translateXEnd;
    //向左滑动
    if (offset > 0) {
      if (offset + this.translateX > this.touchMaxDistance) {
        translateXEnd = this.touchMaxDistance;
      } else {
        translateXEnd = this.translateX + offset;
      }
    } else {//向右滑动
      if (offset + this.translateX < -14) { //抛去左侧 padding 宽度
        translateXEnd = 0;
      } else {
        translateXEnd = this.translateX + offset;
      }
    }

    this.refs.categoryNav.style.webkitTransform = `translateX(-${translateXEnd}px)`;
    this.refs.categoryNav.style.transform = `translateX(-${translateXEnd}px)`;
  }

  render() {
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
      <header className="hb-product-nav">
        <div className="row text-nowrap">
          <div className="col-3 p-x-0">
          <span className={`hb-product-nav-btn${activeCategory === null ? ' active' : ''}`}
                onTouchTap={(e) => this.handleSelectTab(e, null)}
                style={{width: '100%'}}>全部</span>
          </div>
          <div className="col-17 p-x-0 hb-category-panel" style={{overflow: 'hidden'}}>
            <div ref="categoryNav">
              {
                ids && ids.length > 0 ?
                  ids.map((item, index) => {
                    const record = entity[item];
                    const {id, categoryName} = record;
                    return (
                      <span key={id}
                            className={`hb-product-nav-btn${activeCategory === id ? ' active' : ''}`}
                            onTouchTap={(e) => this.handleSelectTab(e, id, categoryName)}>
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
      </header>
    );
  }
}

ProductCategory.contextTypes = {
  router: PropTypes.object.isRequired
};

ProductCategory.propTypes = {
  productActions: PropTypes.object,
  categoryList: PropTypes.object,
  activeCategory: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string
  ]),
  priceOrder: PropTypes.string,
};

export default ProductCategory;
