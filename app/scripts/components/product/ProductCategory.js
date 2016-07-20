import React, {Component, PropTypes} from 'react';
import perfect from '../../utils/perfect'

//商品分类
const productCategory = {
  bjts: '并肩同事',
  jdzn: '京东智能',
  dnbg: '电脑办公',
  jd: '家电',
  sjsm: '手机数码',
  jjsh: '家具生活',
  mzxh: '美妆洗护',
  xbscp: '箱包奢侈品',
  mywj: '母婴玩具',
  spbj: '食品保健',
  ydhw: '运动户外'
};

const productCategoryValueKey = Object.keys(productCategory).reduce((result, item) => {
  result[productCategory[item]] = item;
  return result;
}, {});


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
    this.touchOffset = 0; // 移动的偏移量
    this.startX = 0; //开始坐标
    this.debounceInt = 20; //防抖处理
  }

  componentDidUpdate() {
    if (this.touchEnable) {
      const navCW = this.refs.categoryNav.clientWidth;
      const navSW = this.refs.categoryNav.scrollWidth;
      this.touchMaxDistance = navSW - navCW;
    }
  }

  //切换标签
  handleSelectTab(e, id, categoryName) {
    const {productActions, priceOrder} = this.props;
    const {switchCategory, clearProductList, getProductList, clearSelectProduct} = productActions;
    switchCategory(id);
    clearProductList();
    getProductList({
      category: id,
      priceOrder
    });
    clearSelectProduct();

    const enventId = categoryName ? (productCategoryValueKey[categoryName] || 'all') : 'all';
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
