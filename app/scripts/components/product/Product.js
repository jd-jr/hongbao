import React, {Component, PropTypes} from 'react';
import ProductSwiper from './ProductSwiper';
import base64 from 'js-base64';
import perfect from '../../utils/perfect'
const {Base64} = base64;

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

  componentWillUnmount() {
    const {productActions} = this.props;
    productActions.clearProduct();
  }

  selectProduct() {
    const {productDetail, view} = this.props;
    if (view === 'view') {
      this.context.router.goBack();
      return;
    }
    const {skuName, skuId, bizPrice, indexImg} = productDetail;
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

  render() {
    const {productDetail, view} = this.props;
    let {skuId, skuName, bizPrice, images, bigDetail} = productDetail;
    if (!skuId) {
      return null;
    }

    const items = images.map((item, index) => {
      return {id: index, src: item, title: ''}
    });

    if (bigDetail) {
      bigDetail = bigDetail.replace(/<script[^>]*?>[\s\S]*?<\/script>/ig, ''); //替换script标签
      bigDetail = bigDetail.replace(/<style[^>]*?>[\s\S]*?<\/style>/ig, ''); //替换style标签
      bigDetail = bigDetail.replace(/<(?!img)[^>]+>/ig, ''); //去掉除了 img 标签的所有标签
      bigDetail = bigDetail.replace(/\n/g, '');
    }
    /*eslint-disable react/no-danger*/
    return (
      <div>
        <article className="hb-wrap-mb">
          <ProductSwiper items={items}/>
          <section className="hb-product-title">
            <p className="text-truncate-2 f-lg">
              {skuName}
            </p>
            {view === 'view' ? null : (
              <div className="text-center h2 text-primary">￥{(bizPrice / 100).toFixed(2)}</div>
            )}
          </section>
          <section className="m-t-1">
            <h3 className="text-center f-lg">－ 商品详情 －</h3>
            <div className="hb-product-detail" dangerouslySetInnerHTML={{__html: bigDetail}}>
            </div>
          </section>
        </article>

        <footer className="hb-footer-fixed">
          <button className="btn btn-block btn-primary btn-lg btn-flat" onTouchTap={this.selectProduct}>
            {view === 'view' ? '返回' : '确认商品'}
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
  view: PropTypes.string,
};

export default Product;
