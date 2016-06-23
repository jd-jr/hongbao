import React from 'react';
import {Route, IndexRoute} from 'react-router';
import App from '../containers/App';
import HomePage from '../containers/HomePage';
import ProductPage from '../containers/ProductPage';
import ProductList from '../components/product/ProductList';
import Product from '../components/product/Product';
import HongbaoDetailPage from '../containers/HongbaoDetailPage';
import MyHongbaoPage from '../containers/MyHongbaoPage';
import InitiatePage from '../containers/InitiatePage';

// 注意嵌套路由应该是相对路径，不能写成据对路径
export default (
  <Route path="/" component={App}>
    <IndexRoute component={HomePage}/>
    <Route path="sponsor" component={HomePage}/>
    <Route path="product" component={ProductPage}>
      <IndexRoute component={ProductList}/>
      <Route path="detail/:skuId" component={Product}/>
      <Route path="detail/:view/:skuId" component={Product}/>
    </Route>
    <Route path="initiate" component={InitiatePage}/>
    <Route path="hongbao/detail/:id" component={HongbaoDetailPage}/>
    <Route path="hongbao/detail/:view/:id" component={HongbaoDetailPage}/>
    <Route path="my" component={MyHongbaoPage}/>
  </Route>
);

//进入
function enter() {
}

//离开
function leave() {
}
