/**
 * 验证用户登陆信息
 * @date   2014-09-16
 * @author Tam Chongshi
 */	
var Verify = function() {};
var config = require('../models/config');

/**
 * 用户登陆检查
 * @date   2014-09-16
 */
Verify.prototype.authentication = function(req, res, next) {
    if (!req.session.user) {
        req.session.error = '请先登陆';
        return res.redirect(config.dl);
    }
    next();
}

/**
 * 用户不登陆检查,只判断当进入登陆和注册页面
 * @date   2014-09-16
 */
Verify.prototype.notAuthentication = function(req, res, next) {
    if (req.session.user) {
        req.session.error = '已经登陆';
        return res.redirect(config.bi);
    }
    next();
}

/**
 * 导出模块
 * @type {Verify}
 */
module.exports = new Verify();


//md5