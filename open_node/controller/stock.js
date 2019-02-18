// 库存查询
const validation = require('../biz/validation'); // 验证token
const { sequelize } = require('../biz/connect_mysql'); // 连接数据库返回查询方法
const tools = require("../tools/tools"); // 工具
const code = require('../common/code'); // 编码工具
const parameter = require("../tools/parameter");  // 参数校验
const log4js = require('../biz/connect_log4js');
const apicode = "S002";

let datas = { lastTime: null, vendorId: null, plantInfos: [] };
function stock() {
    datas = { lastTime: null, vendorId: null, plantInfos: [] };
}
function matchingRate({ vendorId }, devUser, callback) {
    sequelize.query("SELECT user_id FROM vendor WHERE status <> -1 AND id = '" + vendorId + "'", { type: sequelize.QueryTypes.SELECT })
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
function stockTab(body, appid, devUser, callback) {
    if (body.stockType == 2) {
        sequelize.query("SELECT plant_history_item.plant_id AS plantId,plant_history_item.count AS count,product.`name`AS productName,plant_history_item.sku_id AS productSkuId,product_trans_code.third_product_sku_id AS thirdProductSkuId ,DATE_FORMAT(plant_history.cr_time,'%Y-%m-%d %H:%i:%s')AS createTime FROM plant_history_item LEFT JOIN plant_history ON plant_history.id = plant_history_item.plant_history_id LEFT JOIN product_sku ON plant_history_item.sku_id = product_sku.id LEFT JOIN product ON product_sku.product_id = product.id LEFT JOIN vendor ON plant_history.vendor_id = vendor.id LEFT JOIN product_trans_code ON vendor.user_id = product_trans_code.business_user_id AND plant_history_item.sku_id = product_trans_code.product_sku_id WHERE plant_history_item.`status` <> - 1 AND plant_history_item.sku_id IS NOT NULL AND plant_history_id = (SELECT plant_history.id FROM plant_history WHERE vendor_id = '" + body.vendorId + "' AND UNIX_TIMESTAMP( plant_history.cr_time ) <= UNIX_TIMESTAMP('" + body.stockTime + "') AND STATUS <> - 1 ORDER BY plant_history.cr_time DESC LIMIT 1 ) ORDER BY plant_history_item.sku_id ASC", { type: sequelize.QueryTypes.SELECT }).then(res => {
            if (res.length == 0) {
                callback(null);
                return;
            }
            datas.vendorId = body.vendorId;
            datas.lastTime = res[0].createTime;
            res.map((data, i) => {
                datas.plantInfos.push({
                    count: data.count,
                    plantId: data.plantId,
                    productName: data.productName,
                    productSkuId: data.productSkuId,
                    thirdProductSkuId: data.thirdProductSkuId
                });
            });
            callback(datas);
        });
    } else if (body.stockType == 1 || body.stockType == null || body.stockType == undefined || body.stockType == '') {
        sequelize.query("SELECT plant.id AS plantId,plant.`name` AS plantName,plant.count AS count,product.`name` AS productName,plant.sku_id AS productSkuId,product_trans_code.third_product_sku_id AS thirdProductSkuId FROM plant LEFT JOIN vendor_plant ON plant.id = vendor_plant.plant_id LEFT JOIN vendor ON vendor_plant.vendor_id = vendor.id LEFT JOIN product_sku ON plant.sku_id = product_sku.id LEFT JOIN product ON product_sku.product_id = product.id LEFT JOIN product_trans_code ON vendor.user_id = product_trans_code.business_user_id AND plant.sku_id = product_trans_code.product_sku_id WHERE vendor_plant.vendor_id = '" + body.vendorId + "' AND plant.sensor_id BETWEEN 1000 AND 1099 AND plant.`status` = 1 AND vendor_plant.`status` = 1 AND plant.sku_id IS NOT NULL ORDER BY plant.sku_id ASC", { type: sequelize.QueryTypes.SELECT }).then(res => {
            if (res.length == 0) {
                callback(null);
                return;
            }
            datas.vendorId = body.vendorId;
            let newTime = new Date();
            timeFn(newTime, time => {
                datas.lastTime = time;
                res.map((data, i) => {
                    datas.plantInfos.push({
                        count: data.count,
                        plantId: data.plantId,
                        productName: data.productName,
                        productSkuId: data.productSkuId,
                        thirdProductSkuId: data.thirdProductSkuId
                    });
                });
                callback(datas);
            });
        });
    }
}
function timeFn(date, callback) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    let time = [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':');
    callback(time);
}
const formatNumber = n => {
    n = n.toString();
    return n[1] ? n : '0' + n;
};
module.exports = (req, res, next) => {
    validation(req.headers.authorization, apicode, (verify, appid, devUser) => {// token验证
        if (verify === 0) {// token验证成功 -> 获取参数
            tools.GetParameter(req, body => {
                try {
                    log4js(true, req.route.path, body, (log) => { });
                    stock();
                    parameter(body, apicode, ({ verifyResult, mustName }) => { // 参数正确
                        if (verifyResult) {
                            matchingRate(body, devUser, (matchingDegree) => {
                                if (matchingDegree == 0) { // 设备信息不存在
                                    tools.Error_Response(code.equipmentMsgError, (cb) => {
                                        res.send(cb);
                                        log4js(true, req.route.path, cb, (log) => { });
                                    });

                                }
                                if (matchingDegree == 1) {
                                    stockTab(body, appid, devUser, stockCb => {// 查询
                                        if (stockCb == null) { // 查询无数据
                                            tools.Error_Response(code.queryNoData, (cb) => {
                                                res.send(cb);
                                                log4js(true, req.route.path, cb, (log) => { });
                                            });
                                            return;
                                        }
                                        tools.Success_Response(stockCb, code.successOk, (cb) => {
                                            cb = Object.assign(cb.data, cb);
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
                                for (let i = 0; i < mustName.length; i++) {
                                    cb.result.msg = cb.result.msg + mustName[i];
                                }
                                res.send(cb);
                                log4js(true, req.route.path, cb, (log) => { });
                            });
                        }
                    });
                } catch (e) {//查询库存失败
                    tools.Error_Response(code.changeStockError, (cb) => {
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
