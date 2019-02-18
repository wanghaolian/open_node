const log4js = require('../biz/connect_log4js');//log4js
module.exports = (data, callback) => {
  let crypto = require('crypto'),
    clearEncoding = 'utf8',
    cipherEncoding = 'base64',
    cipherChunks = [],
    algorithm = 'aes-128-cbc',
    key = "9876543210987654",
    iv = "9876543210987654";
  let cipher = crypto.createCipheriv(algorithm, key, iv);
  cipher.setAutoPadding(true);
  cipherChunks.push(cipher.update(data, clearEncoding, cipherEncoding));
  cipherChunks.push(cipher.final(cipherEncoding));
  let encryptData = cipherChunks.join('');
  log4js(true, 'aes-128-cbc加密', encryptData, (log) => { });
  callback(JSON.stringify({
    data: encryptData
  }));
  //解密
  // var decipher = crypto.createDecipheriv(algorithm, key,iv);
  // var plainChunks = [];
  // for (var i = 0;i < cipherChunks.length;i++) {
  //   plainChunks.push(decipher.update(cipherChunks[i], cipherEncoding, clearEncoding));
  // }
  // plainChunks.push(decipher.final(clearEncoding));
  // console.log("UTF8 plaintext deciphered: " + plainChunks.join(''));
};