/**
 * Created by Chongshi Tan on 14-4-7.
 */

// DB Connection
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/mioblog');
exports.mongoose = mongoose;