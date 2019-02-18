// 开门
const validation = require("../biz/validation"); // 验证token
const request = require("../biz/http_request");
const tools = require("../tools/tools"); // 工具
const code = require("../common/code"); // 工具
const path = require("../config/path_config");
const log4js = require('../biz/connect_log4js'); //log4js
const parameter = require("../tools/parameter");  // 参数校验
const encryption = require("../tools/encryption");  // 加密
const apicode = "C001";
const openTheDoor = (body, appid, devUser, openTheDoorCb) => {
    body = Object.assign(body, {
        appId: appid,
        businessUserId: devUser
    });
    const data = JSON.stringify(body);
    encryption(data, (en_data) => {
        const options = {
            host: path.OWN_PATH,
            port: 80,
            path: '/v2/open/openTheDoor',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(en_data)
            }
        };
        request(options, en_data, (res) => {
            try {
                openTheDoorCb(res.unionCode, res);
            } catch (e) {
                openTheDoorCb(null, null);
            }
        });
    });

};

module.exports = (req, res, next) => {
    validation(req.headers.authorization, apicode, (verify, appid, devUser) => {
        if (verify === 0) {
            tools.PostParameter(req, (body) => {
                try {
                    log4js(true, req.route.path, body, (log) => { });
                    parameter(body, apicode, ({ verifyResult, mustName }) => { // 参数正确
                        if (verifyResult) {//调用开门接口
                            openTheDoor(body, appid, devUser, (openCbData, openCbDataMsg) => {
                                if (!openCbDataMsg.result) {
                                    tools.Error_Response(code.invalidCall, (cb) => {
                                        res.send(Object.assign({ unionCode: openCbData }, cb));
                                        log4js(false, req.route.path, cb, (log) => { });
                                    });
                                    return;
                                }
                                switch (openCbDataMsg.result.code) {
                                    case 72001:  // 货柜使用中
                                        tools.Error_Response(code.equipmentUserError, (cb) => {
                                            res.send(Object.assign({ unionCode: openCbData }, cb));
                                            log4js(true, req.route.path, cb, (log) => { });
                                        });
                                        break;
                                    case 72002: // 货柜补货中
                                        tools.Error_Response(code.equipmentManError, (cb) => {
                                            res.send(Object.assign({ unionCode: openCbData }, cb));
                                            log4js(true, req.route.path, cb, (log) => { });
                                        });
                                        break;
                                    case 72003: // 设备异常
                                        tools.Error_Response(code.equipmentError, (cb) => {
                                            res.send(Object.assign({ unionCode: openCbData }, cb));
                                            log4js(true, req.route.path, cb, (log) => { });
                                        });
                                        break;
                                    case 72005:// 设备网络异常
                                        tools.Error_Response(code.equipmentNetworkError, (cb) => {
                                            res.send(Object.assign({ unionCode: openCbData }, cb));
                                            log4js(true, req.route.path, cb, (log) => { });
                                        });
                                        break;
                                    case 72006:// 附属设备网络异常
                                        tools.Error_Response(code.equipmentAuNetworkError, (cb) => {
                                            res.send(Object.assign({ unionCode: openCbData }, cb));
                                            log4js(true, req.route.path, cb, (log) => { });
                                        });
                                        break;
                                    case 71001:// 设备信息与账号主体不符
                                        tools.Error_Response(code.equipmentMsgInconformity, (cb) => {
                                            res.send(Object.assign({ unionCode: openCbData }, cb));
                                            log4js(true, req.route.path, cb, (log) => { });
                                        });
                                        break;
                                    case 72004:// 设备有结算订单请稍后
                                        tools.Error_Response(code.equipmentOrderWait, (cb) => {
                                            res.send(Object.assign({ unionCode: openCbData }, cb));
                                            log4js(true, req.route.path, cb, (log) => { });
                                        });
                                        break;
                                    case 75001:// 设备信息不存在
                                        tools.Error_Response(code.equipmentMsgError, (cb) => {
                                            res.send(Object.assign({ unionCode: openCbData }, cb));
                                            log4js(true, req.route.path, cb, (log) => { });
                                        });
                                        break;
                                    case 70005:// 接口调用异常
                                        tools.Error_Response(code.invalidCall, (cb) => {
                                            res.send(Object.assign({ unionCode: openCbData }, cb));
                                            log4js(false, req.route.path, cb, (log) => { });
                                        });
                                        break;
                                    case 0:
                                        tools.Error_Response(code.successOk, (cb) => {
                                            res.send(Object.assign({ unionCode: openCbData }, cb));
                                            log4js(true, req.route.path, cb, (log) => { });
                                        });
                                        break;
                                    default:// 接口调用异常
                                        tools.Error_Response(code.invalidCall, (cb) => {
                                            res.send(Object.assign({ unionCode: openCbData }, cb));
                                            log4js(false, req.route.path, cb, (log) => { });
                                        });
                                }
                            });
                        } else { // 参数错误
                            tools.Error_Response(code.invalidParameter, (cb) => {
                                for (let i = 0; i < mustName.length; i++) {
                                    cb.result.msg = cb.result.msg + mustName[i];
                                }
                                res.send(cb);
                                log4js(true, req.route.path, cb, (log) => { });
                            });
                        }
                    });
                } catch (e) {// 异常
                    tools.Error_Response(code.invalidCall, (cb) => {
                        res.send(cb);
                        log4js(false, req.route.path, e, (log) => { });
                    });
                }
            });
        } else {
            if (verify == '无效token') {
                tools.Error_Response(code.invalidToken, (cb) => {
                    res.send(cb);
                    log4js(true, req.route.path, cb, (log) => { });
                });
            } else {
                tools.Error_Response(code.invalidJurisdiction, (cb) => {
                    res.send(cb);
                    log4js(true, req.route.path, cb, (log) => { });
                });
            }
        }
    });
};