import React, {Component, PropTypes} from 'react';
import {findDOMNode} from 'react-dom';
import classnames from 'classnames';
import ScrollLoad from '../../ui/ScrollLoad';
import base64 from 'js-base64';
import perfect from '../../utils/perfect'
import {SHOW_FOOT_DELAY} from '../../constants/common';
import CategorySearch from './CategorySearch';
import assign from 'lodash/assign';
import noItems from '../../../images/no_items.png';

const {Base64} = base64;

class ProductList extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      showFoot: false, //是否显示底部fixed
      listType: 'list', //block产品大图;list产品小图;默认小图
      filter: false, //默认不展示筛选下拉
      tabFlag: 'hot', //tab选中标记,默认为'hot'
      priceOrder: true, //默认按价格升序排列,false=desc、true=asc
      priceSection: [], //价格区间
      sectionIndex: -1, //默认不选中价格区间,值有:0|1|2
      body: { //默认的搜索字段
        category: null, //分类产品
        subjectId: null, //主题产品
        salesAmountOrder: 'desc', //人气,默认降序
        beginDateOrder: null, //新品,默认降序
        priceOrder: null, //价格,默认升序
        lowPrice: null, //最低价格
        highPrice: null, //最高价格
      },
      lowPrice: '', //最低价格
      highPrice: '', //最高价格
    };

    this.rootUrl = perfect.getLocationRoot() +'images/'; //图片根路径

    this.handleChecked = this.handleChecked.bind(this);
    this.selectProduct = this.selectProduct.bind(this);
    this.loadMore = this.loadMore.bind(this);
    this.switchTab = this.switchTab.bind(this);
    this.switchIcon = this.switchIcon.bind(this);
    this.switchFilter = this.switchFilter.bind(this);
    this.resetPriceSection = this.resetPriceSection.bind(this);
  }

  componentWillMount() {
    //延迟显示底部按钮，解决 IOS 下底部按钮设置 fixed 的问题
    setTimeout(() => {
      this.setState({
        showFoot: true
      });
    }, SHOW_FOOT_DELAY);
  }

  componentDidMount() {
    const {body} = this.state;
    const {categoryActions, fromType, categoryId} = this.props;
    const {getProductList, getCategoryList, clearSelectProduct} = categoryActions;

    if (fromType === 'category') {
      body.category = +categoryId;
    } else {
      body.subjectId = +categoryId;
    }

    getCategoryList(); //获取分类数据
    getProductList(body, true); //拉取产品数据
    clearSelectProduct(); //清理之前选中的产品sku

    //更新body
    this.setState({body});

    //添加下拉刷新相关事件
    window.addEventListener('touchstart', this.onTouchStart, false);
    window.addEventListener('scroll', this.onScroll, false);
  }

  //切换产品列表展示方式
  switchIcon(e) {
    e.preventDefault();

    const {listType} = this.state;
    if (listType === 'block') {
      this.setState({listType: 'list'});
    } else {
      this.setState({listType: 'block'});
    }
  }
  /*
    切换"人气、新品、价格"
    flag: hot|new|price
  */
  switchTab(e, tabFlag) {
    e.preventDefault();

    this.setState({tabFlag}); //更新选中tab
    const {priceOrder, body} = this.state;
    const {categoryActions} = this.props;
    const {getProductList} = categoryActions;

    switch (tabFlag) {
      case 'hot':
        assign(body, {
          salesAmountOrder: "desc",
          beginDateOrder: null,
          priceOrder: null,
        });
        break;
      case 'new':
        assign(body, {
          salesAmountOrder: null,
          beginDateOrder: "desc",
          priceOrder: null,
        });
        break;
      case 'price':
        this.setState({priceOrder: !priceOrder});
        assign(body, {
          salesAmountOrder: null,
          beginDateOrder: null,
          priceOrder: !priceOrder?'asc':'desc',
        });
        break;
      default:break;
    }

    this.setState({body}); //更新body
    getProductList(body, true);
  }
  //切换展示筛选下拉
  switchFilter(e) {
    e.preventDefault();

    const {filter} = this.state;
    this.setState({filter: !filter});
  }
  //设置筛选金额
  setPriceSection(e, sectionIndex) {
    e.preventDefault();

    const {body} = this.state;
    const {categoryActions} = this.props;
    const {getProductList} = categoryActions;
    let priceSection = [];

    switch (sectionIndex) {
      case 0:
        priceSection = [100, 5000];
        break;
      case 1:
        priceSection = [500, 20000];
        break;
      case 2:
        priceSection = [20000, 50000];
        break;
      default:break;
    };

    assign(body, {
      lowPrice: priceSection[0],
      highPrice: priceSection[1],
    });

    this.setState({
      priceSection,
      sectionIndex,
      body,
      filter: false,
    });

    getProductList(body, true);
  }
  //重置筛选金额
  resetPriceSection() {
    this.setState({
      body: {
        lowPrice: null,
        highPrice: null,
      },
      lowPrice: '',
      highPrice: '',
      priceSection: [],
      sectionIndex: -1,
    });
  }
  //确认筛选金额
  confirmPriceSection(e) {
    const {tabFlag, body, lowPrice, highPrice, sectionIndex} = this.state;
    if (sectionIndex < 0) {
      assign(body, {
        lowPrice: lowPrice?lowPrice:null,
        highPrice: highPrice?highPrice:null,
      });
    }
    this.switchTab(e, tabFlag);
    this.setState({filter: false});
  }
  //设置最低值|最高值
  handleChange(e, type) {
    const {lowPrice, highPrice} = this.state;
    const {indexActions} = this.props;
    let value = parseInt(e.target.value);
    // indexActions.setToast('请先选择礼物');
    this.setState({
      lowPrice: type==='lowPrice'?value:lowPrice,
      highPrice: type==='highPrice'?value:highPrice,
      priceSection: [],
      sectionIndex: -1,
    });
  }
  //最低最高聚焦
  handleFocus() {
    this.setState({
      priceSection: [],
      sectionIndex: -1,
    });
  }

  // 选择商品
  handleChecked(skuId) {
    const {categoryActions} = this.props;
    categoryActions.selectProduct(skuId);
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
    const {categoryActions, fromType, categoryId} = this.props;
    const {getProductList} = categoryActions;

    let body = {
      category: null,
      subjectId: null,
      lowPrice: null,
      highPrice: null
    };
    if (fromType === 'category') {
      body.category = +categoryId;
    } else {
      body.subjectId = +categoryId;
    }

    getProductList(body);
  }

  renderProductListItem(item, index) {
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
        <div className="col-4 p-a-0"
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

  renderProductBlockItem(item, index) {
    let {skuId, skuName, indexImg, bizPrice, itemTag} = item;
    if (itemTag) {
      itemTag = itemTag.split(',');
    }

    const {selectedProduct} = this.props;
    return (
      <li key={skuId} className="pos-r">
        <i className={`pos-a hb-radio-gray${selectedProduct === skuId ? ' checked' : ''}`} onTouchTap={() => this.handleChecked(skuId)}></i>
        <div className="p-a-0" onClick={(e) => this.productDetail(e, `/product/detail/${skuId}`, index)}>
          <img className="img-fluid" src={indexImg} alt="" />
        </div>
        <div className="hb-product-bd" onClick={(e) => this.productDetail(e, `/product/detail/${skuId}`, index)}>
          <div className="ellipsis_two">{skuName}</div>
          <div className="hb-product-price">
            <span>¥ {(bizPrice / 100).toFixed(2)}</span>
          </div>
          <div className="f-sm hb-info-block">
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
      </li>
    );
  }

  renderProduct() {
    const {
      productPagination
    } = this.props;
    const {listType} = this.state;

    const {ids, entity, lastPage, isFetching} = productPagination;

    if (!ids) {
      return (
        <div className="page-loading">载入中，请稍后 ...</div>
      );
    } else if (ids.length === 0) {
      return (
        <div style={{marginTop: '14rem'}}>
          <img className="hb-no-items" src={noItems}/>
          <p className="m-t-2 text-center text-muted">暂无礼物</p>
        </div>
      );
    }

    return (
      <ScrollLoad loadMore={this.loadMore}
                  hasMore={!lastPage}
                  isLoading={isFetching}
                  className={classnames({'hb-main-header': true, loading: isFetching})}
                  useDocument={false}
                  loader={<div className=""></div>}
                  ref="productList">
        <ul className={`hb-list ${listType==='block'?'cate-hb-list':null}`}>
          {
            ids ? ids.map((item, index) => {
              return listType==='block'?
                this.renderProductBlockItem(entity[item], index):
                this.renderProductListItem(entity[item], index);
            }) : null
          }
        </ul>
      </ScrollLoad>
    );
  }

  render() {
    const {selectedProduct, categoryList} = this.props;
    const {showFoot, listType, filter, priceOrder, tabFlag, sectionIndex, lowPrice, highPrice} = this.state;
    const btnDisabled = !selectedProduct;
    const iconUrl = listType === 'list' ? 'category/icon-block.png' : 'category/icon-list.png' ;
    const filterClass = classnames({
      'cate-filter-list': true,
      'active': filter
    });
    const parrow = priceOrder?'arrow-primary':'arrow-gray';
    const parrow2 = priceOrder?'arrow-gray':'arrow-primary';

    return (
      <div>
        {<CategorySearch
          categoryList={categoryList}
        />}
        <div className="cate-nav">
          <div className="cate-filter-nav">
            <a href="#" className={`btn-tab ${tabFlag==='hot'?"active":null}`} onClick={(e) => this.switchTab(e, 'hot')}>人气</a>
            <a href="#" className={`btn-tab ${tabFlag==='new'?"active":null}`} onClick={(e) => this.switchTab(e, 'new')}>新品</a>
            <a href="#" className={`btn-tab pos-r ${tabFlag==='price'?"active":null}`} onClick={(e) => this.switchTab(e, 'price')}>
              价格
              <span className={`arrow-top pos-a m-l-0-3 ${parrow}`} style={{top: '0.9rem'}}></span>
              <span className={`arrow-bottom pos-a m-l-0-3 ${parrow2}`} style={{bottom: '0.9rem'}}></span>

            </a>
            <a href="#" className={`btn-tab pos-r ${tabFlag==='filter'?"active":null}`} onClick={this.switchFilter}>
              筛选
              {
                filter ? (<span className="arrow-top pos-a m-l-0-3 arrow-gray" style={{top: '1.1rem'}}></span>) :
                  (<span className="arrow-bottom pos-a m-l-0-3 arrow-gray" style={{bottom: '1.3rem'}}></span>)
              }
            </a>
            <a href="#" className="btn-cate-filter" onClick={this.switchIcon}><img src={this.rootUrl + iconUrl} alt="" /></a>
          </div>
          <div className={filterClass}>
            <div className="cate-filter-wrap">
              <div className="row m-b-2">
                <div className="col-8">
                  <button className={`btn btn-block ${sectionIndex===0?"active":null}`} onClick={(e) => this.setPriceSection(e, 0)}>1 - 50</button>
                </div>
                <div className="col-8">
                  <button className={`btn btn-block ${sectionIndex===1?"active":null}`} onClick={(e) => this.setPriceSection(e, 1)}>5 - 200</button>
                </div>
                <div className="col-8">
                  <button className={`btn btn-block ${sectionIndex===2?"active":null}`} onClick={(e) => this.setPriceSection(e, 2)}>200 - 500</button>
                </div>
              </div>
              <div className="row">
                <div className="col-8">
                  <input type="tel" value={lowPrice} placeholder="最低价" ref="$lowPrice"
                         onChange={(e) => this.handleChange(e, 'lowPrice')}
                         onFocus={() => this.handleFocus()} />
                  <span className="pos-a line"></span>
                </div>
                <div className="col-8">
                  <input type="tel" value={highPrice} placeholder="最高价" ref="$highPrice"
                         onChange={(e) => this.handleChange(e, 'highPrice')}
                         onFocus={() => this.handleFocus()} />
                </div>
                <div className="col-8">
                  <button className="btn fl btn-filter-reset" onClick={this.resetPriceSection}>重置</button>
                  <button className="btn fr btn-filter-confirm active" onClick={(e) => this.confirmPriceSection(e)}>确认</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {this.renderProduct()}
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
  categoryList: PropTypes.object,
  indexActions: PropTypes.object,
  categoryActions: PropTypes.object,
  productPagination: PropTypes.object,
  activeTab: PropTypes.string,
  priceOrder: PropTypes.string,
  selectedProduct: PropTypes.string,
  fromType: PropTypes.string,
  categoryId: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string
  ]),
  productDetail: PropTypes.object,
  skuId: PropTypes.string,
  view: PropTypes.string,
};

export default ProductList;
