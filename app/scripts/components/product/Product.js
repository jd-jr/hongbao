import React, {Component, PropTypes} from 'react';
import ProductSwiper from './ProductSwiper';

class Product extends Component {
  constructor(props, context) {
    super(props, context);
    this.selectProduct = this.selectProduct.bind(this);
  }

  componentDidMount() {
    const {productActions, skuId} = this.props;
    const {getProductDetail} = productActions;
    getProductDetail(skuId);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const {productDetail} = nextProps;
    if (productDetail.skuId) {
      return true;
    }
    return false;
  }

  selectProduct() {
    const {productDetail} = this.props;
    const {skuName, skuId, bizPrice} = productDetail;
    this.context.router.push({
      pathname: '/order',
      query: {
        skuName,
        skuId,
        bizPrice
      }
    });
  }

  render() {
    const {productDetail} = this.props;
    const {skuId, skuName, bizPrice, images, bigDetail} = productDetail;
    if (!skuId) {
      return null;
    }

    const items = images.map((item, index) => {
      return {id: index, src: item, title: ''}
    });
    return (
      <div>
        <article className="hb-wrap-mb">
          <ProductSwiper items={items}/>
          <section className="hb-product-title">
            <p className="text-truncate-2 f-lg">
              {skuName}
            </p>
            <div className="text-center h2 text-primary">￥{(bizPrice / 100).toFixed(2)}</div>
          </section>
          <section className="m-t-1">
            <h3 className="text-center f-lg">－ 商品详情 －</h3>
            <div className="hb-product-detail">
              {bigDetail}
            </div>
          </section>
        </article>

        <footer className="hb-footer-fixed">
          <button className="btn btn-block btn-primary btn-lg btn-flat" onTouchTap={this.selectProduct}>
            确认商品
          </button>
        </footer>
      </div>
    );
  }
}

Product.contextTypes = {
  router: PropTypes.object.isRequired
};

Product.propTypes = {
  productActions: PropTypes.object,
  productDetail: PropTypes.object,
  skuId: PropTypes.string,
};

export default Product;
