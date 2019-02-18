module.exports = {
    PRO: {
        host: '172.17.125.7',
        port: 5672,
        login: 'admin',
        password: 'SIjie@2098',
        authMechanism: "AMQPLAIN",
        vhost: "/teatime",
        ssl: {
            enabled: false
        }
    },
    SIT: {
        host: "39.106.154.179",
        port: 5672,
        login: "admin",
        password: "mindx",
        authMechanism: "AMQPLAIN",
        vhost: "/teatime",
        ssl: {
            enabled: false
        }
    },
    DEV: {
        host: "39.106.157.224",
        port: 5672,
        login: "admin",
        password: "admin",
        authMechanism: "AMQPLAIN",
        vhost: "/teatime",
        ssl: {
            enabled: false
        }
    }
};