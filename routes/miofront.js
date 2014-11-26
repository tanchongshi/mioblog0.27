/**
 * Created by Chongshi Tan on 14-5-18.
 */

var MioUser = require('./../models/miouser.js');

var MioBlog = require('./../models/mioblog.js');

module.exports = function(app){

    var fiterNum = function(req) {
        var pageNumber = req.params.num||1; //当前页数，不存在就默认第一页
        if(pageNumber) {
            var idReg=/^[1-9][0-9]*$/;
            if (!idReg.test(pageNumber)){
                pageNumber = 1;
            }
        }
        return pageNumber;
    }

    //统计一个对象重复数据
    var coutCategoryNum = function(doc) {
        var temp = [];
        var cId;
        for(var i in doc) {
            var caObj = doc[i].blogCategory;
            cId = caObj._id;
            if(i == 0) {
                temp.push({id: cId, categoryName: caObj.categoryName, num: 1});
                continue;
            }
            for(var j = 0; j < temp.length;j++){
                if(temp[j].id == cId) {
                    temp[j].num+=1;
                    break;
                }
                if((j+1) == temp.length) {
                    temp.push({id: cId, categoryName: caObj.categoryName, num: 1});
                    break; //防止temp长度加长，又再遍历一次
                }
            }

        }
        return temp;
    }

    /**  主页 */
    var indexGet = function(req, res, next){

        var pageNumber = fiterNum(req); //过滤参数
        var resultsPerPage=req.query.limit||5; //每页数据，默认5条
        var option = {
            pageNumber: pageNumber,
            resultsPerPage: resultsPerPage
        }
        MioBlog.findIndexAll(option, function(err, totalPage, obj){
            if (err) {
                return next(err);
            }

            var anchor = 'front/index' //之前用来跳到指定锚点

            if(req.query.anchor){
                anchor = req.query.anchor
            }
            option.totalPage = totalPage;
            var category = coutCategoryNum(obj);
            res.render('miofront/index', { doc: obj, option: option, category: category});
        });

    }

    var indexPost = function(req, res, next){

        var pageNumber = fiterNum(req); //过滤参数
        var resultsPerPage=req.query.limit||5; //每页数据，默认2条
        var option = {
            pageNumber: pageNumber,
            resultsPerPage: resultsPerPage
        }
        MioBlog.findIndexAll(option, function(err, totalPage, obj){
            if (err) {
                return next(err);
            }

            var anchor = 'front/index' //之前用来跳到指定锚点

            if(req.query.anchor){
                anchor = req.query.anchor
            }
            var category = coutCategoryNum(obj);
            option.totalPage = totalPage;
            res.render('miofront/indexmodel', { doc: obj, option: option, category: category});
        });
    }
    /*app.get('/',indexGet);
    app.get('/index/:num',indexGet);
    app.post('/index/:num',indexPost);
    app.post('/',indexPost);*/

    var indexGetPost = function(req, res, next) {
        if(req.query.post == "post") {
            indexPost(req, res, next);
        }else {
            indexGet(req, res, next);
        }
    }   

    app.get('/',indexGetPost);
    app.get('/index/:num',indexGetPost);

    /** 文章类别 **/
    var categoryGet = function(req, res, next) {

        var pageNumber = fiterNum(req); //过滤参数
        var categoryId = req.params.categoryId;
        var idObj = {_id: categoryId}; // 所查的栏目
        var resultsPerPage = req.query.limit||5; //每页数据，默认2条
        var option = {
            idObj: idObj,
            pageNumber: pageNumber,
            resultsPerPage: resultsPerPage
        }
        MioBlog.findBlogInCategory(option, function(err,totalPage, doc) {
            if (err) {
                return next(err);
            }
            console.log(doc.article.length);
            if(doc.article.length == 0) {
                return next();
            }
            option.totalPage = totalPage;
            res.render('miofront/category', {doc: doc, option: option});
        })

    }

    var categoryPost = function(req, res, next) {

        var pageNumber = fiterNum(req); //过滤参数
        var categoryId = req.params.categoryId;
        var idObj = {_id: categoryId}; // 所查的栏目
        var resultsPerPage = req.query.limit||5; //每页数据，默认2条
        var option = {
            idObj: idObj,
            pageNumber: pageNumber,
            resultsPerPage: resultsPerPage
        }
        MioBlog.findBlogInCategory(option, function(err,totalPage, doc) {
            if (err) {
                return next(err);
            }
            option.totalPage = totalPage;
            res.render('miofront/categorymodel', {doc: doc, option: option});
        })

    }

    /*app.get('/categoryblog/:categoryId',categoryGet);
    app.get('/categoryblog/:num/:categoryId',categoryGet);
    app.post('/categoryblog/:categoryId',categoryPost);
    app.post('/categoryblog/:num/:categoryId',categoryPost);*/
    var categoryGetPost = function(req, res, next) {
        if(req.query.post == "post") {
            categoryPost(req, res, next);
        }else {
            categoryGet(req, res, next);
        }
    }  
    
    app.get('/categoryblog/:categoryId',categoryGetPost);
    app.get('/categoryblog/:num/:categoryId',categoryGetPost);     

    //获得所有栏目
    app.get('/postblocategory', function(req, res) {
        MioBlog.findAllInCategory(function(err, doc) {
            if(!err) {
                res.send({data: doc});
            } else {
                return next(err);
            }
        })
    })

    //获得文章
    app.get('/article/:articleId', function(req, res, next) {
        var result = "miofront/article"
        getAticle(req, res, next, result);
    })

    function getAticle(req, res, next, result) {
        MioBlog.findByIdFront(req.params.articleId, function(err, doc) {
            if(!err) {
                if(!doc) {
                    return next(err);
                }else {
                    console.log(doc);
                    res.render(result, {blog: doc})
                }
            } else {
                return next(err);
            }
        });
    }    
	
	//文章右侧栏目获得栏目点击数排行
	app.get('/articleLeftTap', function(req, res, next) {
		MioBlog.findArticleTap(function(err, doc) {
            if(!err) {
                res.send({data: doc});
            } else {
                return next(err);
            }			
		})
	})

    //实验室
    app.get('/lab/:num', function(req, res, next) {

        var pageNumber = fiterNum(req); //过滤参数
        console.log(pageNumber);
        var resultsPerPage=req.query.limit||10; //每页数据，默认5条
        console.log(resultsPerPage);
        var option = {
            pageNumber: pageNumber,
            resultsPerPage: resultsPerPage
        }    
        MioBlog.findLabByExist(option, function(err, totalPage, doc) {
            if(!err) {
                if(doc == "") {
                    return next(err);
                }else {
                    option.totalPage = totalPage;
                    res.render('miofront/lab', {lab: doc , option: option})
                }
            } else {
                return next(err);
            }
        });
    })

    //aboutme
    app.get('/aboutme', function(req, res){
        res.render('miofront/aboutme');
    })

    //获得实验详情
    app.get('/lab/detail/:articleId', function(req, res, next) {
        var result = "miofront/labdetail"
        getAticle(req, res, next, result);
    })    

    app.get('/nihao', function(req, res) {
        res.send(req.online.length + ' users online');   
    })
}