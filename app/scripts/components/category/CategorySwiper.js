import React, {Component, PropTypes} from 'react';
import ReactSwiper from '../../ui/ReactSwiper';
import {Link} from 'react-router';

// 商品详情页图片轮播图
class CategorySwiper extends Component {

  render() {
    let {items} = this.props;
    const swiperOptions = {
      preloadImages: true,
      autoplay: 4000,
      autoplayDisableOnInteraction: false
    };

    //例子数据
    /*if (!items || items.length === 0) {
      items = [];
      items.push({
        id: 1,
        keyword: '111',
        imgUrl: 'http://img12.360buyimg.com/cms/jfs/t2812/46/1557908128/260742/4648595c/5742d02eN8d52b027.jpg'
      }, {
        id: 2,
        keyword: '222',
        imgUrl: 'http://img12.360buyimg.com/cms/jfs/t2734/39/1554013866/132869/b9560fe3/5742d035Ne8c39bfc.jpg'
      }, {
        id: 3,
        keyword: '333',
        imgUrl: 'http://img12.360buyimg.com/cms/jfs/t2854/361/1554492173/55832/bc292ea/5742d03bN2e6a95b2.jpg'
      });
    }*/

    return (
      <ReactSwiper swiperOptions={swiperOptions} showPagination swiperClass="">
        {
          items && items.map((item) => {
            const {src, title, id, link} = item;
            return (
              <div className="slider-item swiper-slide" key={id}>
                <div className="slide-content">
                  {
                    link ? (
                      <a href={link}><img src={src} title={title} /></a>
                    ) : (
                      <Link to={`/category/subject/${id}?tab=false`}><img src={src} title={title} /></Link>
                    )
                  }
                </div>
              </div>
            );
          })
        }
      </ReactSwiper>
    );
  }
}

CategorySwiper.propTypes = {
  items: PropTypes.array,
};
export default CategorySwiper;
