/**
 * redis
 * @type {[type]}
 */
var redis = require("redis").createClient();
var dateFormat = require('dateformat');
var config = require('./config');

var RedisDAO = function(){};

// 纪录用户信息的中间件 
// 这里使用sorted sets，以便查询最近N毫秒内在线的用户；
RedisDAO.prototype.visitSave = function(req, res, next) {
    
    var referer = req.path;
    if(referer){ 
        if(req.xhr || referer.indexOf('seajs') != -1 || referer.indexOf('miofront') != -1 || referer.indexOf('mioback') != -1 || referer.indexOf('manhuaTip') != -1 || referer.indexOf('lovecoding') != -1 || referer.indexOf('javascripts') != -1) {
            //排除条件：public文件夹的资源，Ajax请求 
            return next();
        } else if(referer.indexOf(config.dl) != -1 || referer.indexOf(config.zc) != -1 || req.session.user != null) {
            // 排除条件：后台访问
            return next();
        }    
    } else {
        return next();
    }

    /*function getClientIp(req) {
        return req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    };*/  
    var ua = {
        userAgent: req.headers['user-agent'],
        ip: req.ip,
        cookie: req.headers['cookie'],
        date: dateFormat(new Date(), "dddd, mmmm dS, yyyy, hh:MM TT")
    }
    redis.zadd('online', Date.now(), JSON.stringify(ua), next);
}

// 我们将能得到从当前时间算起在  一天内活跃的用户。
RedisDAO.prototype.getVisitInfo = function(min, callBack) {
    var ago = Date.now() - min;
    redis.zrevrangebyscore('online', '+inf', ago, function (err, users) {
        callBack(err, users);
    });
}


module.exports = new RedisDAO();