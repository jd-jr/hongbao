import React, {Component, PropTypes} from 'react';
import assign from 'lodash/assign';
import Swiper from 'swiper';
import classnames from 'classnames';
import 'swiper/dist/css/swiper.css';

class ReactSwiper extends Component {
  constructor(props) {
    super(props);
    this.currentSwiper = null;
  }

  componentDidMount() {
    this.updateSwiper();
  }

  componentDidUpdate() {
    this.updateSwiper();
  }

  getSwiper() {
    return this.currentSwiper;
  }

  clearSwiper() {
    if (this.currentSwiper) {
      this.currentSwiper.destroy();
      this.currentSwiper = null;
    }
  }

  updateSwiper() {
    const swiper = this.getSwiper();
    if (swiper) {
      this.clearSwiper();
    }
    const {showPagination, swiperOptions} = this.props;
    const currentSwiper = new Swiper(this.refs.swiperContainer, assign({}, swiperOptions, showPagination ? {
      pagination: '.swiper-pagination'
    } : {}));

    this.currentSwiper = currentSwiper;
  }

  render() {
    const {children, showPagination, swiperClass} = this.props;
    const containerClass = swiperClass ? classnames({'swiper-container': true, [swiperClass]: true})
      : 'swiper-container';
    return (
      <div className={containerClass} ref="swiperContainer">
        <div className="swiper-wrapper">
          {children}
        </div>
        {showPagination ? (<div className="swiper-pagination"></div>) : null}
      </div>
    );

  }
}

ReactSwiper.defaultProps = {
  showPagination: false,
  nextButton: null,
  prevButton: null,
  scrollbar: null,
  swiperOptions: { //默认值待最终确定
    autoplay: 3000,
    speed: 400,
    loop: true,
    spaceBetween: 100
  }
};

ReactSwiper.propTypes = {
  children: PropTypes.node,
  swiperClass: PropTypes.string,
  showPagination: PropTypes.bool,
  nextButton: PropTypes.string,
  prevButton: PropTypes.string,
  scrollbar: PropTypes.string,
  swiperOptions: PropTypes.object
};

export default ReactSwiper;
