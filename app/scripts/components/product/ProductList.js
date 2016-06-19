import React, {Component, PropTypes} from 'react';

class ProductList extends Component {

  componentDidMount() {
    const {productActions} = this.props;
    const {getProductList, getCategoryList} = productActions;
    getCategoryList();
    getProductList();
  }

  loadProduct() {
    const {
      priceOrder
    } = this.props;

  }

  productDetail(e, url) {
    e.preventDefault();
    e.stopPropagation();
    this.context.router.push(url);
  }

  renderCategory() {
    const {
      categoryList,
      activeCategory
    } = this.props;

    const list = categoryList.list;
    const len = list ? list.length : 0;

    console.info(list);
    return (
      <div className="row text-nowrap">
        {
          list && list.length > 0 ?
            list.map((item, index) => {
              return (
                <div key={item.id}
                     className={`col-5 hb-product-nav-btn${activeCategory === index ? ' active' : ''}`}>
                  {item.name}
                </div>
              );
            }) : null
        }
        <div className="col-4 hb-product-nav-btn pos-r">
          <span>价格</span>
          <span className="arrow-top arrow-gray pos-a m-l-0-3" style={{top: '0.9rem'}}></span>
          <span className="arrow-bottom arrow-primary pos-a m-l-0-3" style={{bottom: '1.1rem'}}></span>
        </div>
      </div>
    );
  }

  renderProductItem(item) {
    const {skuId, skuName, indexImg, bizPrice} = item;
    return (
      <li key={skuId} className="row flex-items-middle"
          onTouchTap={(e) => this.productDetail(e, `/product/detail/${skuId}`)}>
        <div className="col-4">
          <img className="img-fluid" src={indexImg} alt=""/>
        </div>
        <div className="col-18">
          <div className="text-truncate">{skuName}</div>
          <div className="f-sm hb-product-info">
            <span>¥ {bizPrice}</span>
            <span className="hb-product-tag hb-product-tag-primary">火爆</span>
            <span className="hb-product-tag hb-product-tag-info">新品</span>
            <span className="hb-product-tag hb-product-tag-success">流行</span>
          </div>
        </div>
        <div className="col-2 text-center">
          <span className="arrow-hollow-right"></span>
        </div>
      </li>
    );
  }

  renderProduct() {
    const {
      productPagination
    } = this.props;

    const list = productPagination.list;

    if (!list) {
      return (
        <div className="page-loading">载入中，请稍后 ...</div>
      );
    } else if (list.length === 0) {
      return (
        <div className="m-t-3 text-center text-muted">
          没有商品
        </div>
      );
    }

    return (
      <ul className="hb-list">
        {
          list ? list.map((item) => {
            return this.renderProductItem(item);
          }) : null
        }
      </ul>
    );
  }

  render() {
    return (
      <div>
        <header className="hb-product-nav text-center">
          {this.renderCategory()}
        </header>
        <article>
          {this.renderProduct()}
        </article>
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
  activeCategory: PropTypes.number,
  priceOrder: PropTypes.string,
};

export default ProductList;
