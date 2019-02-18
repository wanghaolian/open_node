const request_https = require("../biz/https_request");
const request_http = require("../biz/push_http_request");
const log4js = require('../biz/connect_log4js');
let lock = 0, setTime = null, sendState = true;
module.exports = (content, url, callback) => {
    try {
        delete content.businessUserId;
        let host = url[0].callback_url.split('//')[1].split('/')[0];
        let protocol = url[0].callback_url.split(':')[0];
        let doSign = url[0].callback_url.split('/')[2];
        let path = url[0].callback_url.split(doSign)[1];
        content = JSON.stringify(content);
        let data = encodeURIComponent(content);
        let postData = JSON.stringify({ data });
        const options = {
            hostname: host,  //'127.0.0.1',
            // port : 8989,
            path: path,//'/v1/disanfangURL'
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        let pushGo = (options, postData) => {
            sendState = true;
            if (protocol == 'https') {
                request_https(options, postData, (res, statusCode) => {
                    if (statusCode == 200 && res == "success") {
                        log4js(true, "推送响应状态：" + statusCode, "推送响应信息：" + res, (log) => { });
                        sendState = false;
                        lock = 0;
                        clearInterval(setTime);
                        callback(true, postData);
                    } else {
                        log4js(true, "推送响应状态：" + statusCode, "推送响应信息：" + res, (log) => { });
                    }
                });
            } else {
                request_http(options, postData, (res, statusCode) => {
                    if (statusCode == 200 && res == "success") {
                        log4js(true, "推送响应状态：" + statusCode, "推送响应信息：" + res, (log) => { });
                        sendState = false;
                        lock = 0;
                        clearInterval(setTime);
                        callback(true, postData);
                    } else {
                        log4js(true, "推送响应状态：" + statusCode, "推送响应信息：" + res, (log) => { });
                    }
                });
            }
            setTime = setTimeout(() => {
                if (sendState) {
                    if (lock >= 2) {
                        sendState = false;
                        lock = 0;
                        clearInterval(setTime);
                        callback(false, postData);
                    } else {
                        lock++;
                        pushGo(options, postData);
                    }
                }
            }, 5000);
        };
        pushGo(options, postData);
    } catch (e) {
        log4js(false, url, e, (log) => { });
    }
};

