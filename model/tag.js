var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tagSchema = new Schema({
    name: {type: String},
    count: Number
});

var Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;
