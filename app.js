/**
 * Module dependencies.
 */

var express = require('express');
var user = require('./routes/user');
var backRoutes = require('./routes/mioback');
var frontRoutes = require('./routes/miofront');
var http = require('http');
var path = require('path');
var ejs = require('ejs');
var config = require('./models/config');
var RedisDao = require('./models/redis');

var SessionStore = require("session-mongoose")(express);
var store = new SessionStore({
    url: "mongodb://localhost/session",
    interval: 120000 // expiration check worker run interval in millisec (default: 60000)
});

var app = express();

// all environments
app.set('port', process.env.PORT || config.port);
app.set('views', path.join(__dirname, 'views'));
//让ejs模板文件，使用扩展名为html的文件。
app.engine('.html', ejs.__express);
app.set('view engine', 'html');
//app.set('view engine', 'ejs');
app.use(express.favicon(path.join(__dirname, '/public/images/me.ico')));
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());

//保留上传文件的后缀名，并把临时上传目录设置为 /public/lovecoding/attached_file
app.use(express.bodyParser({
    keepExtensions: true,
    uploadDir: './public/lovecoding/attached_file/'
}));
app.use(express.cookieParser());
//app.use(express.cookieSession({secret : 'cocoscript.com'}));
app.use(express.session({
    secret: 'cocoscript.com',
    store: store,
    cookie: {
        maxAge: 900000
    } // expire session in 15 min or 900 seconds
}));


//登陆页面不用csrf
app.use(function(req, res, next) {
    if (req.originalUrl == config.dl && req.originalMethod == "POST") {
        req.body._csrf = req.session.csrf;
    }
    next();
});
//添加csrf防护
app.use(express.csrf());
app.use(function(req, res, next) {
    req.session.csrf = req.csrfToken ? req.csrfToken() : '';
    res.locals.csrf = req.csrfToken ? req.csrfToken() : '';
    res.locals.user = req.session.user;
    var err = req.session.error;
    delete req.session.error;
    res.locals.message = '';
    if (err) res.locals.message = '<div class="alert alert-danger">' + err + '</div>';
    next();
});

//记录用户信息
app.use(function(req, res, next){
    RedisDao.visitSave(req, res, next);
})
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));



//路由器传app进去
//routes(app)最佳
user(app);
backRoutes(app, __dirname);
frontRoutes(app);
//https://github.com/ShiSheng/Nodejs
//catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
app.use(errorHandler);
function errorHandler(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: err
    });
}

http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});
