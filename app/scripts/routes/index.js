import React from 'react';
import {Route, IndexRoute} from 'react-router';
import App from '../containers/App';
import HomePage from '../containers/HomePage';
import ProductPage from '../containers/ProductPage';
import ProductList from '../components/product/ProductList';
import Product from '../components/product/Product';
import HongbaoDetailPage from '../containers/HongbaoDetailPage';
import MyHongbaoPage from '../containers/MyHongbaoPage';

import UserAddressList from '../components/userAddressList/'
import AddAddress from '../components/addAddress/'
import SelectCity from '../components/selectCity/'
import Logistics from '../components/logisticsInfo/'
import routeSetting from './routeSetting';
const {enterHandler} = routeSetting;

// 注意嵌套路由应该是相对路径，不能写成据对路径
export default (
  <Route path="/" component={App}>
    <IndexRoute component={HomePage}
                onEnter={() => enterHandler('home')}/>
    <Route path="initiate" component={HomePage}
           onEnter={() => enterHandler('initiate')}/>
    <Route path="product" component={ProductPage}>
      <IndexRoute component={ProductList}
                  onEnter={() => enterHandler('productList')}/>
      <Route path="detail/:skuId" component={Product}
             onEnter={() => enterHandler('product')}/>
      <Route path="detail/:view/:skuId" component={Product}
             onEnter={() => enterHandler('productView')}/>
    </Route>
    <Route path="unpack/:identifier" component={HongbaoDetailPage}
           onEnter={() => enterHandler('unpack')}/>
    <Route path="hongbao/detail/:identifier" component={HongbaoDetailPage}
           onEnter={() => enterHandler('detail')}/>
    <Route path="hongbao/detail/view/:identifier" component={HongbaoDetailPage}
           onEnter={() => enterHandler('detail')}/>
    <Route path="my" component={MyHongbaoPage}
           onEnter={() => enterHandler('my')}/>
    <Route path="myaddress" component={UserAddressList}
           onEnter={() => enterHandler('myaddress')}/>
    <Route path="addaddress" component={AddAddress}
           onEnter={() => enterHandler('addaddress')}/>
    <Route path="editaddress/:index" component={AddAddress}
           onEnter={() => enterHandler('editaddress')}/>
    <Route path="selectcity" component={SelectCity}
           onEnter={() => enterHandler('selectcity')}/>
    <Route path="logistics/:giftRecordId" component={Logistics}
           onEnter={() => enterHandler('logistics')}/>
  </Route>
);
