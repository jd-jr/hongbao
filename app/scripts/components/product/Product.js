import React, {Component, PropTypes} from 'react';
import ProductSwiper from './ProductSwiper';
import {setSessionStorage}  from '../../utils/sessionStorage';
import prefect from '../../utils/perfect';

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

  selectProduct() {
    const {productDetail} = this.props;
    const {skuName, skuId, bizPrice} = productDetail;
    setSessionStorage('productDetail', prefect.stringifyJSON({skuName, skuId, bizPrice}));
    this.context.router.push('/order');
  }

  render() {
    const {productDetail} = this.props;
    const {skuName, bizPrice} = productDetail;
    return (
      <div>
        <article className="hb-wrap-mb">
          <ProductSwiper />
          <section className="hb-product-title">
            <p className="text-truncate-2 h3">
              {skuName}
            </p>
            <div className="text-center h2 text-primary">￥{bizPrice}</div>
          </section>
          <section className="m-t-1">
            <h3 className="text-center h3">－ 商品详情 －</h3>
            <div className="hb-product-detail">
              图文详情，待处理
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
