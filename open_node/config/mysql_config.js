module.exports = {
    PRO: {  //上线删除             jo
        host: 'rm-2ze84r8s9p586z11hjo.mysql.rds.aliyuncs.com',
        user: 'root',
        password: 'U76yhnmj',
        port: '3306',
        database: 'teatime_main',
        stringifyObjects: true,
        dateStrings: true,
        multipleStatements: true // 支持执行多条 sql 语句
    },
    SIT: {
        host: 'rm-2ze5y264ib0b264g1xo.mysql.rds.aliyuncs.com',
        user: 'root',
        password: '(ijnbhU87',
        port: '3306',
        database: 'teatime_main',
        stringifyObjects: true,
        dateStrings: true,
        multipleStatements: true // 支持执行多条 sql 语句
    },
    DEV: {
        host: 'rm-2ze5y264ib0b264g1xo.mysql.rds.aliyuncs.com',
        user: 'root',
        password: '(ijnbhU87',
        port: '3306',
        database: 'dev_teatime',
        stringifyObjects: true,
        dateStrings: true,
        multipleStatements: true // 支持执行多条 sql 语句
    }
};