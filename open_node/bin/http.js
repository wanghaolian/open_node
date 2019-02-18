const app = require("../proxy/proxy");
const log4js = require('../biz/connect_log4js');
const server = app.listen(8281, () => {
  const host = server.address().address, port = server.address().port;
  log4js(true, "启动成功", "服务，访问地址为 http://:" + host + port, (log) => { });
});
process.on('uncaughtException', function (err) {
  log4js(false, '全局报错', 'Caught exception: ' + err, (log) => { });
});
