const amqp = require("amqp");
const mq_connect = require('../config/mq_config');
const connection = amqp.createConnection(mq_connect.SIT); //连接rabbitmq

module.exports = (name, data, callback) => {
    // console.log('PUBLISH ' + name + '推入连接成功.');   //  调试链接打印
    connection.publish(data);
    callback('推入死信队列成功！');
};