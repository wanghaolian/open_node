// http请求，用于内部调用java接口
const http = require('http');
const log4js = require('./connect_log4js');//log4js
const reqWay = (options, postData, callback) => {
  try {
    let req = http.request(options, res => {
      let recvData = '';
      res.setEncoding('utf-8');
      res.on('data', chunk => {
        recvData += chunk;
      });
      res.on('end', () => {
        recvData = JSON.parse(recvData);
        log4js(true, res.req.path, recvData, (log) => { });
        callback(recvData, res.statusCode);
      });
    });
    req.on('error', err => {
      log4js(false, req.path, err, (log) => { });
    });
    req.write(postData);
    req.end();
  } catch (e) {
    log4js(false, req.path, e, (log) => { });
  }
};

module.exports = reqWay;





