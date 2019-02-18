// 设备注册
const validation = require("../biz/validation"); // 验证token
const request = require("../biz/http_request");
const tools = require("../tools/tools"); // 工具
const code = require("../common/code"); // 工具
const path = require("../config/path_config");
const log4js = require('../biz/connect_log4js');//log4js
const parameter = require("../tools/parameter");  // 参数校验
const encryption = require("../tools/encryption");  // 加密
const apicode = "V001";
const vendorAdd = (body, appid, devUser, addVendorCb) => {//  接口所需数据
    const data = JSON.stringify({
        appId: appid,
        businessUserId: devUser,
        did: body.vendorDid,
        mac: body.vendorDid,
        provinceId: body.provinceId,
        cityId: body.cityId,
        districtId: body.districtId,
        address: body.address,
        abbreviatedAddress: body.abbrAddress,
        recognitionType: body.recType,
        maintainPersonPhone: body.attPhone,
        maintainPersonName: body.attName,
        bdPhone: body.bdPhone,
        bdName: body.bdName,
        memo: body.memo,
        snCode: body.snCode,
        doorStructure: body.doorStructure
    });
    encryption(data, (en_data) => {
        const options = {
            host: path.OWN_PATH,
            port: 80,
            path: '/v1/business/vendor/open/add',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(en_data)
            }
        };
        request(options, en_data, (res) => {
            try {
                addVendorCb(res);
            } catch (e) {
                addVendorCb(null);
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
                            vendorAdd(body, appid, devUser, (addVendorData) => {
                                if (!addVendorData.result) {
                                    tools.Error_Response(code.invalidCall, (cb) => {
                                        res.send(cb);
                                        log4js(false, req.route.path, cb, (log) => { });
                                    });
                                    return;
                                }
                                switch (addVendorData.result.code) {
                                    case 75006: // 设备SN信息已存在
                                        tools.Error_Response(code.equipmentInitSnError, (cb) => {
                                            res.send(Object.assign({ vendorId: addVendorData.vendorId }, cb));
                                            log4js(true, req.route.path, cb, (log) => { });
                                        });
                                        break;
                                    case 75007: // 设备DID信息已存在
                                        tools.Error_Response(code.equipmentInitDidError, (cb) => {
                                            res.send(Object.assign({ vendorId: addVendorData.vendorId }, cb));
                                            log4js(true, req.route.path, cb, (log) => { });
                                        });
                                        break;
                                    case 70004: // 无效参数
                                        addVendorData.result.code = "S00004";
                                        let data = Object.assign({ vendorId: addVendorData.vendorId }, addVendorData);
                                        res.send(data);
                                        log4js(true, req.route.path, data, (log) => { });
                                        break;
                                    case 75001: // 设备不存在
                                        tools.Error_Response(code.equipmentMsgError, (cb) => {
                                            res.send(Object.assign({ vendorId: addVendorData.vendorId }, cb));
                                            log4js(true, req.route.path, cb, (log) => { });
                                        });
                                        break;
                                    case 0: // 成功
                                        tools.Error_Response(code.successOk, (cb) => {
                                            res.send(Object.assign({ vendorId: addVendorData.vendorId }, cb));
                                            log4js(true, req.route.path, cb, (log) => { });
                                        });
                                        break;
                                    case 70005: // 接口调用异常
                                        tools.Error_Response(code.invalidCall, (cb) => {
                                            res.send(Object.assign({ vendorId: addVendorData.vendorId }, cb));
                                            log4js(false, req.route.path, cb, (log) => { });
                                        });
                                        break;
                                    default: // 接口调用异常
                                        tools.Error_Response(code.invalidCall, (cb) => {
                                            res.send(Object.assign({ vendorId: addVendorData.vendorId }, cb));
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