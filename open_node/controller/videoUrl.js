// 视频查询
const validation = require('../biz/validation'); // 验证token
const { sequelize } = require('../biz/connect_mysql'); // 连接数据库返回查询方法
const tools = require("../tools/tools"); // 工具
const code = require('../common/code'); // 编码工具
const log4js = require('../biz/connect_log4js');
const OSS = require('ali-oss');
const apicode = "O003";

function matchingRate({ orderId, unionCode, thirdTradeNo }, devUser, callback) {
    let sql = `SELECT vendor_id FROM door_open_record`;
    if (orderId) {
        sql += ` WHERE order_id=${orderId}`;
    } else if (unionCode) {
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
function videoTab(body, appid, devUser, callback) {
    let sql = `SELECT orders.id AS orderId, orders.review_status AS reviewStatus,door_open_record.third_trade_no AS thirdTradeNo,door_open_record.union_code AS unionCode FROM orders LEFT JOIN door_open_record on door_open_record.order_id = orders.id LEFT JOIN order_item on orders.id = order_item.order_id LEFT JOIN product_sku pdk on pdk.id = order_item.sku_id LEFT JOIN product on product.id = pdk.product_id LEFT JOIN product_trans_code ptc on (ptc.product_sku_id = pdk.id AND ptc.business_user_id = ${devUser}) `;

    if (body.orderId) {
        sql += ` WHERE orders.id=${body.orderId}`;
    } else if (body.unionCode) {
        sql += ` WHERE door_open_record.union_code='${body.unionCode}'`;
    } else if (body.thirdTradeNo) {
        sql += ` WHERE door_open_record.third_trade_no='${body.thirdTradeNo}'`;
    } else {
        callback(null);
    }
    sequelize.query(sql, { type: sequelize.QueryTypes.SELECT })
        .then(res => {
            if (res.length > 0) {
                let data = {
                    "orderId": res[0].orderId,
                    "unionCode": res[0].unionCode,
                    "thirdTradeNo": res[0].thirdTradeNo,
                    "videoUrl": null
                };
                if (res[0].review_status == 4) {
                    sequelize.query("SELECT video_name FROM order_video WHERE order_id = '" + res[0].orderId + "'", { type: sequelize.QueryTypes.SELECT })
                        .then(res => {
                            if (res.length > 0) {
                                let client = new OSS({
                                    region: 'oss-cn-beijing',
                                    accessKeyId: 'LTAIKyndfbXb9TOY',
                                    accessKeySecret: 'apI0aeVSZnIINKNvIVBAeHeDuzmdzE',
                                    bucket: 'teatime-video'
                                });
                                let url = client.signatureUrl(res[0].video_name, { expires: 3600 });
                                let byReplace = "teatime-video.oss-cn-beijing.aliyuncs.com";
                                if(url.indexOf(byReplace) != -1){
                                    url = url.replace(byReplace, 'oss-teatime-video.51teatime.com');
                                }
                                data.videoUrl = url;
                                callback(data);
                            } else {
                                callback(null);
                            }
                        });
                } else {
                    callback(1);
                }
            } else {
                callback(null);
            }
        });
}
module.exports = (req, res, next) => {
    validation(req.headers.authorization, apicode, (verify, appid, devUser) => {// token验证
        if (verify === 0) {// token验证成功 -> 获取参数
            tools.GetParameter(req, body => {
                try {
                    log4js(true, req.route.path, body, (log) => { });
                    if (body.orderId != null && body.orderId != undefined && body.orderId != '' || body.unionCode != null && body.unionCode != undefined && body.unionCode != '' || body.thirdTradeNo != null && body.thirdTradeNo != undefined && body.thirdTradeNo != '') {
                        matchingRate(body, devUser, (matchingDegree) => {
                            if (matchingDegree == 0) {
                                tools.Error_Response(code.queryNoData, (cb) => {
                                    res.send(cb);
                                    log4js(true, req.route.path, cb, (log) => { });
                                });
                            }
                            if (matchingDegree == 1) {
                                videoTab(body, appid, devUser, videoCb => { // 查询订单结果
                                    if (videoCb == null) { // 查询无数据
                                        tools.Error_Response(code.queryNoData, (cb) => {
                                            res.send(cb);
                                            log4js(true, req.route.path, cb, (log) => { });
                                        });
                                        return;
                                    }
                                    if (videoCb == 1) { // 订单非异常订单，暂不支持视频调取
                                        tools.Error_Response(code.equipmentPaymentVideoError, (cb) => {
                                            res.send(cb);
                                            log4js(true, req.route.path, cb, (log) => { });
                                        });
                                        return;
                                    }
                                    tools.Success_Response(videoCb, code.successOk, (cb) => {
                                        cb = Object.assign(cb.data || {}, cb);
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
                    }
                } catch (e) {// 查询失败 异常
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