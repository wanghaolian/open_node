// 订单查询
const validation = require('../biz/validation'); // 验证token
const { sequelize } = require('../biz/connect_mysql'); // 连接数据库返回查询方法
const tools = require("../tools/tools"); // 工具
const code = require('../common/code'); // 编码工具
const log4js = require('../biz/connect_log4js');
const apicode = "O002";

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
function orderTab(body, appid, devUser, callback) {
    order = null;
    unionCode = null;
    thirdTradeNo = null;
    let sql = `SELECT DATE_FORMAT( orders.create_time, '%Y-%m-%d %H:%i:%s' ) AS createTime,orders.id AS orderId,DATE_FORMAT( orders.paied_time, '%Y-%m-%d %H:%i:%s' ) AS payTime,orders.total AS total,orders.vendor_id AS vendorId, orders.review_status AS reviewStatus,orders.status AS status,door_open_record.third_trade_no AS thirdTradeNo,door_open_record.third_user_id AS thirdUserId,door_open_record.union_code AS unionCode,order_item.amount AS count,order_item.sku_id AS productSkuId,order_item.price AS price,order_item.total_price AS totalPrice,pdk.image AS image,pdk.property AS property,product.name AS productName,ptc.third_product_sku_id AS thirdProductSkuId FROM orders LEFT JOIN door_open_record on door_open_record.order_id = orders.id LEFT JOIN order_item on orders.id = order_item.order_id LEFT JOIN product_sku pdk on pdk.id = order_item.sku_id LEFT JOIN product on product.id = pdk.product_id LEFT JOIN product_trans_code ptc on (ptc.product_sku_id = pdk.id AND ptc.business_user_id = ${devUser}) `;
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
                let orderStatus = 1,
                    orderMemo = "正常订单";
                if (res[0].reviewStatus == 4) {
                    orderStatus = 2;
                    orderMemo = "异常订单";
                }
                if (res[0].reviewStatus == null || res[0].reviewStatus == 0 || res[0].reviewStatus == 3) {
                    orderStatus = 0;
                    orderMemo = "订单生成中";
                }
                if ((res[0].reviewStatus == 1 || res[0].reviewStatus == 2) && res[0].status == 3) {
                    orderStatus = 3;
                    orderMemo = "无购买订单";
                }
                let data = {
                    "createTime": res[0].createTime,
                    "orderId": res[0].orderId,
                    "orderMemo": orderMemo,
                    "orderStatus": orderStatus,
                    "payTime": res[0].payTime,
                    "thirdUserId": res[0].thirdUserId,
                    "total": res[0].total,
                    "unionCode": res[0].unionCode,
                    "thirdTradeNo": res[0].thirdTradeNo,
                    "vendorId": res[0].vendorId,
                    "products": []
                };
                if (res[0].productSkuId != null) {
                    for (let i = 0; i < res.length; i++) {
                        data.products.push({
                            count: res[i].count,
                            image: res[i].image,
                            property: res[i].property,
                            price: res[i].price,
                            productSkuId: res[i].productSkuId,
                            totalPrice: res[i].totalPrice,
                            productName: res[i].productName,
                            thirdProductSkuId: res[i].thirdProductSkuId
                        });
                    }
                }
                callback(data);
            } else {
                callback(null);
            }
        });
}
module.exports = (req, res, next) => {
    REQ = req;
    RES = res;
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
                                orderTab(body, appid, devUser, orderCb => { // 查询订单结果
                                    if (orderCb == null) { // 查询无数据
                                        tools.Error_Response(code.queryNoData, (cb) => {
                                            res.send(cb);
                                            log4js(true, req.route.path, cb, (log) => { });
                                        });
                                        return;
                                    }
                                    tools.Success_Response(orderCb, code.successOk, (cb) => {
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

                    } else {// 参数有误
                        tools.Error_Response(code.invalidParameter, (cb) => {
                            cb.result.msg = cb.result.msg + 'orderId,unionCode,thirdTradeNo';
                            res.send(cb);
                            log4js(true, req.route.path, cb, (log) => { });
                        });
                    }
                } catch (e) {// 查询订单失败 异常
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