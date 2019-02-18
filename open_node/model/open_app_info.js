const { Sequelize } = require('../biz/connect_mysql');
const { sequelize } = require('../biz/connect_mysql');

var open_app_info = sequelize.define('open_app_info', {
    id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
    },
    dev_user: {
        type: Sequelize.BIGINT
    },
    app_id: {
        type: Sequelize.BIGINT
    },
    app_secret: {
        type: Sequelize.STRING
    },
    status: {
        type: Sequelize.BIGINT
    },
    is_delete: {
        type: Sequelize.BIGINT
    },
    cr_user: {
        type: Sequelize.BIGINT
    },
    up_user: {
        type: Sequelize.BIGINT
    },
    cr_time: {
        type: Sequelize.DATE
    },
    up_time: {
        type: Sequelize.DATE
    }
}, {
        tableName: 'open_app_info',
        timestamps: false,
        freezeTableName: true
    }
);

module.exports = open_app_info;