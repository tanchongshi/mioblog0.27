/**
 * Created by Chongshi Tan on 14-11-7.
 */

var mongodb = require('./mongodb');

var Schema = mongodb.mongoose.Schema;

var MioFile = new Schema({
    autoName: String,
    realName: String,
    path:     String,
    fileType: String,
    blogDate: { type: String}
});

var File = mongodb.mongoose.model("File",MioFile);

var FileDAO = function(){};

/** 
 * 上传文件保存文件到数据库
 */
FileDAO.prototype.save = function(mioFile, callback) {
    var mioFile = new File(mioFile);
    mioFile.save(function (err) {
      //if (err) callback(err);
      callback(err);  
    });
};

/**
 * (按指定条数检索)后台管理日记
 * @param callback
 */
FileDAO.prototype.findAllFiles = function(callback) {
    File.find({}).populate('').sort({'_id':-1}).limit().exec(function(err,obj){
        callback(err, obj);
    })
};

/**
 * 删除文件
 */
FileDAO.prototype.deleteFile = function(fileId, callback) {
    File.remove({_id: fileId}, function(err, doc) {
        callback(err, doc);
    })
}


module.exports = new FileDAO();
