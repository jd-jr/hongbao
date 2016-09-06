const express = require('express');
const http = require('http');

const routes = require('./routes/index');

const app = express();

app.use((req, res, next) => {
  res.set({
    'Access-Control-Allow-Origin': 'https://static.jdpay.com',
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type'
  });

  next();
});

app.use('/', routes);

app.set('port', '3000');
const server = http.createServer(app);

server.listen('3000');

