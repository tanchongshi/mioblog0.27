/**
 * Created by Tanchong Shi on 14-4-11.
 */

var mongodb = require('./mongodb');

var Schema = mongodb.mongoose.Schema;

var BlogArticle = new Schema({

});

var BlogCategory = new Schema({
    categoryName: String,
    categoryDate: String,
	categoryNum: { type: Number},
    article: [{ type: Schema.Types.ObjectId, ref: 'Blog' }]
});

var BlogSchema = new Schema({
    labContent: { type: String}, //实验室
    blogTitle: String,
    blogContent: String,
    blogContext: {
        previous: { id: { type: String, default: null}, name: { type: String, default: null}},
        next: { id: { type: String, default: null}, name: { type: String, default: null}}
    },
	blogImage: { type: String},
	blogNum: { type: Number},
	blogRead: { type: Number, default: 0},
    blogDate: { type: String},
    blogCategory : { type: String, ref: 'Category' }
});

var Category = mongodb.mongoose.model("Category",BlogCategory);
var Blog = mongodb.mongoose.model("Blog",BlogSchema);

var BlogDAO = function(){};

/**
 * 写日记，类别不为空保存
 * @param article
 * @param categoryId
 * @param callback
 */
BlogDAO.prototype.saveOnly = function(article, category, callback) {
    article['blogCategory'] = category._id;
    var preName = null;
    var preId = null;
    var nextName = article.blogTitle;
    var nextId = null;
    //查询上一条记录以便保存上下文
    Blog.find({}).sort({'_id':-1}).limit(1).exec(function(err,pre){
		if (err) callback(err);
        if(pre.length != 0){ //如果上文存在 进行保存进当前
            preName =  pre[0].blogTitle;
            preId = pre[0]._id;
            article.blogContext.previous.name = preName;
            article.blogContext.previous.id = preId;
        }
        var blog = new Blog(article);
        blog.save(function(err){
            if (err) callback(err);
            if(pre.length != 0){ //如果上文存在 进行保存进上文
                nextId = blog._id;
                console.log(pre);
                pre[0].blogContext.next.name = nextName;
                pre[0].blogContext.next.id = nextId;
                pre[0].save(function(err) {
					if (err) callback(err);
                    // Category.findById(categoryId,function(err,category){
                    category.article.push(blog);
                    category.save(function(err){
                        callback(err);
                    });
                    // });
                })
            }else {
                category.article.push(blog);
                category.save(function(err){
                    callback(err);
                });
            }

        });
    });
};

/**
 *  写日记，类别为空时保存方式，先建立类别
 * @param category
 * @param callback
 * http://www.dewen.org/q/1146  http://cache.baiducontent.com/c?m=9d78d513d99c1cf30db0c22e1a16a671685f97134bc0a01468a0e55f92144c37427194cc30526313a7c46b6671b83f5cfd804665367337c6eadffc4dcabae23f5ff93045750bf74105a368bb8c067bce7ad61cabb81894a7ed77d6ebc5d3a809119d0f127af6adc90d5c03ca18a1496efef8c218081b4beda82d38bd0e2b2a9e2542b146f8e3306e0282f3ca5c3b996c8f3f&p=8e7bc64ad4934eac5fe6d7274e0e93&newp=8b2a975e86cc42a853fbd512595481231610db2151ddd31464&user=baidu&fm=sc&query=mongodb+%C9%BE%B3%FD%D7%EE%BA%F3%D2%BB%CC%F5%BC%C7%C2%BC&qid=&p1=14
 * http://cnodejs.org/topic/50dde64ea7e6c6171a80a678
 */
BlogDAO.prototype.saveAll = function(article, category, callback) {
    var preName = null;
    var preId = null;
    var nextName = article.blogTitle;
    var nextId = null;
    //查询上一条记录以便保存上下文
    Blog.find({}).sort({'_id':-1}).limit(1).exec(function(err,pre){
		if (err) callback(err);
        if(pre.length != 0){ //如果上文存在 进行保存进当前
            preName =  pre[0].blogTitle;
            preId = pre[0]._id;
            article.blogContext.previous.name = preName;
            article.blogContext.previous.id = preId;
        }
        var instance = new Category(category);
        instance.save(function(err){
            if (err) callback(err);
            article['blogCategory'] = instance._id;
            var blog =  new Blog(article);
            blog.save(function(err){
                if (err) callback(err);
                if(pre.length != 0){ //如果上文存在 进行保存进上文
                    nextId = blog._id;
                    pre[0].blogContext.next.name = nextName;
                    pre[0].blogContext.next.id = nextId;
                    pre[0].save(function(err) {
						if (err) callback(err);
                        instance.article.push(blog);
                        instance.save(function(err) {
                            callback(err);
                        });
                    })
                }else{
                    instance.article.push(blog);
                    instance.save(function(err) {
                        callback(err);
                    });
                }
            })
        });

    })

};

//http://mongoosejs.com/docs/populate.html  http://cnodejs.org/topic/508834ee65e98a980983b3d2  http://www.cnblogs.com/vincedotnet/p/3468501.html
//http://blog.csdn.net/violet_day/article/details/16872059
//通过标题查找文章
BlogDAO.prototype.find = function(callback) {
    Blog.findOne({blogTitle:'标题'})
        .populate('blogCategory')
        .exec(function (err, blog) {
            if (err) return handleError(err);
            console.log( blog.blogCategory.categoryName);
            callback(err, blog.blogCategory.categoryName);
        })
}

//通过类别查找文章
BlogDAO.prototype.findInCategory = function(callback){
    Category
        .findOne({ categoryName: '类别' })
        .populate('article') // only works if we pushed refs to children
        .exec(function (err, person) {
            if (err) return handleError(err);
            console.log(person.article);
        })
}

//插入子文档，暂时不用，搁浅中
BlogDAO.prototype.push = function(obj, callback) {
    //var instance = new Blog();
    Blog.findById('535561e41e99616c19e2c2b2', function (err, post) {
        if (!err) {
            post.blogArticle.push(obj);
            post.save(function (err) {
                callback(err);
            });
        }
    });
}

/**
 * 通过id查找更新 编辑日记
 * @param obj
 * @param callback
 */
BlogDAO.prototype.findByIdAndUpdate = function(obj, callback){
    var _id=obj._id;
    delete obj._id;

    if(obj.blogCategory != "") {
        Category.findOne({categoryName:obj.blogCategory}, function(err, catogryObj){
            if(err) {
                callback(err);
                return;
            }else {
                
                Category.findOne({categoryName:obj.blogOldCategory}, function(err, catogryOldObj){
                    if(err) {
                        callback(err);
                        return;
                    }else {  
                        obj.blogNum = catogryObj.categoryNum;
                        obj.blogCategory = catogryObj._id;
                        console.log(obj.blogOldCategory);
                        console.log(catogryOldObj);
                        eiditorSave(catogryObj, catogryOldObj);                    
                    }         
                })

            }
        });    
    }else {
        obj.blogNum = ""
        obj.blogCategory = ""; 
        var catogryObj = ""
        var catogryOldObj = ""
        eiditorSave(catogryObj, catogryOldObj);
    }
   

    function eiditorSave(catogryObj, catogryOldObj) { 
        Blog.findById(_id, function(err, doc) {
    		if (err) callback(err);
    		
            function docSave(doc) {
                doc.blogTitle = obj.blogTitle;
                doc.blogContent = obj.blogContent;
                doc.blogImage = obj.blogImage;
                if(obj.labContent == '') {
                    doc.labContent = '';
                }else {
                    doc.labContent = obj.labContent;
                }

                if(obj.blogNum != '') {
                    doc.blogNum = obj.blogNum;
                }
                if(obj.blogCategory != '') {
                    doc.blogCategory = obj.blogCategory;
                    if(catogryOldObj.article.length == 1){ //如果只剩最后一篇了 删除栏目
                        catogryOldObj.remove();
                    } else {
                        catogryOldObj.article.pull({_id: doc._id});
                    }                    
                    
                    catogryOldObj.save(function(err) {
                        if(err) {
                            callback(err);
                        } else {
                            catogryObj.article.push(doc);
                            catogryObj.save(function(err) {
                                if(err) {
                                    callback(err);
                                } else {
                                    doc.save(function(err, bObj) {
                                        callback(err, bObj);
                                    })
                                }
                            });
                        }
                    });               
                }else {
                    doc.save(function(err, bObj) {
                        callback(err, bObj);
                    })
                }   
            }
            if(doc.blogTitle == obj.blogTitle) { //如果栏目标题没有改变
                docSave(doc);
            }else { //如果栏目标题改变了
                var nId = doc.blogContext.next.id;
                var pId = doc.blogContext.previous.id;
                if(nId != null && pId != null) { //如果该文章前面和后面文章存在
                    Blog.findById(pId, function(err, pd1) {
                        if (err) callback(err);
                        Blog.findById(nId, function(err, nd1) {
                            if (err) callback(err);
                            pd1.blogContext.next.name = obj.blogTitle;
                            pd1.save(function(err) {
                                if (err) callback(err);
                                nd1.blogContext.previous.name = obj.blogTitle;
                                nd1.save(function(err) {
                                    if (err) callback(err);
                                    docSave(doc);
                                })
                            })
                        })
                    })
                }else if(nId != null && pId == null) { //如果前面一篇为空，后面一篇存在
                    Blog.findById(nId, function(err, bDoc) {
                        if (err) callback(err);
                        bDoc.blogContext.previous.name = obj.blogTitle;
                        bDoc.save(function(err) {
                            if (err) callback(err);
                            docSave(doc);
                        })
                    })
                }else if(nId == null && pId != null) { //如果后面一篇为空，前面一篇存在
                    Blog.findById(pId, function(err, bDoc) {
                        if (err) callback(err);
                        bDoc.blogContext.next.name = obj.blogTitle;
                        bDoc.save(function(err) {
                            if (err) callback(err);
                            docSave(doc);
                        })
                    })
                }else if(nId == null && pId == null) {
                    docSave(doc);
                }
            }
        })
    }
}


/**
 * 通过日记名字检索日记
 * @param name
 * @param callback
 */
BlogDAO.prototype.findByName = function(name, callback) {
   Blog.findOne({blogTitle:name}, function(err, obj){
        callback(err, obj);
    });
};

/**
 * 通过用户名检索博客类别 保存日记的判断类别是否已经存在
 * @param name
 * @param callback
 */
BlogDAO.prototype.findByNameInCategory = function(name, callback) {
    Category.findOne({categoryName:name}, function(err, obj){
        callback(err, obj);
    });
};

/**
 * 查找所有栏目 写日记页面要选择类别 类别管理页面
 * @param callback
 */
BlogDAO.prototype.findAllInCategory = function(callback) {
    Category.find({}, function(err, obj) {
        callback(err, obj);
    })
}

/**
 * 修改栏目名字
 */
BlogDAO.prototype.editorCategoryName = function(obj, callback) {
    var _id=obj._id;
    delete obj._id;
    Category.findOneAndUpdate({_id: _id}, obj, function(err,obj){
        callback(err, obj);
    });
}

//首页分页查找
BlogDAO.prototype.findIndexAll = function(option, callback) {
    var skipFrom = (option.pageNumber * option.resultsPerPage) - option.resultsPerPage; //从第几页开始查询
    Blog.find({}).populate('blogCategory', 'id, categoryName').sort({'_id':-1}).skip(skipFrom).limit(option.resultsPerPage).exec(function(err,limitObj){
        if (err) {
            return callback(err);
        };
        Blog.find({}, function(err, allObj) {
            if (err) {
                return callback(err);
            }
            var pageCount = Math.ceil(allObj.length / option.resultsPerPage);
            callback(err, pageCount, limitObj);
        })
    })
};


//查找指定栏目里面的文章
BlogDAO.prototype.findBlogInCategory = function(option, callback) {
    var skipFrom = (option.pageNumber * option.resultsPerPage) - option.resultsPerPage; //从第几页开始查询
    Category
        .findOne(option.idObj)
        .populate({path: 'article', options: { skip: skipFrom, limit: option.resultsPerPage, sort: {'_id':-1} }}) // only works if we pushed refs to children
        .exec(function (err, allBlog) {
            if (err) {
                return callback(err);
            }
            Category.find(option.idObj, function(err, thisCategory) {
                if (err) {
                    return callback(err);
                }
                var pageCount = Math.ceil(thisCategory[0].article.length / option.resultsPerPage);
                callback(err, pageCount, allBlog);
            })

        })
}


/**
 * (按指定条数检索)后台管理日记
 * @param callback
 */
BlogDAO.prototype.findLimitSix = function(callback) {
    Blog.find({}).populate('blogCategory').sort({'_id':-1}).limit().exec(function(err,obj){
        //console.log(obj);
        callback(err, obj);
    })
};

/**
 * 查询数据是否存在
 * @param user
 * @param callback
 */
BlogDAO.prototype.count = function(user, callback) {
    Blog.count({
        userName: user.userName,
        password: user.password
    }, function (err, obj) {
        callback(err, obj);
    });
};

/**
 * 删除文章
 * @param id
 * @param callback
 */
BlogDAO.prototype.remove = function(id, blogCategory, callback) {


//    Category
//        .findById(blogCategory)
//        .populate({path: 'article',match:{_id: id}}) // only works if we pushed refs to children
//        .exec(function (err, person) {
//            if (err) return handleError(err);
//            person.remove();
//        })

//    Category.findById(blogCategory, function(err, obj){
//        console.log(obj);
//        console.log("tan");
//        if (err) return handleError(err);
//        for(var i in obj.article) {
//
//            if(obj.article[i] == id) {
//                console.log(obj.article[i]);
//                //obj.article.remove(i);
//                var cond = {article: id};
//                obj.remove(cond).run();
//                obj.save(function (err) {
//                    callback(err);
//                })
//            }
//        }
//
//    });

    Blog.findById(id, function(err, text) {
        if (err) callback(err);
        var nId = text.blogContext.next.id;
        var nName = text.blogContext.next.name;
        var pId = text.blogContext.previous.id;
        var pName = text.blogContext.previous.name;
        if(nId != null && pId != null) { //如果该文章前面和后面文章存在
            Blog.findById(pId, function(err, pd1) {
                if (err) callback(err);
                Blog.findById(nId, function(err, nd1) {
                    if (err) callback(err);
                    pd1.blogContext.next.id = nId;
                    pd1.blogContext.next.name = nName;
                    pd1.save(function(err) {
                        if (err) callback(err);
                        nd1.blogContext.previous.id = pId;
                        nd1.blogContext.previous.name = pName;
                        nd1.save(function(err) {
                            if (err) callback(err);
                            comToDo(text);
                        })
                    })
                })
            })
        }else if(nId != null && pId == null) { //如果前面一篇为空，后面一篇存在
            existNCom(Blog, nId, text);
        }else if(nId == null && pId != null) { //如果后面一篇为空，前面一篇存在
            existPCom(Blog, pId, text);
        }else if(nId == null && pId == null) {
            comToDo(text);
        }

        function existNCom(Blog, id, text) { //如果前面一篇为空，后面一篇存在
            Blog.findById(id, function(err, bDoc) {
                if (err) callback(err);
                bDoc.blogContext.previous.id = null
                bDoc.blogContext.previous.name = null;
                bDoc.save(function(err) {
                    if (err) callback(err);
                    comToDo(text);
                })
            })
        }

        function existPCom(Blog, id, text) { //如果后面一篇为空，前面一篇存在
            Blog.findById(id, function(err, bDoc) {
                if (err) callback(err);
                bDoc.blogContext.next.id = null
                bDoc.blogContext.next.name = null;
                bDoc.save(function(err) {
                    if (err) callback(err);
                    comToDo(text);
                })
            })
        }

        function comToDo(text) { //删除栏目里面的文章
            text.remove();
            text.save(function(err) {
                if (err) callback(err);
                Category.findById(blogCategory, function(err, obj){ //删类别里面的文章id http://mongoosejs.com/docs/api.html#types_array_MongooseArray-pull
                    if (err) callback(err);
                    obj.article.pull(id);
                    obj.save(function (err, doc) {
                        if (err) callback(err);
                        if(doc.article.length == 0){ //如果只剩最后一篇了 删除栏目
                            doc.remove();
                            doc.save(function(err) {
                                callback(err);
                            })
                        }else {
                            callback(err);
                        }
                    })
                });
            });
        }
    })

//    Blog.remove({_id: id}, function(err){ //删文章
//        if (err) return handleError(err);
//        Category.findById(blogCategory, function(err, obj){ //删类别里面的文章id http://mongoosejs.com/docs/api.html#types_array_MongooseArray-pull
//            if (err) return handleError(err);
//            obj.article.pull(id);
//            obj.save(function (err, doc) {
//                if (err) return handleError(err);
//                if(doc.article.length == 0){ //如果只剩最后一篇了 删除栏目
//                    doc.remove();
//                    doc.save(function(err) {
//                        callback(err);
//                    })
//                }else {
//                    callback(err);
//                }
//            })
//        });
//    })
};

/**
 * 按id查询 编辑日记
 * @param id
 * @param callback
 */
BlogDAO.prototype.findById = function(id, callback) {
    Blog.findById(id).populate('blogCategory', 'id, categoryName').exec( function (err, doc){
        callback(err, doc);
    });
}

/**
 * 按id查询 前台获得日记，并记录点击数
 * @param id
 * @param callback
 */
BlogDAO.prototype.findByIdFront = function(id, callback) {
    Blog.findById(id).populate('blogCategory', 'id, categoryName').exec( function (err, doc){
		if (err) return callback(err);
        if(doc) {
            doc.blogRead += 1; 
            doc.save(function(err, doc) {
                callback(err, doc)
            })
        }else {
            callback(err, doc);
        }
    });
}

/**
 * 右侧阅读排行
 * @date   2014-10-19
 * @author Tam Chongshi
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
BlogDAO.prototype.findArticleTap = function(callback) {
	Blog.find({}).sort({'blogRead':-1}).limit(5).exec(function(err,doc){
		callback(err, doc);
	})
}

/**
 * 分页查找lab
 * @date   2014-10-19
 * @author Tam Chongshi
 * @param  {[type]}   option   [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
BlogDAO.prototype.findLabByExist = function(option, callback) {
    var skipFrom = (option.pageNumber * option.resultsPerPage) - option.resultsPerPage; //从第几页开始查询
    Blog.find({}).populate('blogCategory', 'id, categoryName').sort({'_id':-1}).skip(skipFrom).limit(option.resultsPerPage).exists('labContent', true).exec(function(err ,limitObj) {
        if (err) {
            return callback(err);
        };
        Blog.find({}).exists('labContent', true).exec(function(err, allObj) { //查找出一共几页
            if (err) {
                return callback(err);
            }
            var pageCount = Math.ceil(allObj.length / option.resultsPerPage);
            callback(err, pageCount, limitObj);
        })
    })
}

module.exports = new BlogDAO();