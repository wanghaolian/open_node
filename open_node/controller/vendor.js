// 设备查询
const validation = require('../biz/validation'); // 验证token
const { sequelize } = require('../biz/connect_mysql'); // 连接数据库返回查询方法
const tools = require("../tools/tools"); // 工具
const code = require('../common/code'); // 编码工具
const log4js = require('../biz/connect_log4js');
const apicode = "V003";

function matchingRate({ vendorDid, snCode }, devUser, callback) {
    let sql = `SELECT user_id FROM vendor WHERE status <> -1`;
    if (vendorDid) {
        sql += ` AND did='${vendorDid}'`;
    } else if (snCode) {
        sql += ` AND sn_Code='${snCode}'`;
    } else {
        callback(0);
    }
    sequelize.query(sql, { type: sequelize.QueryTypes.SELECT })
        .then(res => {
            if (res.length == 0) {
                callback(0);
                return;
            }
            if (res[0].user_id == devUser) {
                callback(1);
            } else {
                callback(2);
            }
        });
}
function vendorTab(body, callback) {
    let sql = `SELECT id,memo,sn_Code,did,door_structure,province_id,city_id,district_id,address,maintain_person_phone,maintain_person_name,bd_phone,bd_name,abbreviated_address,algorithm,pn_code FROM vendor WHERE status <> -1`;
    if (body.vendorDid) {
        sql += ` AND did='${body.vendorDid}'`;
    } else if (body.snCode) {
        sql += ` AND sn_Code='${body.snCode}'`;
    } else {
        callback(null);
    }
    sequelize.query(sql, { type: sequelize.QueryTypes.SELECT })
        .then(res => {
            if (res.length == 0) {
                callback(null);
                return;
            }
            let data = res.map((vendor, i) => {
                if (vendor.algorithm == 1) {
                    vendor.recType = 1;//纯重力
                } else {
                    if (vendor.pn_code == "G") {
                        vendor.recType = 2;
                    } else {
                        vendor.recType = 3;
                    }
                }
                return {
                    vendorId: vendor.id,
                    vendorDid: vendor.did,
                    abbrAddress: vendor.abbreviated_address,
                    address: vendor.address,
                    attName: vendor.maintain_person_name,
                    attPhone: vendor.maintain_person_phone,
                    bdName: vendor.bd_name,
                    bdPhone: vendor.bd_phone,
                    cityId: vendor.city_id,
                    districtId: vendor.district_id,
                    memo: vendor.memo,
                    provinceId: vendor.province_id,
                    recType: vendor.recType,
                    snCode: vendor.sn_Code,
                    doorStructure: vendor.door_structure
                };
            });
            callback(data);
        });
}
module.exports = (req, res, next) => {
    validation(req.headers.authorization, apicode, (verify, appid, devUser) => {// token验证
        if (verify === 0) {// token验证成功 -> 获取参数
            tools.GetParameter(req, body => {
                try {
                    log4js(true, req.route.path, body, (log) => { });
                    if (body.vendorDid != null && body.vendorDid != undefined && body.vendorDid != '' || body.snCode != null && body.snCode != undefined && body.snCode != '') {
                        matchingRate(body, devUser, (matchingDegree) => {
                            if (matchingDegree == 0) { // 设备信息不存在
                                tools.Error_Response(code.equipmentMsgError, (cb) => {
                                    res.send(cb);
                                    log4js(true, req.route.path, cb, (log) => { });
                                });
                            }
                            if (matchingDegree == 1) {
                                vendorTab(body, vendorCb => {// 查询
                                    if (vendorCb == null) { // 查询无数据
                                        tools.Error_Response(code.queryNoData, (cb) => {
                                            res.send(cb);
                                            log4js(true, req.route.path, cb, (log) => { });
                                        });
                                        return;
                                    }
                                    tools.Success_Response(vendorCb, code.successOk, (cb) => {
                                        cb.vendorInfo = cb.data;
                                        delete cb.data;
                                        res.send(cb);
                                        log4js(true, req.route.path, cb, (log) => { });
                                    });
                                });
                            }
                            if (matchingDegree == 2) {// 设备信息与账号主体不匹配
                                tools.Error_Response(code.equipmentMsgInconformity, (cb) => {
                                    res.send(cb);
                                    log4js(true, req.route.path, cb, (log) => { });
                                });
                            }
                        });
                    } else { // 参数有误
                        tools.Error_Response(code.invalidParameter, (cb) => {
                            cb.result.msg = cb.result.msg + 'vendorDid,snCode';
                            res.send(cb);
                            log4js(true, req.route.path, cb, (log) => { });
                        });
                    }
                } catch (e) {//查询货柜失败 异常
                    tools.Error_Response(code.invalidCall, (cb) => {
                        res.send(cb);
                        log4js(false, req.route.path, e, (log) => { });
                    });
                }

            });
        } else {
            // token验证失败 -> 过期
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
