// 商品查询
const validation = require('../biz/validation'); // 验证token
const { sequelize } = require('../biz/connect_mysql'); // 连接数据库返回查询方法
const parameter = require("../tools/parameter");  // 参数校验
const tools = require("../tools/tools"); // 工具
const code = require('../common/code'); // 编码工具
const log4js = require('../biz/connect_log4js');
const apicode = "G001";

var OBJ = { total: 0, pages: 0 }, PAGE = { pageNo: 1, pageSize: 50 };
// pageNo 默认1 pageSize 默认50
function InitVar() {
    OBJ = { total: 0, pages: 0 };
    PAGE = { pageNo: 1, pageSize: 50 };
}
function skusTab(body, appid, devUser, callback) {
    if (body.pageNo) PAGE.pageNo = Number(body.pageNo);
    if (body.pageSize) PAGE.pageSize = Number(body.pageSize);
    let sql = `SELECT pdk.price AS commendedPrice, pdk.image AS image, pt.name AS productName, pdk.id AS productSkuId, pdk.barcode AS productBarCode, 
pdk.property AS property, ptc.third_product_sku_id AS thirdProductSkuId, pdk.weight AS weight FROM product_sku pdk LEFT JOIN product pt ON pt.id = pdk.product_id LEFT JOIN product_trans_code ptc ON ( pdk.id = ptc.product_sku_id AND ptc.business_user_id = ${devUser} ) WHERE pdk.id NOT IN(SELECT DISTINCT business_sku.sku_id AS id FROM business_sku WHERE business_sku.status = 1 AND business_sku.user_id <> ${devUser}) AND pt.STATUS = 1 AND pdk.STATUS =1`;

    if (body.productName) { sql += ` AND pt.Name LIKE '%${body.productName}%'`; }
    if (body.productSkuId) { sql += ` AND pdk.id=${body.productSkuId}`; }
    if (body.thirdProductSkuId) { sql += ` AND ptc.third_product_sku_id='${body.thirdProductSkuId}'`; }
    if (body.productTime) { sql += ` AND UNIX_TIMESTAMP(pdk.create_time) >= UNIX_TIMESTAMP('${body.productTime}')`; }
    sql += ` ORDER BY pdk.id ASC`;
    sequelize.query(sql, { type: sequelize.QueryTypes.SELECT }).then(res => {
        if (res.length == 0) {
            callback(null);
        } else {
            let len = res.length;
            OBJ.pages = Math.ceil(len / PAGE.pageSize);
            OBJ.total = res.length;
            let skusData = res.slice(((PAGE.pageNo - 1) * PAGE.pageSize), ((PAGE.pageNo - 1) * PAGE.pageSize) + PAGE.pageSize);
            callback(skusData);
        }
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
                            skusTab(body, appid, devUser, skusCb => {// 查询
                                if (skusCb == null) { // 查询无数据
                                    tools.Error_Response(code.queryNoData, (cb) => {
                                        res.send(cb);
                                        log4js(true, req.route.path, cb, (log) => { });
                                    });
                                    return;
                                }
                                tools.Success_Response(skusCb, code.successOk, (cb) => {
                                    cb.skus = cb.data;
                                    delete cb.data;
                                    res.send(Object.assign(cb, OBJ));
                                    log4js(true, req.route.path, cb, (log) => { });
                                });
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
                } catch (e) {// 查询商品失败 异常
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



