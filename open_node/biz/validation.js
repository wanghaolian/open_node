const redis = require("../biz/connect_redis"); // redis连接
//const tools = require("../tools/tools"); // 工具
let curUser, apiCode = [], apiName = [];
function getDevMessage(tok, callback) {
    redis.String_GetData('APP_ACCESS_TOKEN:' + tok, (data) => {
        // 开发者信息
        curUser = data;
        if (data) {// 成功返回信息
            callback(data, JSON.parse(data).app_id, JSON.parse(data).dev_user);
        } else {// 失败返回0
            callback(0, null, null);
        }
    });
}
function getDevUrlMessage(appid, callback) {
    redis.Hash_GetData("APP_API_AUTH:" + appid, hashGetData => {
        for (var i in hashGetData) {
            apiName.push(hashGetData[i]);
            apiCode.push(i);
        }
        callback();
    });
}
module.exports = (tok, code, callback) => {
    if (tok.indexOf(' ') != -1) {
        tok = tok.split(' ')[1];
    }
    // 获取开发者信息
    getDevMessage(tok, (data, appId, devUser) => {
        if (data == 0) {// 失败 - 无效token
            callback('无效token');
        } else { // 获取开发者接口信息 status
            getDevUrlMessage(appId, () => {
                if (curUser && apiCode.indexOf(code) != -1) {// 成功 token验证成功
                    callback(0, appId, devUser);
                } else {
                    callback('接口无权限'); // 失败 -
                }
            });
        }
    });
};