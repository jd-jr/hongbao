import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import ReactSwiper from '../../ui/ReactSwiper';
import perfect from '../../utils/perfect';

// 入口页首次引导页
class GuideEntry extends Component {
  constructor(props) {
    super(props);
    const rootUrl = perfect.getLocationRoot() + 'images/guide-entry/';
    this.state = {
      items: [{
        id: '1',
        src: rootUrl + '1.png'
      }, {
        id: '2',
        src: rootUrl + '2.png'
      }, {
        id: '3',
        src: rootUrl + '3.png'
      }]
    };
    this.bodyH = document.documentElement.clientHeight;
    this.bodyW = document.documentElement.clientWidth;
    console.info(this.bodyH);
    console.info(this.bodyW);
  }

  render() {
    let {items} = this.state;
    const swiperOptions = {
      preloadImages: true,
      //autoplay: 4000,
      autoplayDisableOnInteraction: false,
      onTouchEnd: (swiper, event) => {
        if (swiper.activeIndex === 2) {
          this.context.router.replace('/');
        }
      }
    };

    //当屏幕高宽比大于图片高宽比时，设置 background-size: auto 100%;
    //否则设置 background-size: `${this.bodyW}px auto`
    //图片本身高宽比
    const imgScale = 1206 / 750;
    //屏幕高宽比
    const screenScale = this.bodyH / this.bodyW;

    return (
      <ReactSwiper swiperOptions={swiperOptions} showPagination swiperClass="hb-guidance-swiper">
        {
          items && items.map((item) => {
            const {src, id} = item;
            const style = {backgroundImage: `url("${src}")`, height: this.bodyH,};
            if (screenScale < imgScale) {
              style.backgroundSize = `${this.bodyW}px auto`;
            }
            return (
              <div className="slider-item swiper-slide" key={id}>
                <div className="slide-content">
                  <div className="hb-guidance-img"
                       style={style}></div>
                </div>
              </div>
            );
          })
        }
      </ReactSwiper>
    );
  }
}

GuideEntry.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default GuideEntry;
