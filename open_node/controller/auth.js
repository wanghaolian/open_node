// 授权
const uuid = require('node-uuid'); // 设置token
const redis = require("../biz/connect_redis"); // redis连接
const tools = require("../tools/tools"); // 工具
const code = require('../common/code'); // 编码工具
const log4js = require('../biz/connect_log4js');//log4js
const open_app_info = require('../model/open_app_info.js');
const open_api_auth = require('../model/open_api_auth.js');

var RES, REQ, appId, appSecret, token_uid;
function save_token(data) {
    token_uid = uuid.v1();
    // 设置时长2小时uuid
    let datas = {
        app_id: JSON.parse(JSON.stringify(data))[0].app_id,
        dev_user: JSON.parse(JSON.stringify(data))[0].dev_user
    };
    redis.Setex_SetKey("APP_ACCESS_TOKEN:" + token_uid, 7200, datas, (r) => {
        if (r == 'OK') {
            // uuid保存redis成功 使用appId 获取 open_api_auth数据 开发者所有接口授权信息
            Dev_AuthInfo();
        } else {//uuid保存redis失败   异常
            tools.Error_Response(code.invalidCall, (cb) => {
                res.send(cb);
                log4js(false, REQ.route.path, 'uuid保存redis失败', (log) => { });
            });
        }
    });
}

function Dev_AuthInfo() {
    open_api_auth.findAll({
        where: {
            'app_id': appId
        }
    }).then(result => {
        var data = JSON.parse(JSON.stringify(result));
        // 获取信息成功！ 保存hash格式到redis
        let d = data.map((j, i) => {
            return {
                "api_code": j.api_code,
                "api_name": j.api_name
            };

        });
        save_HashRedis(d);
    });
}

function save_HashRedis(d) {
    redis.Hash_SetKey("APP_API_AUTH:" + appId, d, (s) => {
        if (s == 1 || s == 0) {
            // 保存/更新redis成功  给刚刚保存redis的hash设置时间 2h
            save_HashRedis_Time();
        } else {//开发者信息保存redis失败   异常
            tools.Error_Response(code.invalidCall, (cb) => {
                res.send(cb);
                log4js(false, REQ.route.path, '开发者信息保存redis失败', (log) => { });
            });
        }
    });
}

function save_HashRedis_Time() {
    redis.Expire_SetKey("APP_API_AUTH:" + appId, 7200, (s2) => {
        if (s2 == 1) {
            // 设置时间成功
            let result = {
                "code": code.successOk.code,
                "msg": code.successOk.msg
            };
            RES.send({
                "result": result,
                "accessToken": token_uid,
                "expiresIn": 7200
            });
            log4js(true, REQ.route.path, result, (log) => { });
            return;
        } else {//设置时间失败
            tools.Error_Response(code.invalidCall, (cb) => {
                res.send(cb);
                log4js(false, REQ.route.path, '设置时间失败', (log) => { });
            });
        }
    });
}

module.exports = (req, res, next) => {
    RES = res;
    REQ = req;
    try {
        tools.PostParameter(req, (body) => {
            log4js(true, req.route.path, body, (log) => { });
            // 获取开发者信息
            appId = body.appId;
            appSecret = body.appSecret;
            if (
                appId && appSecret &&
                // typeof appId == 'number' &&
                // !isNaN(appId) &&
                // Number(appId) &&
                appId != '' &&
                appId != undefined &&
                appId != null &&
                appSecret != '' &&
                appSecret != undefined &&
                appSecret != null
            ) {
                open_app_info.findAll({
                    where: {
                        'app_id': appId,
                        'app_secret': appSecret
                    }
                }).then(function (result) {
                    var data = (JSON.parse(JSON.stringify(result)));
                    if (data.length == 0) { // 数据不存在 无效的AppId或Secret
                        tools.Error_Response(code.invalidAuth, (cb) => {
                            res.send(cb);
                            log4js(true, req.route.path, cb, (log) => { });
                        });
                        return;
                    }
                    var sta = data[0].status, del = data[0].is_delete;
                    if (sta == 1 && del == 0) {// 成功 -> 生成uuid + obj 保存到redis
                        save_token(data);
                    } else {//无效的AppId或Secret
                        tools.Error_Response(code.invalidAuth, (cb) => {
                            res.send(cb);
                            log4js(true, req.route.path, cb, (log) => { });
                        });
                    }
                }).catch(function (err) {//无效的AppId或Secret
                    tools.Error_Response(code.invalidAuth, (cb) => {
                        res.send(cb);
                        log4js(true, req.route.path, cb, (log) => { });
                    });
                });
            } else { // 参数无效异常
                tools.Error_Response(code.invalidParameter, (cb) => {
                    res.send(cb);
                    log4js(true, req.route.path, cb, (log) => { });
                });
            }
        });
    } catch (e) { // 接口异常
        tools.Error_Response(code.invalidCall, (cb) => {
            res.send(cb);
            log4js(false, req.route.path, e, (log) => { });
        });
    }
};