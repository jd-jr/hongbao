import React, {Component, PropTypes} from 'react';
import trim from 'lodash/trim';
import ProductSwiper from './ProductSwiper';
import base64 from 'js-base64';
import perfect from '../../utils/perfect'

const {Base64} = base64;

class Product extends Component {
  constructor(props, context) {
    super(props, context);
    this.selectProduct = this.selectProduct.bind(this);
    this.state = {
      showFoot: false,
    };
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
    const {productActions, skuId} = this.props;
    const {getProductDetail} = productActions;
    getProductDetail(skuId);
    document.body.style.overflowY = 'auto';
    document.documentElement.style.overflowY = 'auto';
  }

  shouldComponentUpdate(nextProps, nextState) {
    const {productDetail} = nextProps;
    if (productDetail.skuId) {
      return true;
    }
    return false;
  }

  componentDidUpdate() {
    const {skuId} = this.props;
    if (skuId) {
      //为 Text 文本包裹 p 标签
      const detailEl = this.refs.detail;
      const childNodes = detailEl.childNodes;
      for (let i = 0, len = childNodes.length; i < len; i++) {
        const node = childNodes[i];
        if (node.nodeType === 3 && trim(node.data) !== '') {
          const _node = document.createElement('p');
          _node.innerHTML = node.data;
          detailEl.replaceChild(_node, node);
        }
      }
    }
  }

  componentWillUnmount() {
    const {productActions} = this.props;
    productActions.clearProduct();
    document.body.style.overflowY = 'hidden';
    document.documentElement.style.overflowY = 'hidden';
  }

  selectProduct(e) {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.preventDefault();
    e.nativeEvent.stopPropagation();

    const {productDetail, view} = this.props;
    if (view === 'view') {
      this.context.router.goBack();
      return;
    }

    //埋点
    perfect.setBuriedPoint('hongbao_product_detail_confirm');

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
    const {showFoot} = this.state;
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
      bigDetail = bigDetail.replace(/&lt;[^&lt;]+&gt;/ig, ''); //替换掉转移 html 标签
      bigDetail = bigDetail.replace(/[\r\n]/g, ''); //去掉回车换行
    }
    /*eslint-disable react/no-danger*/
    return (
      <div>
        <article className="hb-wrap-mb-sm">
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
            <h3 className="text-center f-lg">－ 礼物详情 －</h3>
            <div ref="detail" className="hb-product-detail" dangerouslySetInnerHTML={{__html: bigDetail}}>
            </div>
          </section>
        </article>
        {showFoot ? (
          <footer className="hb-footer-fixed" ref="footer">
            <button className="btn btn-block btn-primary btn-lg btn-flat" onClick={this.selectProduct}>
              {view === 'view' ? '返回' : '确认礼物'}
            </button>
          </footer>
        ) : null}
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
