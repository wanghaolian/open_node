const { Sequelize } = require('../biz/connect_mysql');
const { sequelize } = require('../biz/connect_mysql');

var open_api_auth = sequelize.define('open_api_auth', {
    id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
    },
    app_id: {
        type: Sequelize.BIGINT
    },
    api_name: {
        type: Sequelize.STRING
    },
    api_code: {
        type: Sequelize.STRING
    },
    callback_url: {
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
        tableName: 'open_api_auth',
        timestamps: false,
        freezeTableName: true
    }
);

module.exports = open_api_auth;