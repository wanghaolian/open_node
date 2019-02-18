// 健康检查
const fs = require("fs");
const path = require('path');
module.exports = (req, res, next) => {
    let fileName = path.join(__dirname,'../public/healthCheck.js');
    fs.readFile(fileName,function(err,data){
        if(err)
            console.log("对不起，您所访问的路径出错");
        else{
            res.write(data);
        }
    });
};

























