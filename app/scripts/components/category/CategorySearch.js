import React, {Component, PropTypes} from 'react';
import classnames from 'classnames';
import perfect from '../../utils/perfect'

//渲染商品分类搜索头
class CategorySearch extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      showNavRight: false, //是否显示右侧分类
      isFocused: false, //搜索输入框是否聚焦
    };

    this.rootUrl = perfect.getLocationRoot() +'images/';

    this.showWishList = this.showWishList.bind(this);
    this.showNavRight = this.showNavRight.bind(this);
    this.hideNavRight = this.hideNavRight.bind(this);
    this.searchInputFocus = this.searchInputFocus.bind(this);
    this.searchInputBlur = this.searchInputBlur.bind(this);
  }

  componentDidMount() {
  }

  //显示心愿单
  showWishList() {
    this.context.router.push('/wishlist');
  }

  //显示隐藏右侧分类导航栏
  showNavRight() {
    const {$cateNavRight} = this.refs;
    this.setState({'showNavRight': true}, () => {
      setTimeout(function () {
        $cateNavRight.className = 'cate-nav-right cate-right';
      }, 10);
    });
  }
  hideNavRight() {
    const {$cateNavRight} = this.refs;
    this.setState({'showNavRight': false}, () => {
      $cateNavRight.className = 'cate-nav-right';
    });
  }

  //搜索框聚焦事件
  searchInputFocus(e) {
    const {searchInput} = this.refs;
    this.setState({'isFocused': true});
    searchInput.focus();
  }
  searchInputBlur() {
    const {searchInput} = this.refs;
    this.setState({'isFocused': false});
    searchInput.blur();
  }

  // 进入某一分类下的推荐商品页
  oneCateProduct(e, url) {
    this.context.router.push(url);
  }

  render() {
    const {isFocused, showNavRight} = this.state;
    const {categoryList} = this.props;
    const {ids, entity} = categoryList;
    const focusClass = classnames({
      'search-input': true,
      'col-18': !isFocused,
      'col-20': isFocused
    });
    const inputClass = classnames({
      'input-search': true,
      'p-a-0': isFocused
    });

    return (
      <div>
        <header className="cate-top-fixed">
          {/*<div className="row header-wrap">*/}
            {/*<div className={focusClass}>*/}
              {/*{!isFocused?(<img className="icon-search" src={this.rootUrl + "category/icon-search.png"} />):null}*/}
              {/*<input type="text" className={inputClass} placeholder="搜索商品名称"*/}
                     {/*onClick={this.searchInputFocus}*/}
                     {/*ref="searchInput"*/}
              {/*/>*/}
              {/*{isFocused?(<img className="icon-search-focus" src={this.rootUrl + "category/icon-search-focus.png"} />):null}*/}
            {/*</div>*/}
            {/*{!isFocused ? (<div className="search-icons col-6 text-center">*/}
                {/*<div className="icon-wishlist fl" onClick={this.showWishList}>*/}
                  {/*<img src={this.rootUrl + "category/icon-wish.png"} alt="心愿单" />*/}
                    {/*<div>心愿单</div>*/}
                {/*</div>*/}
                {/*<div className="icon-category fr" onClick={this.showNavRight}>*/}
                  {/*<img src={this.rootUrl + "category/icon-cate.png"} alt="分类" />*/}
                    {/*<div>分类</div>*/}
                {/*</div>*/}
              {/*</div>) : null*/}
            {/*}*/}
            {/*{isFocused?(<div*/}
              {/*className="icon-cancel col-4 text-center"*/}
              {/*style={{display: "block"}}*/}
              {/*onClick={this.searchInputBlur}*/}
            {/*>取消</div>):null}*/}
          {/*</div>*/}
          <div className="row header-nav-wrap">
            <div className="icon-nav-wishlist col-12 text-center" onClick={this.showWishList}>
              <div><img src={this.rootUrl + "category/icon-wish.png"} alt="" />心愿单</div>
            </div>
            <div className="icon-nav-category col-12 text-center" onClick={this.showNavRight}>
              <div><img src={this.rootUrl + "category/icon-cate.png"} alt="" />分类</div>
            </div>
          </div>
        </header>
        <div className="cate-mask" style={{display: showNavRight?'block':'none'}}>
          <div className="cate-mask-wrap"
               onClick={this.hideNavRight}>
            <ul className="cate-nav-right" ref="$cateNavRight">
              {
                ids ? ids.map((item, index) => {
                  const cate = entity[item];
                  const {categoryName, categoryIcon} = cate;

                  return (
                    <li className="row" key={index}
                        onClick={(e) => this.oneCateProduct(e, `/category/category/${cate.id}`)}
                    >
                      <div className="col-5 cate-icon">
                        <img src={categoryIcon} />
                      </div>
                      <div className="col-19 text-left cate-name">{categoryName}</div>
                    </li>
                  )
                }) : null
              }
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

CategorySearch.contextTypes = {
  router: PropTypes.object.isRequired
};

CategorySearch.propTypes = {
  categoryActions: PropTypes.object,
  categoryList: PropTypes.object,
};

export default CategorySearch;
