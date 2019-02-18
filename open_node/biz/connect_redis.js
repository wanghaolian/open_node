const redis = require("redis");
const redis_config = require("../config/redis_config");
const client = redis.createClient(redis_config.SIT);
// 失败
client.on("error", function (err) {
    console.log("Error :", err);
});
// 成功
client.on('connect', function () {
    console.log('Redis连接成功.');
});
// 插入key
const String_SetKey = (key, val, callback) => {
    if (key && val) {
        client.set(key, val, (err, result) => {
            if (err) {
                callback(err);
                return;
            }
            callback('成功');
        });
    }
};
// 获取key
const String_GetData = (key, callback) => {
    if (key) {
        client.get(key, function (err, result) {
            if (err) {
                callback(err);
                return;
            }
            callback(result);
        });
    }
};
// 插入hash
const Hash_SetKey = (key, val, callback) => {
    if (key && val) {
        for (let i = 0; i < val.length; i++) {
            hash(i);
        }
    }
    function hash(i) {
        client.hset(key, val[i].api_code, val[i].api_name, function (err, result) {
            if (i >= val.length - 1) {
                if (err) {
                    callback(err);
                    return;
                }
                callback(result);
            }
        });
    }
};
// 获取hash val
const Hash_GetVal = (key, field, callback) => {
    if (key) {
        client.hget(key, field, function (err, result) {
            if (err) {
                callback(err);
                return;
            }
            callback(result);
        });
    }
};
// 获取hash {} hget
const Hash_GetData = (key, callback) => {
    if (key) {
        client.hgetall(key, function (err, result) {
            if (err) {
                callback(err);
                return;
            }
            callback(result);
        });
    }
};
// 插入2小时数据
const Setex_SetKey = (key, seconds, val, callback) => {
    if (key && val) {
        client.setex(key, seconds, JSON.stringify(val), function (err, result) {
            if (err) {
                console.log('redis添加失败');
                callback(err);
                return;
            }
            callback(result);
        });
    }
};
// 设置hash时间
const Expire_SetKey = (key, seconds, callback) => {
    client.expire(key, seconds, function (err, result) {
        if (err) {
            console.log('redis更新时间失败');
            callback(err);
            return;
        }
        console.log('redis更新时间成功');
        callback(result);
    });
};
// client.end();
// client.quit();
module.exports = { String_SetKey, Hash_SetKey, String_GetData, Hash_GetData, Setex_SetKey, Expire_SetKey };
