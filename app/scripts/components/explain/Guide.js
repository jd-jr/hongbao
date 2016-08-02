import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import ReactSwiper from '../../ui/ReactSwiper';
import perfect from '../../utils/perfect';

// 红包攻略
class Guide extends Component {
  constructor(props) {
    super(props);
    const rootUrl = perfect.getLocationOrigin() + '/images/guide/';
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
      }, {
        id: '4',
        src: rootUrl + '4.png',
        link: '/'
      }]
    };
    this.bodyH = document.documentElement.clientHeight;
  }

  render() {
    let {items} = this.state;
    const swiperOptions = {
      preloadImages: true,
      //autoplay: 4000,
      autoplayDisableOnInteraction: false
    };

    return (
      <ReactSwiper swiperOptions={swiperOptions} showPagination swiperClass="hb-guide-swiper">
        {
          items && items.map((item) => {
            const {src, id, link} = item;
            return (
              <div className="slider-item swiper-slide" key={id}>
                <div className="slide-content">
                  {
                    link ? (
                      <div className="hb-guide-img" style={{backgroundImage: `url("${src}")`, height: this.bodyH}}>
                        <Link className="hb-guide-btn-send" to={link}> </Link>
                      </div>) : (
                      <div className="hb-guide-img"
                           style={{backgroundImage: `url("${src}")`, height: this.bodyH}}></div>
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

Guide.propTypes = {
  items: PropTypes.array,
};
export default Guide;
