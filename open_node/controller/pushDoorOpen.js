// 关门通知
const mq_connect = require('../biz/connect_mq');
const publish = require('../biz/publish');
const pushService = require("../tools/pushService"); // push工具
const log4js = require('../biz/connect_log4js');
const { sequelize } = require('../biz/connect_mysql'); // 连接数据库返回查询方法
const apicode = "C004";

mq_connect('openDoorOpenConfirm', (cb) => {
    let businessUserIdCb = JSON.parse(cb);
    if (businessUserIdCb.businessUserId == '') return;
    sequelize.query("SELECT app_id FROM open_app_info WHERE dev_user = '" + businessUserIdCb.businessUserId + "'", { type: sequelize.QueryTypes.SELECT }).then(res => {
        sequelize.query("SELECT callback_url FROM open_api_auth WHERE app_id = '" + res[0].app_id + "' AND api_code = '" + apicode + "'", { type: sequelize.QueryTypes.SELECT }).then(url => {
            log4js(true, '开门状态推送前', businessUserIdCb, (log) => { });
            pushService(businessUserIdCb, url, (psuhResult, postData) => {
                if (psuhResult) {
                    log4js(true, '开门状态推送成功', postData, (log) => { });
                    log4js(true, '开门状态推送成功', decodeURIComponent(postData), (log) => { });
                } else {
                    publish('openDoorOpenConfirmDead', decodeURIComponent(postData), (cb) => {
                        log4js(false, '开门状态推送失败', postData, (log) => { });
                        log4js(false, '开门状态推送失败', decodeURIComponent(postData), (log) => { });
                    });
                }
            });
        });
    });
});























