import React from 'react';
import {Route, IndexRoute} from 'react-router';
import App from '../containers/App';
import HomePage from '../containers/HomePage';
import ProductPage from '../containers/ProductPage';
import ProductList from '../components/product/ProductList';
import Product from '../components/product/Product';
import Authorize from '../components/hongbao/Authorize';
import HongbaoDetailPage from '../containers/HongbaoDetailPage';
import MyHongbaoPage from '../containers/MyHongbaoPage';
import UserAddressList from '../components/userAddressList/'
import AddAddress from '../components/addAddress/'
import SelectCity from '../components/selectCity/'
import Logistics from '../components/logisticsInfo/'
import Help from '../components/explain/Help';
import Protocol from '../components/explain/Protocol';
import Test from '../components/Test';
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
    <Route path="authorize/:identifier" component={Authorize}
           onEnter={() => enterHandler('authorize')}/>
    /* unpack/:identifier 是从抢红包入口进入
    * hongbao/detail/view/:identifier 是从红包列表进入查看红包详情
    * */
    <Route path="unpack/:identifier" component={HongbaoDetailPage}
           onEnter={() => enterHandler('unpack')}/>
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
    <Route path="help" component={Help}
           onEnter={() => enterHandler('help')}/>
    <Route path="protocol" component={Protocol}
           onEnter={() => enterHandler('protocol')}/>
    <Route path="test/linder" component={Test}
           onEnter={() => enterHandler('test')}/>
  </Route>
);
