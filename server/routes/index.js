const express = require('express');
const router = express.Router();

const data = require('../mockjs');

//商品列表
router.post('/redbag/item/list', (req, res, next) => {
  res.send(data.productList);
  //res.json(data.productList);
});

//分类信息
router.all('/redbag/item/category', (req, res, next) => {
  res.send(data.category);
});

//商品详情
router.post('/redbag/item/detail', (req, res, next) => {
  res.send(data.product);
});

//红包详情
router.post('/redbag/info', (req, res, next) => {
  res.send(data.info);
});

//创建红包
router.post('/redbag/create', (req, res, next) => {
  res.send(data.order);
});

//检测红包
router.all('/redbag/prepare/qiang', (req, res, next) => {
  res.send(data.validateHongbao);
});

//主题楼层数据
router.all('/redbag/item/subject', (req, res, next) => {
  res.send(data.subject);
});

module.exports = router;
