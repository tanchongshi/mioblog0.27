/**
 * Created by Chongshi Tan on 14-4-7.
 */

var mongodb = require('./mongodb');

var Schema = mongodb.mongoose.Schema;

var UserSchema = new Schema({
    userName: String,
    password: String
});

var User = mongodb.mongoose.model("User",UserSchema);

var UserDAO = function(){};

UserDAO.prototype.save = function(obj, callback) {
    User.find({}).exec(function(err, doc) {
        console.log(doc);
        if(doc.length == 0){
            var instance = new User(obj);
            instance.save(function(err){
                var doc = [];
                callback(err, doc);
            });           
        } else {
            callback(err, doc);
        }
    })
};

UserDAO.prototype.findByIdAndUpdate = function(obj,callback){
    var _id=obj._id;
    delete obj._id;
    User.findOneAndUpdate(_id, obj, function(err,obj){
        callback(err, obj);
    });
}


UserDAO.prototype.findByName = function(name, callback) {
   User.findOne({name:name}, function(err, obj){
        callback(err, obj);
    });
};

/** 查询用户是否存在数据库 **/
UserDAO.prototype.count = function(user, callback) {
    User.count({
        userName: user.userName,
        password: user.password
    }, function (err, obj) {
        callback(err, obj);
    });
};

module.exports = new UserDAO();
