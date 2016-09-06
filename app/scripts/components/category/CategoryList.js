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

  //渲染每个楼层主题
  renderProductItem(item, index) {

  }

  render() {
    const {subjectList, categoryList} = this.props;
    if (!subjectList || categoryList.isFetching) {
      return (
        <div className="page-loading">载入中，请稍后 ...</div>
      );
    }

    //处理Banner数据
    const banners = subjectList.itemSubjectBanners.map((item, index) => {
      return {id: index, src: item.subjectPic, title: item.subjectName}
    });
    //处理楼层和主题数据
    const floors = subjectList.itemSubjectFloors;

    return (
      <div>
        {<CategorySearch categoryList={categoryList} />}
        <article className="cate-article">
          <div className="cate-banner">
            <div className="banner-wrap">
              {/*<a href="#"><img src="../../images/category/banner-01.jpg" alt="" /></a>*/}
              {<CategorySwiper items={banners}/>}
            </div>
          </div>
          <div className="cate-floor-theme">
            {floors.map((item, index) => {
              const {floorName, subjectFloors} = item;
              return (
                <div key={index}>
                  <div className="cate-floor text-center">
                    <img src={slashs} alt="" /><em>{floorName}</em><img src={slashs} alt={floorName} />
                  </div>
                  <ul className="row cate-theme">
                    {subjectFloors.map((sub, sindex)=>{
                      const {subjectPic="../../images/category/hot.jpg"} = sub;
                      return (
                        <li key={sindex} className="col-12"><a href={sub.subjectLink}><img src={subjectPic} alt={sub.subjectName} /></a></li>
                      )
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
  children: PropTypes.node,
  location: PropTypes.object,
  categoryActions: PropTypes.object,
  subjectList: PropTypes.object,
  categoryList: PropTypes.object,
  activeTab: PropTypes.string,
  priceOrder: PropTypes.string,
  type: PropTypes.string,
  categoryId: PropTypes.number,
};

export default CategoryList;
