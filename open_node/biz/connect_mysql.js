const config = require("../config/mysql_config");
const Sequelize = require('sequelize');
const sequelize = new Sequelize(config.SIT.database, config.SIT.user, config.SIT.password, {
    host: config.SIT.host,
    dialect: 'mysql',
    operatorsAliases: false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});
// 测试连接
sequelize
    .authenticate()
    .then(() => {
        console.log('连接已成功建立。');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });
module.exports = {
    Sequelize: Sequelize,
    sequelize: sequelize
};