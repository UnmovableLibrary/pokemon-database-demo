var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentSchema = new Schema({
    item: Schema.Types.ObjectId,
    name: String,
    email: String,
    content: String,
    created_at: Date
});

commentSchema.pre('save', function(next) {
    this.created_at = Date.now();
    next();
});

var Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;