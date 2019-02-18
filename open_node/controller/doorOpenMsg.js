// 开门记录查询
const validation = require('../biz/validation'); // 验证token
const { sequelize } = require('../biz/connect_mysql'); // 连接数据库返回查询方法
const tools = require("../tools/tools"); // 工具
const code = require('../common/code'); // 编码工具
const log4js = require('../biz/connect_log4js');
const apicode = "C003";

// 校验值 0-无数据，1-正常，2-不匹配
function matchingRate({ unionCode, thirdTradeNo }, devUser, callback) {
    let sql = `SELECT vendor_id FROM door_open_record `;
    if (unionCode) {
        sql += ` WHERE union_code='${unionCode}'`;
    } else if (thirdTradeNo) {
        sql += ` WHERE third_trade_no='${thirdTradeNo}'`;
    } else {
        callback(0);
    }
    sequelize.query(sql, { type: sequelize.QueryTypes.SELECT })
        .then(res => {
            if (res.length == 0) {
                callback(0);
                return;
            }
            sequelize.query("SELECT user_id FROM vendor WHERE status <> -1 AND id = '" + res[0].vendor_id + "'", { type: sequelize.QueryTypes.SELECT })
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
        });
}
function openMsgTab(body, callback) {
    let sql = `SELECT act_type, third_trade_no,  DATE_FORMAT(call_time,'%Y-%m-%d %H:%i:%s') as call_time, DATE_FORMAT(open_time,'%Y-%m-%d %H:%i:%s') as open_time, DATE_FORMAT(close_time,'%Y-%m-%d %H:%i:%s') as close_time, order_id , third_user_id, vendor_id FROM door_open_record `;
    if (body.unionCode) {
        sql += ` WHERE union_code='${body.unionCode}'`;
    } else if (body.thirdTradeNo) {
        sql += ` WHERE third_trade_no='${body.thirdTradeNo}'`;
    } else {
        callback(null);
    }
    sequelize.query(sql, { type: sequelize.QueryTypes.SELECT })
        .then(res => {
            if (res.length == 0) {
                callback(null);
                return;
            }
            callback({
                actType: res[0].act_type,
                callTime: res[0].call_time,
                closeTime: res[0].close_time,
                openTime: res[0].open_time,
                orderId: res[0].order_id,
                thirdUserId: res[0].third_user_id,
                vendorId: res[0].vendor_id,
                thirdTradeNo: res[0].third_trade_no
            });
        });
}
module.exports = (req, res, next) => {
    validation(req.headers.authorization, apicode, (verify, appid, devUser) => {// token验证
        if (verify === 0) {// token验证成功 -> 获取参数
            tools.GetParameter(req, body => {
                try {
                    log4js(true, req.route.path, body, (log) => { });
                    if (body.unionCode != null && body.unionCode != undefined && body.unionCode != '' || body.thirdTradeNo != null && body.thirdTradeNo != undefined && body.thirdTradeNo != '') {
                        matchingRate(body, devUser, (matchingDegree) => {
                            if (matchingDegree == 0) {
                                tools.Error_Response(code.queryNoData, (cb) => {
                                    res.send(cb);
                                    log4js(true, req.route.path, cb, (log) => { });
                                });
                            }
                            if (matchingDegree == 1) {
                                openMsgTab(body, openMsgCb => {// 查询开门结果
                                    if (openMsgCb == null) { // 查询无数据
                                        tools.Error_Response(code.queryNoData, (cb) => {
                                            res.send(cb);
                                            log4js(true, req.route.path, cb, (log) => { });
                                        });
                                        return;
                                    }
                                    tools.Success_Response(openMsgCb, code.successOk, (cb) => {
                                        cb.doorInfo = cb.data;
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
                            cb.result.msg = cb.result.msg + 'unionCode,thirdTradeNo';
                            res.send(cb);
                            log4js(true, req.route.path, cb, (log) => { });
                        });
                    }

                } catch (e) {// 查询开门失败  异常
                    tools.Error_Response(code.invalidCall, (cb) => {
                        res.send(cb);
                        log4js(false, req.route.path, e, (log) => { });
                    });
                }
            });
        } else {// token验证失败 -> 过期
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
