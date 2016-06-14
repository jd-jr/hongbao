import React from 'react';
import {Route, IndexRoute} from 'react-router';
import App from '../containers/App';
import HomePage from '../containers/HomePage';

// 注意嵌套路由应该是相对路径，不能写成据对路径
export default (
  <Route path="/" component={App}>
    <IndexRoute component={HomePage}
                onEnter={enter()} onLeave={leave()}/>
  </Route>
);

//进入
function enter() {
  console.debug('进入');
}

//离开
function leave() {
  console.debug('离开');
}
