// 货道设置
const validation = require("../biz/validation"); // 验证token
const request = require("../biz/http_request");
const tools = require("../tools/tools"); // 工具
const code = require("../common/code"); // 工具
const path = require("../config/path_config");
const log4js = require('../biz/connect_log4js');//log4js
const parameter = require("../tools/parameter");  // 参数校验
const encryption = require("../tools/encryption");  // 加密
const apicode = "V004";
const plantsChange = (body, appid, devUser, plantsChangeCb) => {//  接口所需数据
    body = Object.assign(body, {
        appId: appid,
        businessUserId: devUser
    });
    const data = JSON.stringify(body);
    encryption(data, (en_data) => {
        const options = {
            host: path.OWN_PATH,
            port: 80,
            path: '/v2/stock/open/vendors/plants',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(en_data)
            }
        };
        request(options, en_data, (res) => {
            try {
                plantsChangeCb(res);
            } catch (e) {
                plantsChangeCb(null);
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
                        if (verifyResult) {//调用注册设备接口
                            plantsChange(body, appid, devUser, (plantsChangeData) => {
                                if (!plantsChangeData.result) {
                                    tools.Error_Response(code.invalidCall, (cb) => {
                                        res.send(cb);
                                        log4js(false, req.route.path, cb, (log) => { });
                                    });
                                    return;
                                }
                                switch (plantsChangeData.result.code) {
                                    case 75001: // 设备不存在
                                        tools.Error_Response(code.equipmentMsgError, (cb) => {
                                            res.send(cb);
                                            log4js(true, req.route.path, cb, (log) => { });
                                        });
                                        break;
                                    case 75003: // 托盘[X]已设置商品，不能删除
                                        plantsChangeData.result.code = "FV00003";
                                        res.send(plantsChangeData);
                                        log4js(true, req.route.path, plantsChangeData, (log) => { });
                                        break;
                                    case 75004: // 该设备识别方案无需设置货道
                                        tools.Error_Response(code.containerNoError, (cb) => {
                                            res.send(cb);
                                            log4js(true, req.route.path, cb, (log) => { });
                                        });
                                        break;
                                    case 75005: // 托盘[X, X]设置失败，请重新设置
                                        plantsChangeData.result.code = "FV00005";
                                        res.send(plantsChangeData);
                                        log4js(true, req.route.path, plantsChangeData, (log) => { });
                                        break;
                                    case 71001: // 设备信息与账号主体不匹配
                                        tools.Error_Response(code.equipmentMsgInconformity, (cb) => {
                                            res.send(cb);
                                            log4js(true, req.route.path, cb, (log) => { });
                                        });
                                        break;
                                    case 70004: // 无效参数
                                        plantsChangeData.result.code = "S00004";
                                        res.send(plantsChangeData);
                                        log4js(true, req.route.path, plantsChangeData, (log) => { });
                                        break;
                                    case 0: // 成功
                                        tools.Error_Response(code.successOk, (cb) => {
                                            res.send(cb);
                                            log4js(true, req.route.path, cb, (log) => { });
                                        });
                                        break;
                                    case 70005: // 接口调用异常
                                        tools.Error_Response(code.invalidCall, (cb) => {
                                            res.send(cb);
                                            log4js(false, req.route.path, cb, (log) => { });
                                        });
                                        break;
                                    default: // 接口调用异常
                                        tools.Error_Response(code.invalidCall, (cb) => {
                                            res.send(cb);
                                            log4js(false, req.route.path, cb, (log) => { });
                                        });
                                }
                            });
                        } else { //参数错误
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
                    log4js(true, req.route.path, cb, (log) => { });
                    res.send(cb);
                });
            } else {
                tools.Error_Response(code.invalidJurisdiction, (cb) => {
                    log4js(true, req.route.path, cb, (log) => { });
                    res.send(cb);
                });
            }
        }
    });
};