const express = require('express');
const http = require('http');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const routes = require('./routes/index');

const app = express();


app.use(cookieParser());
// app.use(bodyParser.raw({ type: 'application/json' }));

app.use((req, res, next) => {
  res.set({
    'Access-Control-Allow-Origin': 'http://sub.tedyhy.com',
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type',
    'P3P': 'CP=CAO PSA OUR',
  });

  next();
});

app.use('/', routes);

app.set('port', '3000');
const server = http.createServer(app);

server.listen('3000');

