const amqp = require("amqp");
const log4js = require('./connect_log4js');
const mq_connect = require('../config/mq_config');
const connection = amqp.createConnection(mq_connect.SIT); //连接rabbitmq
module.exports = (name, callback) => {
    connection.on('ready', () => {
        connection.queue(name, { durable: true, autoDelete: false }, queue => {
            console.log('AMQP ' + queue.name + '查询连接成功');  //  调试链接打印
            queue.subscribe((message, header, deliveryInfo, messageObject) => {
                console.log(message.data.toString());   //  调试数据打印
                callback(message.data.toString());
            });
        });
    });
    connection.on('error', function (e) {
        console.log("Error from amqp: ", e);
        log4js(false, "Error from amqp: ", e, (log) => { });
    });
};