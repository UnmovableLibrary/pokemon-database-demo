var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Comment = require('./comment');

var itemSchema = new Schema({
	author: String,
	title: String,
	image: String,
	character: String,
	category: String,
	content: String,
	company: String,
	tag: [{type: String}],
	comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}],
	meta: {
		created_at: {
			type: Date,
			default: Date.now()
		},
		updated_at: {
			type: Date,
			default: Date.now()
		}
	},
	series: String,
	releaseYear: Number,
	priceUSD: Number,
	priceYen: Number
});

itemSchema.pre('save', function(next) {
	if (this.isNew) {
		this.meta.created_at = this.meta.updated_at = Date.now();
	} else {
		this.meta.updated_at = Date.now();
	}
	next();
});

var Item = mongoose.model('Item', itemSchema);

module.exports = Item;
