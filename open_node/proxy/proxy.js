const express = require("express");
const app = express();
app.use('/', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

const healthCheck = require('../controller/healthCheck.js');
app.get("/healthCheck/health", healthCheck);

// 接口授权
const auth = require('../controller/auth.js');
app.post("/api/v1/auth", auth);

// 开门查询
const doorOpenGet = require('../controller/doorOpenMsg');
app.get("/api/v1/door/open", doorOpenGet);

// 查询商品
const skusList = require('../controller/skus');
app.get('/api/v1/skus', skusList);

// 订单查询
const order = require('../controller/order');
app.get('/api/v1/orders', order);

// 查询货道
const plants = require('../controller/plants');
app.get('/api/v1/vendors/plants', plants);

//查询货柜详情
const vendor = require('../controller/vendor');
app.get('/api/v1/vendors', vendor);

// 库存查询
const stock = require('../controller/stock');
app.get('/api/v1/stocks', stock);

// 视频
const videoUrl = require('../controller/videoUrl');
app.get('/api/v1/orders/videos', videoUrl);

// 开门
const doorOpenPost = require('../controller/doorOpen');
app.post("/api/v1/door/open", doorOpenPost);

// 设备注册
const vendorAdd = require('../controller/vendorAdd');
app.post("/api/v1/vendors", vendorAdd);

// 设备注销
const vendorDelete = require('../controller/vendorDelete');
app.delete("/api/v1/vendors", vendorDelete);

// 商品对码
const skusCode = require('../controller/skusCode');
app.post("/api/v1/skus/code", skusCode);

// 货道设置
const plantsChange = require('../controller/plantsChange');
app.post("/api/v1/vendors/plants", plantsChange);

// 接收库存
const stockChange = require('../controller/stockChange');
app.post('/api/v1/stocks', stockChange);

//推送商品
const pushProduct = require('../controller/pushProduct');

//推送关门信号
const pushDoorClose = require('../controller/pushDoorClose');

//推送开门信号
const pushDoorOpen = require('../controller/pushDoorOpen');

//推送订单
const pushOrder = require('../controller/pushOrder');

//推送更新商品
const pushProductUpdate = require('../controller/pushProductUpdate');

//推送读卡器
const pushOpenCard = require('../controller/pushOpenCard');

module.exports = app;