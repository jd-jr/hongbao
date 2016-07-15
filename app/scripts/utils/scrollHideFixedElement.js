/**
 * 滑动隐藏 fixed 元素
 **/

//默认选项
let options = {
  debounceTime: 0,
  threshold: 10,
  hideElement: null,
  hideElementDisplay: null
};

//防抖处理 id
let timeoutId;
//停下来 timeout id
let stopTimeoutId;
//记录滑动偏移量
let offset = null;

//滑动事件，防抖处理，100毫秒以后，开始执行滑动事件
function onScroll() {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  if (options.debounceTime) {
    timeoutId = setTimeout(fireScroll, options.debounceTime);
  } else {
    fireScroll();
  }
}

//触发滑动事件
function fireScroll() {
  const {hideElement, hideElementDisplay, threshold} = options;
  const scrollTop = document.body.scrollTop;
  if (!offset) {
    offset = scrollTop;
  }
  //小于一定的值，不处理
  if (Math.abs(scrollTop - offset) < threshold) {
    return;
  }

  hideElement.style.display = 'none';

  if (stopTimeoutId) {
    clearTimeout(stopTimeoutId);
  }
  // 500 毫秒后显示
  stopTimeoutId = setTimeout(() => {
    //如果滚动停下来，则显示元素
    hideElement.style.display = hideElementDisplay;
    offset = null;
  }, 500);
}

/**
 * 注册滑动事件
 * @param debounceTime 防抖延迟时间，默认为 0 毫秒
 * @param threshold 滚动临界距离，默认为10px
 * @param hideElement 隐藏的元素
 */
export function scrollEvent({debounceTime = 0, threshold = 10, hideElement}) {
  if (!hideElement) {
    return;
  }

  let hideElementDisplay = hideElement.style.display;
  if (hideElementDisplay === 'none') {
    hideElementDisplay = 'block';
  }
  options = {debounceTime, threshold, hideElement, hideElementDisplay};
  window.addEventListener('scroll', onScroll, false);
}

export function unmountScrollEvent() {
  window.removeEventListener('scroll', onScroll, false);
  //重置状态
  timeoutId = null;
  stopTimeoutId = null;
  offset = null;
}
