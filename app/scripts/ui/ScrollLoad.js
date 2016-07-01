import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import offset from 'perfect-dom/lib/offset';

// 参考 https://github.com/nrako/react-component-scrollload
class ScrollLoad extends Component {
  constructor(props) {
    super(props);
    this.disablePointerTimeout = null;
    this.onScroll = this.debounce(() => {
      this.fireScroll()
    }, this.props.debounceInt);

    this.listenScroll();
    this.startTop; // 记录开始滑动坐标
    this.timeout;
  }

  componentWillUnmount() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.unListenScroll();
  }

  //防抖处理，默认延迟 100 毫秒
  debounce(func, wait) {
    return function () {
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
      this.timeout = setTimeout(func, wait);
    };
  }

  fireScroll() {
    const {disablePointer, hasMore, isLoading, useDocument, threshold, loadMore} = this.props;
    if (disablePointer > 0) {
      this.disablePointer();
    }

    if (!hasMore || isLoading) {
      return;
    }

    /*const clientHeight = document.body.clientHeight;
     const el = ReactDOM.findDOMNode(this);
     /!*const currentScroll = useDocument ?
     document.body.scrollTop + offset(el).top : el.scrollTop + el.offsetHeight;*!/

     const currentScroll = document.body.scrollTop + document.body.offsetHeight;

     if (currentScroll + threshold < clientHeight) {
     return;
     }*/

    const body = document.body;
    const viewHeight = document.documentElement.clientHeight;
    const scrollHeight = body.scrollHeight;
    const scrollTop = body.scrollTop;
    if (scrollTop + viewHeight + threshold > scrollHeight) {
      loadMore();
    }
  }

  disablePointer() {
    if (this.disablePointerTimeout === null) {
      this.refs.wrapper.classList.add(this.props.disablePointerClass);
    }

    clearTimeout(this.disablePointerTimeout);
    this.disablePointerTimeout = setTimeout(this.removeDisablePointerClass, this.props.disablePointer);
  }

  removeDisablePointerClass() {
    if (this.refs.wrapper) {
      this.refs.wrapper.classList.remove(this.props.disablePointerClass);
    }

    this.disablePointerTimeout = null;
  }

  listenScroll() {
    const {useDocument} = this.props;
    const el = useDocument ? window : ReactDOM.findDOMNode(this);

    el.addEventListener('scroll', this.onScroll);
  }

  unListenScroll() {
    const {useDocument} = this.props;
    const el = useDocument ? window : ReactDOM.findDOMNode(this);
    el.removeEventListener('scroll', this.onScroll);
  }

  render() {
    const {children, isLoading, loader, className} = this.props;
    return (
      <div className={className} ref="wrapper">
        {children && React.cloneElement(children, isLoading ? {loader} : {})}
      </div>
    );
  }

}


ScrollLoad.propTypes = {
  downInterval: PropTypes.number,
  debounceInt: PropTypes.number,
  hasMore: PropTypes.bool.isRequired,
  loadMore: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  useDocument: PropTypes.bool, //使用页面根元素作为滚动容器
  threshold: PropTypes.number, //偏移量
  loader: PropTypes.element, // loader 元素
  disablePointer: PropTypes.number,
  disablePointerClass: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.string
};

ScrollLoad.defaultProps = {
  downInterval: 30, // 默认向下滑动 30像素才触发滑动事件
  debounceInt: 100, //防抖处理，默认为100毫秒
  isLoading: false,
  useDocument: true,
  threshold: 10,
  loader: React.createElement('div', null, 'Loading...'),
  disablePointer: 0,
  disablePointerClass: 'disable-pointer'
};

export default ScrollLoad;
