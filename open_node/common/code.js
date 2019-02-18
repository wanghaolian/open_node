module.exports = {
    successOk: {
        msg: "完成",
        code: '0'
    },
    /*     -----    系统级    -----     */
    invalidToken: {
        msg: "无效的token",
        code: "S00001"
    },
    invalidJurisdiction: {
        msg: "无此接口权限",
        code: "S00002"
    },
    invalidAuth: {
        msg: "无效的AppId或Secret",
        code: "S00003"
    },
    invalidParameter: {
        msg: "无效参数",
        code: "S00004"
    },
    invalidCall: {
        msg: "接口调用异常",
        code: "S00005"
    },
    /*     -----    设备使用    -----     */
    equipmentMsgInconformity: {
        msg: "设备信息与账号主体不符",
        code: "B00001"
    },
    queryNoData: {
        msg: "查询无数据",
        code: "B00002"
    },
    equipmentUserError: {
        msg: "货柜使用中",
        code: "FC00001"
    },
    equipmentManError: {
        msg: "货柜补货中",
        code: "FC00002"
    },
    equipmentError: {
        msg: "设备异常",
        code: "FC00003"
    },
    equipmentOrderWait: {
        msg: "设备有结算订单请稍后",
        code: "FC00004"
    },
    equipmentNetworkError: {
        msg: "设备网络异常",
        code: "FC00005"
    },
    equipmentAuNetworkError: {
        msg: "附属设备网络异常",
        code: "FC00006"
    },
    /*     -----    设备操作   -----     */
    equipmentMsgError: {
        msg: "设备信息不存在",
        code: "FV00001"
    },
    equipmentPaymentError: {
        msg: "设备仍有待支付订单",
        code: "FV00002"
    },
    containerSetError: {
        msg: "托盘[X]已设置商品，不能删除！",
        code: "FV00003"
    },
    containerNoError: {
        msg: "该设备识别方案无需设置货道",
        code: "FV00004"
    },
    containerSetNoError: {
        msg: "托盘[X, X]设置失败，请重新设置",
        code: "FV00005"
    },
     equipmentInitSnError: {
        msg: "设备SN信息已存在",
        code: "FV00006"
    },
    equipmentInitDidError: {
        msg: "设备DID信息已存在",
        code: "FV00007"
    }, 
    equipmentPaymentVideoError: {
        msg: "订单非异常订单，暂不支持视频调取",
        code: "FO00001"
    },
    /*     -----    库存操作    -----     */
    inventorySetError: {
        msg: "托盘[X]在系统中未找到，库存同步失败",
        code: "FS00001"
    },
    inventoryError: {
        msg: "货柜不存在",
        code: "FS00002"
    },
    
};
 