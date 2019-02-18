// 库存同步
const validation = require("../biz/validation"); // 验证token
const request = require("../biz/http_request");
const tools = require("../tools/tools"); // 工具
const code = require("../common/code"); // 工具
const path = require("../config/path_config");
const log4js = require('../biz/connect_log4js');//log4js
const parameter = require("../tools/parameter");  // 参数校验
const encryption = require("../tools/encryption");  // 加密
const apicode = "S001";
const stockChange = (body, appid, devUser, stockChangeCb) => {//  接口所需数据
    body = Object.assign(body, {
        appId: appid,
        businessUserId: devUser
    });
    const data = JSON.stringify(body);
    encryption(data, (en_data) => {
        const options = {
            host: path.OWN_PATH,
            port: 80,
            path: '/v2/stock/open/synchro',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(en_data)
            }
        };
        request(options, en_data, (res) => {
            try {
                stockChangeCb(res);
            } catch (e) {
                stockChangeCb(null);
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
                        if (verifyResult) {//调用库存接口
                            stockChange(body, appid, devUser, (stockChangeData) => {
                                if (!stockChangeData.result) {
                                    tools.Error_Response(code.invalidCall, (cb) => {
                                        res.send(cb);
                                        log4js(false, req.route.path, cb, (log) => { });
                                    });
                                    return;
                                }
                                switch (stockChangeData.result.code) {
                                    case 74001: // 托盘[X]在系统中未找到，库存同步失败
                                        stockChangeData.result.code = "FS00001";
                                        res.send(stockChangeData);
                                        log4js(true, req.route.path, stockChangeData, (log) => { });
                                        break;
                                    case 73001: // 商品ID[X]未找对应商品信息
                                        stockChangeData.result.code = "FG00001";
                                        res.send(stockChangeData);
                                        log4js(true, req.route.path, stockChangeData, (log) => { });
                                        break;
                                    case 75001: // 设备信息不存在
                                        tools.Error_Response(code.equipmentMsgError, (cb) => {
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
                                    case 70004: // 无效参数[X]
                                        stockChangeData.result.code = "S00004";
                                        res.send(stockChangeData);
                                        log4js(true, req.route.path, stockChangeData, (log) => { });
                                        break;
                                    case 70005: // 接口调用异常
                                        tools.Error_Response(code.invalidCall, (cb) => {
                                            res.send(cb);
                                            log4js(false, req.route.path, cb, (log) => { });
                                        });
                                        break;
                                    case 0: // 成功
                                        tools.Error_Response(code.successOk, (cb) => {
                                            res.send(cb);
                                            log4js(true, req.route.path, cb, (log) => { });
                                        });
                                        break;
                                    default:// 接口调用异常
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