// const query = require("../biz/connect_mysql"); // 连接数据库
const querystring = require('querystring'); // post参数解析

const postting = {
    // 获取get方式参数
    GetParameter: (req, callback) => {
        if (req.query.vendorId)
            req.query.vendorId = Number(req.query.vendorId);
        if (req.query.stockType)
            req.query.stockType = Number(req.query.stockType);
        if (req.query.productSkuId)
            req.query.productSkuId = Number(req.query.productSkuId);
        if (req.query.pageSize)
            req.query.pageSize = Number(req.query.pageSize);
        if (req.query.pageNo)
            req.query.pageNo = Number(req.query.pageNo);
        callback(req.query);
    },
    // 获取post方式参数
    PostParameter: (req, callback) => {
        let body = "";
        req.on('data', function (chunk) {
            body += chunk;    // 叠加参数
        });
        req.on('end', function () {
            if (body.includes('=')) {
                callback(querystring.parse(body));
            } else {
                callback(JSON.parse(body));
            }
        });
    },
    DeleteParameter_join: (req, callback) => {
        if (req.query.vendorId)
            req.query.vendorId = Number(req.query.vendorId);
        callback(req.query);
    },
    // 返回操作mysql方法 增删改查
    // SqlMethods: (sql, ect, callback) => {
    //     let override = sql;
    //     for (let i = 0; i < ect.length; i++) { override = override.replace('?', ect[i]); }
    //     callback(override);
    // },
    // 连接数据库
    // SqlConnect: (sql, callback) => {
    //     return new Promise((resolve, reject) => {
    //         query(sql, (err, results, fields) => {
    //             if (err) {
    //                 console.log("错误");
    //                 reject('err');
    //             } else {
    //                 // console.log("正确");
    //                 resolve(results);
    //             }
    //         });
    //     });
    // },
    // 成功返回参数s
    Success_Response: (data, returned, callback) => {
        callback({
            "data": data,
            "result": { "code": returned.code, "msg": returned.msg }
        });
    },
    // 失败返回参数
    Error_Response: (returned, callback) => {
        callback({
            "result": { "code": returned.code, "msg": returned.msg }
        });
    },
    // 处理数据库参数
    // SqlFormatting: (data, callback) => {
    // callback(JSON.parse(JSON.stringify(data)));
    // }
    // RequestWay: (options, postData, callback) => {
    //     let req = https.request(options, res => {
    //         let recvData = ''
    //         res.setEncoding('utf-8');
    //         res.on('data', chunk => {
    //             recvData += chunk;
    //         });
    //         res.on('end', () => {
    //             recvData = JSON.parse(recvData);
    //             callback(recvData)
    //         });
    //     });
    //     req.on('error', function (err) {
    //         console.error('错' + err);
    //     });
    //     req.write(postData);
    //     req.end();
    // }
};
module.exports = postting;