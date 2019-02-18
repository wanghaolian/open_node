// 设备注销
const validation = require("../biz/validation"); // 验证token
const request = require("../biz/http_request");
const tools = require("../tools/tools"); // 工具
const code = require("../common/code"); // 工具
const path = require("../config/path_config");
const log4js = require('../biz/connect_log4js');//log4js
const parameter = require("../tools/parameter");  // 参数校验
const encryption = require("../tools/encryption");  // 加密
const apicode = "V002";
const vendorDelete = (body, appid, devUser, vendorDeleteCb) => {//  接口所需数据
    body = Object.assign(body, {
        appId: appid,
        businessUserId: devUser
    });
    const data = JSON.stringify(body);
    encryption(data, (en_data) => {
        const options = {
            host: path.OWN_PATH,
            port: 80,
            path: '/v1/business/vendor/open/unbind',
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(en_data)
            }
        };
        request(options, en_data, (res) => {
            try {
                vendorDeleteCb(res);
            } catch (e) {
                vendorDeleteCb(null);
            }
        });
    });
};
module.exports = (req, res, next) => {
    validation(req.headers.authorization, apicode, (verify, appid, devUser) => {
        if (verify === 0) {
            tools.DeleteParameter_join(req, (body) => {
                try {
                    log4js(true, req.route.path, body, (log) => { });
                    parameter(body, apicode, ({ verifyResult, mustName }) => { // 参数正确
                        if (verifyResult) {// 调用注册设备接口
                            vendorDelete(body, appid, devUser, (vendorDeleteCb) => {
                                if (!vendorDeleteCb.result) {
                                    tools.Error_Response(code.invalidCall, (cb) => {
                                        res.send(cb);
                                        log4js(false, req.route.path, cb, (log) => { });
                                    });
                                    return;
                                }
                                switch (vendorDeleteCb.result.code) {
                                    case 75001: // 设备不存在
                                        tools.Error_Response(code.equipmentMsgError, (cb) => {
                                            res.send(cb);
                                            log4js(true, req.route.path, cb, (log) => { });
                                        });
                                        break;
                                    case 75002: // 设备仍有待支付订单
                                        tools.Error_Response(code.equipmentPaymentError, (cb) => {
                                            res.send(cb);
                                            log4js(true, req.route.path, cb, (log) => { });
                                        });
                                        break;
                                    case 71001: // 设备信息与账号主体不匹配
                                        tools.Error_Response(code.equipmentMsgInconformity, (cb) => {
                                            res.send(cb);
                                            log4js(true, req.route.path, cb, (log) => { });
                                        });
                                        break;
                                    case 70004: // 无效参数
                                        vendorDeleteCb.result.code = "S00004";
                                        res.send(vendorDeleteCb);
                                        log4js(true, req.route.path, vendorDeleteCb, (log) => { });
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