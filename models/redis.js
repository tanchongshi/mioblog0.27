/**
 * redis
 * @type {[type]}
 */
var redis = require("redis").createClient();
var dateFormat = require('dateformat');
var config = require('./config');

var RedisDAO = function(){};

//公共过滤函数
function commonFilter(req, res, next) {
    var referer = req.path;
    if(referer){ 
        if(req.xhr || referer.indexOf('seajs') != -1 || referer.indexOf('miofront') != -1 || referer.indexOf('mioback') != -1 || referer.indexOf('manhuaTip') != -1 || referer.indexOf('lovecoding') != -1 || referer.indexOf('javascripts') != -1) {
            //排除条件：public文件夹的资源，Ajax请求 
            return true;
        } else if(referer.indexOf(config.dl) != -1 || referer.indexOf(config.zc) != -1 || req.session.user != null) {
            // 排除条件：后台访问
            return true;
        }    
    } else {
        return true;
    } 
    return false;   
}

//访问页面统计
RedisDAO.prototype.visitRefererSave = function(req, res, next) {
    if(commonFilter(req, res, next)) return next();
    var ua = {
        referer: req.path || '',
        ip: req.ip || '',
        date: dateFormat(new Date(), "dddd, mmmm dS, yyyy, hh:MM:ss TT") || '',
        userAgent: '',
        cookie: ''

    }    
    redis.zadd('visitReferer', Date.now(), JSON.stringify(ua), next);
}

// 纪录用户信息的中间件 
// 这里使用sorted sets，以便查询最近N毫秒内在线的用户；
RedisDAO.prototype.visitSave = function(req, res, next) {
    
    if(commonFilter(req, res, next)) return next();
    /*function getClientIp(req) {
        return req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    };*/  
    var ua = {
        referer: '',
        userAgent: req.headers['user-agent'] || '',
        ip: req.ip || '',
        cookie: req.headers['cookie'] || '',
        date: dateFormat(new Date(), "dddd, mmmm dS, yyyy, hh:MM TT") || ''
    }
    redis.zadd('online', Date.now(), JSON.stringify(ua), next);
}

// 我们将能得到从当前时间算起在  活跃的用户。
RedisDAO.prototype.getVisitInfo = function(min, callBack) {
    var ago = Date.now() - min;
    redis.zrevrangebyscore('online', '+inf', ago, function (err, users) {
        callBack(err, users);
    });
}


// 我们将能得到从当前时间算起在  活跃的用户访问的路径。
function getVisitReferer(min, callBack) {
    var ago = Date.now() - min;
    redis.zrevrangebyscore('visitReferer', '+inf', ago, function (err, users) {
        callBack(err, users);
    });
}

//获得一天访问路径
RedisDAO.prototype.getDayReferer = function(req, res, next, callBack) {

        getVisitReferer(24 * 60 * 60 * 1000, function(err, users) { //获得一天访问数
            if (err) {
                return callBack(err);
            }
            req.refererDay = users; 
            callBack();
        })    
}

//获得一周访问路径
RedisDAO.prototype.getWeekReferer = function(req, res, next, callBack) {
        getVisitReferer(7 * 24 * 60 * 60 * 1000, function(err, users) { //获得一天访问数
            if (err) {
                return callBack(err);
            }
            req.refererWeek = users; 
            callBack();
        })    
}

//获得一月访问路径
RedisDAO.prototype.getMonthReferer = function(req, res, next, callBack) {
        getVisitReferer(30 * 24 * 60 * 60 * 1000, function(err, users) { //获得一天访问数
            if (err) {
                return callBack(err);
            }
            req.refererMonth = users; 
            callBack();
        })    
}

//获得一年访问路径
RedisDAO.prototype.getYearReferer = function(req, res, next, callBack) {
        getVisitReferer(365 * 24 * 60 * 60 * 1000, function(err, users) { //获得一天访问数
            if (err) {
                return callBack(err);
            }
            req.refererYear = users;
            callBack(); 
        })    
}

module.exports = new RedisDAO();