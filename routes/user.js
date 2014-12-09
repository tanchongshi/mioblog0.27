/**
 * 管理用户登陆，登出，注册等；
 * @date   2014-09-16
 * @author Tam Chongshi
 */

/**
 * 获得用户Dao
 * @type {[type]}
 */
var MioUser = require('./../models/miouser.js');
var RedisDao = require('./../models/redis');
/**
 * 获得用户登陆验证
 * @type {[type]}
 */
var Verify = require('./Verify.js');
var config = require('../models/config');
var crypto = require('crypto');

/**
 * 导出模块
 */
module.exports = function(app) {

    /** 验证登陆状态 **/
    app.get(config.bi, Verify.authentication);

    /** 后台主页 */
    app.get(config.bi, function(req, res, next) {

        RedisDao.getVisitInfo(24 * 60 * 60 * 1000, function(err, users) { //获得一天访问数
            if (err) {
                return next (err);
            }
            req.onlineDay = users; 
            RedisDao.getVisitInfo(7 * 24 * 60 * 60 * 1000, function(err, users) { //获得一周访问数
                if (err) {
                    return next (err);
                }
                req.onlineWeek = users; 
                RedisDao.getVisitInfo(30 * 24 * 60 * 60 * 1000, function(err, users) { //获得30天访问数
                    if (err) {
                        return next (err);
                    }
                    req.onlinMonth = users; 
                    RedisDao.getVisitInfo(365 * 24 * 60 * 60 * 1000, function(err, users) { //获得一年访问数
                        if (err) {
                            return next (err);
                        }
                        req.onlineYear = users; 
                        res.render('mioback/index', {
                            visitDay: req.onlineDay, visitWeek: req.onlineWeek, 
                            visitMonth: req.onlinMonth, visitYear: req.onlineYear,
                            refererDay: req.refererDay, refererWeek: req.refererWeek,
                            refererMonth: req.refererMonth, refererYear: req.refererYear
                        });

                    });              
                });              
            });              
        });
    })

    /** 验证登陆状态 **/
    app.all(config.dl, Verify.notAuthentication);

    /** 登陆get */
    app.get(config.dl, function(req, res) {
        res.render('mioback/signin');
    })

    /** 登陆post */
    app.post(config.dl, function(req, res, next) {
        var user = {
            userName: req.body.username,
            password: md5(req.body.password)
        }

        MioUser.count(user, function(err, count) {
            if (err) {
                return next(err);
            }
            if (count == 0) {
                req.session.error = '用户名或密码不正确';
                return res.redirect(config.dl);
            } else {
                req.session.user = user;
                return res.redirect(config.bi);
            }
        });

    })

    /** 登出 */
    app.get(config.tc, function(req, res) {
        req.session.user = null;
        res.redirect(config.dl);
    })

    /** 验证是否处于登陆状态 **/
    app.all(config.zc, Verify.notAuthentication);

    /**  注册页面 */
    app.get(config.zc, function(req, res) {
        res.render('register', {
            title: '用户注册'
        });
    });

    /** 注册 */
    app.post(config.zc, function(req, res) {
        var username = req.body.username;
        var password = md5(req.body.password);
        if (username == "" || password == "") {
            req.session.error = "注册失败，请再试注册！";
            return res.redirect(config.zc);
        }
        var user = {
            userName: username,
            password: password
        }
        if (user != null) {

            MioUser.save(user, function(err, doc) {
                if (err) {
                    req.session.error = "注册失败，请再试注册！";
                    return res.redirect(config.zc);
                } else {
                    if (doc.length != 0) {
                        req.session.error = '差不多就可以了，悠着点！';
                        return res.redirect(config.dl);
                    }
                    req.session.error = '注册成功，请登陆';
                    console.log("sdf");
                    return res.redirect(config.dl);
                }
            });

        }

    });

    /**
     * [md5 description]
     * @date   2014-09-21
     * @author Tam Chongshi
     */
    function md5(str) {
        var md5sum = crypto.createHash('md5');
        md5sum.update(str);
        str = md5sum.digest('hex');
        return str;
    }
}
