/**
 * Created by Chongshi Tan on 14-4-10.
 */
 
var fs = require('fs');

var MioBlog = require('./../models/mioblog.js');

/**
 * 获得用户登陆验证
 * @type {[type]}
 */
var Verify = require('./Verify.js');

module.exports = function(app, __dirname){

    /**  写日记验证登陆状态 */
    app.all('/writeblog', Verify.authentication);
	
	/** 进入写日记页面并把已有类别查找出来，以便选择 **/
    app.get('/writeblog',function(req, res, next){
        MioBlog.findAllInCategory(function(err, obj) {
            if (err) {
                return next(err);
            }
            res.render('mioback/writeblog', {sortObj: obj});
        });

    });
	
	/** 接受前台的日记并且保存 **/
    app.post('/writeblog',function(req, res, next){

        //文章
        var article={
            blogTitle: req.body.blogTitle,
            blogContent: req.body.blogContent,
			blogImage: req.body.blogImage,
			blogNum: req.body.categoryNum,
            blogDate: new Date().Format("yyyy-MM-dd hh:mm:ss"),
			blogContext: {
				previous: {
					id: null,
					name: null
				},
				next: {
					id: null,
					name: null
				}
				
			}
        }

        //如果是实验
		if(req.body.labradio == "1") {
			article.labContent = req.body.labcontent;
		}         

		var blogCategory = req.body.blogCategory;
		
        //分类
        var category = {
            categoryName: blogCategory,
			categoryNum: req.body.categoryNum,
            categoryDate: new Date().Format("yyyy-MM-dd hh:mm:ss")
        }
		
		//查询类别是否存在
        MioBlog.findByNameInCategory(blogCategory, function(err, obj) {
            if(err) {
				return next(err);
            }else {
                if(obj == null) { //如果类别为空建立新类别
                    if(article != null){
						//保存文章
                        MioBlog.saveAll(article, category, function(err){
                            if(err) {
                                res.send({'success': false, 'err': err});
                            } else {
                                res.send({'success': true});
                            }
                        });
                    }else {
                        res.send({'success': false});
                    }
                } else { //如果类别不为空不用建立类别
					article.blogNum = obj.categoryNum;
					//保存文章
                    MioBlog.saveOnly(article, obj, function() {
                        if(err) {
                            res.send({'success': false,'err': err});
                        } else {
                            res.send({'success': true});
                        }
                    })
                }
            }
        })
    });	
	
    /** 进入后台管理文章页面 **/
    app.all('/manageblog', Verify.authentication);
    app.get('/manageblog',function(req, res) {
        res.render('mioback/manageblog');
    });	
	
    /** 后台文章管理页面jquery table通过ajax获得数据 **/
    app.all('/miobackgetblog', Verify.authentication);
    app.get('/miobackgetblog',function(req, res){
        MioBlog.findLimitSix(function(err, obj){
            var tempObj = {
                "aaData": obj
            }
            res.send(tempObj);
        });

    });

    /**编辑日记**/
    app.all('/miobackeditorblogbyId', Verify.authentication);
	//加入编辑状态
    app.get('/miobackeditorblogbyId',function(req, res){
        MioBlog.findById(req.query.id, function(err, doc) {
            if(!err) {
                res.render('mioback/editorblog', {blogObj: doc});
            } else {
                res.render('error', {error: '编辑日记查询日记失败'});
            }
        });

    });	
	//保存提交的编辑
    app.post('/miobackeditorblogbyId',function(req, res){
        var blog={
            _id: req.body.blogId,
            blogTitle: req.body.blogTitle,
            blogContent: req.body.blogContent
        }
        if(blog != null){

            MioBlog.findByIdAndUpdate(blog, function(err ,doc){
                if(err) {
                    res.send({'success':false,'err':err});
                } else {
                    res.send({'success':true});
                }
            });

           // req.session.error='保存成功';

        }else {
            res.send({'success':false});
        }

    });
	
	/** 删除日记 **/
	app.all('/miobackdeleteblogbyId', Verify.authentication);
    app.post('/miobackdeleteblogbyId', function(req, res) {
        MioBlog.remove(req.body.blogId, req.body.categoryId, function(err){
            if(err) {
                res.send({'success':false,'err':err});
            } else {
                res.send({'success':true});
            }
        });
    })	

    /** 进入后台管理类别页面 **/
    app.all('/managecate', Verify.authentication);
    app.get('/managecate',function(req, res) {
        res.render('mioback/managecate');
    });	
	
    /** 后台类别管理页面jquery table通过ajax获得数据 **/
    app.all('/miobackgetcate', Verify.authentication);
    app.get('/miobackgetcate',function(req, res){
        MioBlog.findAllInCategory(function(err, obj){
            var tempObj = {
                "aaData": obj
            }
            res.send(tempObj);
        });

    });
	
	/** 后台管理类别页面编辑类别名字 **/	
    app.all('/editorCategoryName', Verify.authentication);
    app.post('/editorCategoryName',function(req, res){
		doc = {
			_id: req.body.categoryId,
			categoryName: req.body.cagtegoryName
		}
		if(doc != null) {
			MioBlog.editorCategoryName(doc, function(err, obj){
				if(err) {
					res.send({'success':false});
				}else {
					res.send({'success':true});
				}
				
			});		
		}else {
			res.send({'success':false});
		}

    });	
	
	/** 写日记上传图片 **/
	app.all('/nodejs/upload_json', Verify.authentication);
	app.post('/nodejs/upload_json', function (req, res) {
	      var d = new Date();
		  console.log(req);
		  var dirPath = './public/kindeditor-4.1.10/attached/' + d.Format("yyyy-MM-dd") + "/";	 
		  if (!fs.existsSync(dirPath)) {
			fs.mkdirSync(dirPath);		  
		  }		  
		  var oName = req.files.imgFile.originalFilename;
		  oName = oName.substr(oName.lastIndexOf("."));
		  var target_path = dirPath+""+ d.getTime()+oName;
		  // 使用同步方式重命名一个文件
		  fs.renameSync(req.files.imgFile.path, target_path);
		  var resPath = "/kindeditor-4.1.10/attached/"+ d.Format("yyyy-MM-dd") + "/"+ d.getTime()+oName;
		  res.send({ "error": 0, "url": resPath });
		
	})
	
	/** 写日记kindeditor管理图片**/
	app.all('/nodejs/manage_json', Verify.authentication);
	app.get('/nodejs/manage_json', function(req, res, next) { //http://www.xuexb.com/html/134.html
		if(req.query.path == "" || req.query.path=="Iloveyou"){
			var path = "./public/kindeditor-4.1.10/attached/";
			fs.readdir(path, function (err, files) {
				mioFiles = files;
				var fileList = [];//保存目录取的文件信息
				files.forEach(function(item) {				
					fileList.push({filename: item, is_dir: true, is_photo: false, has_file: true});
					//var tmpPath = path+item;
					/*fs.stat(tmpPath,  function(err1, stats) {
									
						if (err1) {  
							console.log("你好1");						
							return next(err1);
						} else {  
							if (stats.isDirectory()) { 
								console.log("你好2");						

							} else { 
								console.log("你好3");						
							}  
						}
											
					})*/				
				})	
				res.send({
					file_list: fileList, 
					total_count: mioFiles.lenght, 
					current_url: path, 
					current_dir_path: path,
					moveup_dir_path: ""
				});			
			});				
		}else {
			var path = req.query.path;
			fs.readdir(path, function (err, files) {
				mioFiles = files;
				var fileList = [];//保存目录取的文件信息
				files.forEach(function(item) {				
					fileList.push({filename: item, is_dir: false, is_photo: true, has_file: true});	
				})
				res.send({
					file_list: fileList, 
					total_count: mioFiles.lenght, 
					current_url: path.substr(9),
					current_dir_path: path.substr(9),
					moveup_dir_path: ""
				});					
			})	
		}
				
	})

	/** 写日记kindeditor删除图片**/
	app.all('/nodejs/delete_json', Verify.authentication);	
	app.post('/nodejs/delete_json', function(req, res) {
	    var rUrl = req.body.url;
		fs.unlink('./public'+rUrl, function (err) {
		  if (err) {
			res.send({result: 0}); //图片删除失败
		  } else {
			var thisUrl = './public' + rUrl.substr(0, rUrl.lastIndexOf("/"));
			fs.readdir(thisUrl, function (err, files) {				
				if(files.length == 0) {
					fs.rmdir(thisUrl, function (err) {
					  if (err) {
						res.send({result: 2}); //文件夹删除失败
					  }else {
						res.send({result: 1});
					  }				  
					});
				}else {
					res.send({result: 1});
				}
			})			
		  }		  
		});		
				
	});

};


	// 对Date的扩展，将 Date 转化为指定格式的String
	// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
	// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
	// 例子：
	// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
	// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
	Date.prototype.Format = function(fmt) { //author: meizz
		var o = {
			"M+" : this.getMonth()+1,                 //月份
			"d+" : this.getDate(),                    //日
			"h+" : this.getHours(),                   //小时
			"m+" : this.getMinutes(),                 //分
			"s+" : this.getSeconds(),                 //秒
			"q+" : Math.floor((this.getMonth()+3)/3), //季度
			"S"  : this.getMilliseconds()             //毫秒
		};
		if(/(y+)/.test(fmt))
			fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
		for(var k in o)
			if(new RegExp("("+ k +")").test(fmt))
				fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
		return fmt;
	}