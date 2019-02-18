const log4js = require("log4js");
const log4js_config = require("../config/log4js_config.json");
log4js.configure(log4js_config);
const LogFile = log4js.getLogger('log_file');
const LogError = log4js.getLogger('log_error');
const Log4js = (state, msg, cb, callback) => {
  if (state) {
    LogFile.info(msg);
    LogFile.info(cb);
    callback(msg);
  } else {
    LogError.error(msg);
    LogError.error(cb);
    callback(msg);
  }
};
module.exports = Log4js;
// LogFile.trace('This is a Log4js-Test');//输出
// LogFile.debug('We Write Logs with log4js');//普通
// LogFile.info('You can find logs-files in the log-dir');//正常
// LogFile.warn('log-dir is a configuration-item in the log4js.json');//警告
// LogFile.error('In This Test log-dir is : \'./logs/log_test/\'');//错误
// LogFile.fatal('Cheese was breeding ground for listeria.');//致命