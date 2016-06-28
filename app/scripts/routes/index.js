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
import UnpackPage from '../containers/UnpackPage';
import routeSetting from './routeSetting';

const {enterHandler} = routeSetting;

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
    <Route path="unpack/:id" component={UnpackPage}/>
    <Route path="hongbao/detail/:id/:thirdAccId" component={HongbaoDetailPage}/>
    <Route path="my" component={MyHongbaoPage}/>
  </Route>
);
