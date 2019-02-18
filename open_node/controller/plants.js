// 货道查询
const validation = require('../biz/validation'); // 验证token
const { sequelize } = require('../biz/connect_mysql'); // 连接数据库返回查询方法
const parameter = require("../tools/parameter");  // 参数校验
const tools = require("../tools/tools"); // 工具
const code = require('../common/code'); // 编码工具
const log4js = require('../biz/connect_log4js');
const apicode = "V005";

var OBJ = {};
// pageNo 默认1 pageSize 默认50
function InitVar() {
    OBJ = {};
}
// 校验值 0-无数据，1-正常，2-不匹配
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
function plantsTab(body, callback) {
    var sql = "SELECT plant.id AS plantId,plant.`name` AS plantName,plant.sensor_id AS sensorId,plant.count AS count,product.`name` AS productName,plant.sku_id AS productSkuId,product_trans_code.third_product_sku_id AS thirdProductSkuId FROM plant LEFT JOIN vendor_plant ON plant.id=vendor_plant.plant_id LEFT JOIN vendor ON vendor_plant.vendor_id=vendor.id LEFT JOIN product_sku ON plant.sku_id=product_sku.id LEFT JOIN product ON product_sku.product_id=product.id LEFT JOIN product_trans_code ON vendor.user_id=product_trans_code.business_user_id AND plant.sku_id=product_trans_code.product_sku_id WHERE vendor_plant.vendor_id=" + body.vendorId + " AND plant.sensor_id BETWEEN 1000 AND 1099 AND plant.`status`=1 AND vendor_plant.`status`!=-1 AND vendor.`status`!=-1 ORDER BY plant.`name` ASC";
    sequelize.query(sql, { type: sequelize.QueryTypes.SELECT }).then(res => {
        if (res.length == 0) {
            callback(null);
            return;
        }
        var plantInfos = [];
        for (var i = 0; i < res.length; i++) {
            var obj = {};
            obj = {
                plantId: res[i].plantId,
                plantName: res[i].plantName,
                sensorId: res[i].sensorId,
                skus: {
                    count: res[i].count,
                    productName: res[i].productName,
                    productSkuId: res[i].productSkuId,
                    thirdProductSkuId: res[i].thirdProductSkuId
                }
            };
            plantInfos.push(obj);
        }
        callback(plantInfos);
    });
}
module.exports = (req, res, next) => {
    InitVar();
    // token验证
    validation(req.headers.authorization, apicode, (verify, appid, devUser) => {
        if (verify == 0) {
            // token验证成功 -> 获取参数
            tools.GetParameter(req, body => {
                try {
                    log4js(true, req.route.path, body, (log) => { });
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
                                    plantsTab(body, plantsCb => {  // 查询
                                        if (plantsCb == null) { // 查询无数据
                                            tools.Error_Response(code.queryNoData, (cb) => {
                                                res.send(cb);
                                                log4js(true, req.route.path, cb, (log) => { });
                                            });
                                            return;
                                        }
                                        tools.Success_Response(plantsCb, code.successOk, (cb) => {
                                            cb.plantInfos = cb.data;
                                            delete cb.data;
                                            res.send(Object.assign(cb, OBJ));
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
                                for (let i = 0; i < mustName.length; i++) {
                                    cb.result.msg = cb.result.msg + mustName[i];
                                }
                                res.send(cb);
                                log4js(true, req.route.path, cb, (log) => { });
                            });
                        }
                    });
                } catch (e) {//查询货道失败 异常
                    tools.Error_Response(code.invalidCall, (cb) => {
                        res.send(cb);
                        log4js(false, req.route.path, cb, (log) => { });
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