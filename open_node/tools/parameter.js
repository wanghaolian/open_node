const log4js = require('../biz/connect_log4js');//log4js
module.exports = (parameter, apicode, callback) => {
	let mustName = null, verifyResult = true;
	if (!parameter_must(parameter)) { // 初始对象第一层必传
		verifyResult = false;
	} else {
		parameter_type(parameter, null); // 深层必传
	}
	function parameter_type(parameter, must_name) { // 判断每一项参数  must_name暂留
		for (let i in parameter) { // 循环对象
			if (typeof parameter[i] !== 'object' || parameter[i] == null) { // 变量只有一项/字符串
				if (!verifyFn(parameter[i], i)) {
					verifyResult = false;
					return; // 单项类型、长度错误
				}
			} else { // 变量只有一项/数组对象
				for (let j = 0; j < parameter[i].length; j++) { // 循环数组对象
					if (!isContain(parameter[i][j], parameter_chunk[apicode].must[i])) {
						verifyResult = false;
						return; // 对象必传项缺失
					}
				}
				parameter_type(parameter[i], i); // 对象必传项没有缺失
			}
		}
	}
	function isContain(arr1, arr2) { // 对象必校验项
		for (let i = arr2.length - 1; i >= 0; i--) {
			if (arr1[arr2[i]] == undefined || arr1[arr2[i]] == null || arr1[arr2[i]] == '') {
				mustName = arr2[i];
				return false;
			}
		}
		return true;
	}
	function parameter_must(pa_must) { // 单项必校验项
		let must_parameter = parameter_chunk[apicode].must.must_parameter;
		for (let i = 0; i < must_parameter.length; i++) {
			if (pa_must[must_parameter[i]] == undefined || pa_must[must_parameter[i]] == null || pa_must[must_parameter[i]] == '') { // 变量必传项没有值
				mustName = must_parameter[i];
				return false;
			}
		}
		return true;
	}
	function verifyFn(pa_key, pa_name) { // 类型校验项
		try {
			let pa_verify = parameter_chunk[apicode][pa_name];
			if (pa_verify.required && pa_verify == undefined || pa_verify == null || pa_verify == '') {
				console.log('必传错误' + pa_name);
				mustName = pa_name;
				return false;
			}
			if (pa_key != undefined && pa_key != null && pa_key != '') {
				if (typeof pa_key != pa_verify.type) {
					console.log('类型错误' + pa_name);
					mustName = pa_name;
					return false;
				}
				if (typeof pa_key == "number")
					pa_key = pa_key.toString();
				if (pa_key.length > pa_verify.maxLength) {
					console.log('长度错误' + pa_name);
					mustName = pa_name;
					return false;
				}
			}
			return true;
		} catch (e) {
			log4js(false, "校验报错：", e, (log) => { });
			mustName = pa_name;
			return false;
		}
	}
	log4js(true, "校验结果：" + verifyResult, "校验错误变量" + mustName, (log) => { });
	callback({
		verifyResult: verifyResult,
		mustName: mustName
	});
};

const parameter_chunk = {
	S001: { // 库存同步 apiCode (/api/v1/stocks)
		must: {
			must_parameter: ["vendorId", "plantInfos"],
			plantInfos: ["count", "productName"]
		},
		vendorId: {
			type: "number",
			required: true,
			maxLength: 20
		},
		count: {
			type: "number",
			required: true,
			maxLength: 11
		},
		plantId: {
			type: "number",
			required: false,
			maxLength: 20
		},
		productName: {
			type: "string",
			required: true,
			maxLength: 100
		},
		productSkuId: {
			type: "number",
			required: false,
			maxLength: 20
		},
		thirdProductSkuId: {
			type: "string",
			required: false,
			maxLength: 100
		}
	},
	S002: {
		must: {
			must_parameter: ["vendorId"]
		},
		vendorId: {
			type: "number",
			required: true,
			maxLength: 20
		},
		stockTime: {
			type: "string",
			required: false,
			maxLength: 16
		},
		stockType: {
			type: "number",
			required: false,
			maxLength: 100
		}
	},
	G001: { // 查询商品 apiCode (/api/v1/skus)
		must: {
			must_parameter: []
		},
		productName: {
			type: "string",
			required: false,
			maxLength: 100
		},
		thirdProductSkuId: {
			type: "string",
			required: false,
			maxLength: 100
		},
		productSkuId: {
			type: "number",
			required: false,
			maxLength: 20
		},
		pageSize: {
			type: "number",
			required: false,
			maxLength: 11
		},
		pageNo: {
			type: "number",
			required: false,
			maxLength: 11
		},
		productTime: {
			type: "string",
			required: false,
			maxLength: 16
		}
	},
	G002: { // 商品对码 apiCode (/api/v1/skus/code)
		must: {
			must_parameter: ["skus"],
			skus: ["productSkuId", "thirdProductSkuId"]
		},
		productSkuId: {
			type: "number",
			required: true,
			maxLength: 20
		},
		thirdProductSkuId: {
			type: "string",
			required: true,
			maxLength: 100
		},
	},
	C001: { // 开门接口 apiCode (/api/v1/door/open)
		must: {
			must_parameter: ["thirdUserId", "actType", "vendorId"]
		},
		thirdUserId: {
			type: "string",
			required: true,
			maxLength: 100
		},
		actType: {
			type: "number",
			required: true,
			maxLength: 11
		},
		vendorId: {
			type: "number",
			required: true,
			maxLength: 20
		},
		thirdTradeNo: {
			type: "string",
			required: false,
			maxLength: 100
		}
	},
	C003: {
		must: ["unionCode"],
		unionCode: {
			type: "string",
			required: true,
			maxLength: 64
		}
	},
	V001: { // 设备注册 apiCode (/api/v1/vendors)
		must: {
			must_parameter: ["recType", "vendorDid", "snCode"]
		},
		doorStructure: {
			type: "number",
			required: false,
			maxLength: 11
		},
		snCode: {
			type: "string",
			required: true,
			maxLength: 100
		},
		attName: {
			type: "string",
			required: false,
			maxLength: 20
		},
		provinceId: {
			type: "number",
			required: false,
			maxLength: 11
		},
		bdName: {
			type: "string",
			required: false,
			maxLength: 20
		},
		attPhone: {
			type: "string",
			required: false,
			maxLength: 20
		},
		address: {
			type: "string",
			required: false,
			maxLength: 100
		},
		cityId: {
			type: "number",
			required: false,
			maxLength: 11
		},
		recType: {
			type: "number",
			required: true,
			maxLength: 11
		},
		abbrAddress: {
			type: "string",
			required: false,
			maxLength: 8
		},
		memo: {
			type: "string",
			required: false,
			maxLength: 100
		},
		districtId: {
			type: "number",
			required: false,
			maxLength: 11
		},
		vendorDid: {
			type: "string",
			required: true,
			maxLength: 32
		},
		bdPhone: {
			type: "string",
			required: false,
			maxLength: 20
		}
	},
	V002: { // 设备注销 apiCode (/api/v1/vendors)
		must: {
			must_parameter: ["vendorId"]
		},
		vendorId: {
			type: "number",
			required: true,
			maxLength: 20
		}
	},
	V003: {
		must: ["vendorDid"],
		vendorDid: {
			type: "string",
			required: false,
			maxLength: 32
		},
		snCode: {
			type: "string",
			required: false,
			maxLength: 100
		}

	},
	V004: { // 货道设置 apiCode (/api/v1/vendors/plants)
		must: {
			must_parameter: ["vendorId", "plantInfos"],
			plantInfos: ["plantName", "sensorId"]
		},
		vendorId: {
			type: "number",
			required: true,
			maxLength: 20
		},
		plantId: {
			type: "number",
			required: false,
			maxLength: 20
		},
		plantName: {
			type: "string",
			required: true,
			maxLength: 100
		},
		sensorId: {
			type: "number",
			required: true,
			maxLength: 20
		},
		count: {
			type: "number",
			required: false,
			maxLength: 11
		},
		productName: {
			type: "string",
			required: false,
			maxLength: 100
		},
		productSkuId: {
			type: "string",
			required: false,
			maxLength: 20
		},
		thirdProductSkuId: {
			type: "string",
			required: false,
			maxLength: 100
		}
	},
	V005: { // 货道设置 apiCode (/api/v1/vendors/plants)
		must: {
			must_parameter: ["vendorId"]
		},
		vendorId: {
			type: "number",
			required: true,
			maxLength: 20
		}
	}
};

