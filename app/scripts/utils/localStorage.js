const _localStorage = window.localStorage;

/**
 * 设置数据
 * @param key
 * @param value
 */
export function setLocalStorage(key, value) {
  _localStorage.setItem(key, value);
}

/**
 * 读取数据
 * @param key
 * @returns {*} 返回的值都是字符串,即使设置的时候是数字或布尔
 */
export function getLocalStorage(key) {
  return _localStorage.getItem(key);
}

/**
 * 删除数据
 * @param key
 */
export function removeLocalStorage(key) {
  return _localStorage.removeItem(key);
}
