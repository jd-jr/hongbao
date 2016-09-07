import React, {Component, PropTypes} from 'react';
import {findDOMNode} from 'react-dom';
import CategorySwiper from './CategorySwiper';
import CategorySearch from './CategorySearch';

//图片
import noItems from '../../../images/no_items.png';
import slashs from '../../../images/category/icon-slash.png';

class CategoryList extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
    };
  }

  componentWillMount() {
  }

  componentDidMount() {
    const {categoryActions} = this.props;
    const {getSubjectList, getCategoryList} = categoryActions;
    getCategoryList(); //获取分类数据
    getSubjectList(); //获取主题数据,包括"banner位信息、楼层主题信息"
  }

  componentWillUnmount() {
  }

  // 进入某一分类下的推荐商品页
  oneCateProduct(e, url) {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.preventDefault();
    e.nativeEvent.stopPropagation();
    this.context.router.push(url);
  }

  render() {
    const {subjectList, categoryList, categoryActions} = this.props;
    if (!subjectList || categoryList.isFetching) {
      return (
        <div className="page-loading">载入中，请稍后 ...</div>
      );
    }

    const {itemSubjectBanners = [], itemSubjectFloors = []} = subjectList;
    //处理Banner数据、楼层和主题数据
    const banners = itemSubjectBanners.map((item, index) => {
      return {id: index, src: item.subjectPic, title: item.subjectName}
    });

    return (
      <div>
        {<CategorySearch categoryList={categoryList} />}
        <article className="cate-article">
          <div className="cate-banner">
            <div className="banner-wrap">
              {banners? (<CategorySwiper items={banners}/>) : null}
            </div>
          </div>
          <div className="cate-floor-theme">
            {itemSubjectFloors.map((item, index) => {
              const {floorName, subjectFloors} = item;
              return (
                <div key={index}>
                  <div className="cate-floor text-center">
                    <img src={slashs} alt="" /><em>{floorName}</em><img src={slashs} alt={floorName} />
                  </div>
                  <ul className="row cate-theme">
                    {subjectFloors.map((sub, sindex)=>{
                      const {subjectPic="../../images/category/hot.jpg"} = sub;
                      return sub.subjectLink?(
                        <li key={sindex} className="col-12"><a href={sub.subjectLink}><img src={subjectPic} alt={sub.subjectName} /></a></li>
                      ):(
                        <li key={sindex} className="col-12" onClick={(e) => this.oneCateProduct(e, `/category/subject/${sub.id}`)}><img src={subjectPic} alt={sub.subjectName} /></li>
                      );
                    })}
                  </ul>
                </div>
              )
            })}
          </div>
        </article>
      </div>
    );
  }
}

CategoryList.contextTypes = {
  router: PropTypes.object.isRequired
};

CategoryList.propTypes = {
  categoryActions: PropTypes.object,
  subjectList: PropTypes.object,
  categoryList: PropTypes.object,
  activeTab: PropTypes.string,
  priceOrder: PropTypes.string,
};

export default CategoryList;
