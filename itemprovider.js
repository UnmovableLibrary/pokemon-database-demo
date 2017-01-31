var Item = require('./model/item');
var Comment = require('./model/comment');
var Tag = require('./model/tag');

ItemProvider = function() {

};

ItemProvider.prototype.findAll = function(callback) {
	Item.find({})
		.sort({'meta.updated_at': -1})
		.exec(function(err, items) {
		if (err) {
			callback(err);
		} else {
			callback(null, items)
		}
	});
};

ItemProvider.prototype.findById = function(id, callback) {
	Item.findOne({
		_id: id
	}, function(err, item) {
		if (err) {
			callback(err);
		} else {
			callback(null, item)
		}
	});
};

ItemProvider.prototype.save = function(item, callback) {

	if (item.comments === undefined) {
		item.comments = [];
	}

	item = new Item({
		author: item.author,
		title: item.title,
		category: item.category,
		image: item.image,
		content: item.content,
		company: item.company,
		series: item.series,
		priceUSD: item.priceUSD,
		priceYen: item.priceYen,
		character: item.character,
		releaseYear: item.releaseYear,
		tag: item.tag,
		comments: item.comments
	});

	item.save(function(err) {
		if (err) {
			callback(err, null);
		} else {
			callback(null, item._id);
		}
	});
};

ItemProvider.prototype.removeById = function(id, callback) {

	var self = this;
	Item.findOne({_id: id}, function(err, item) {
		if (err) {
			callback(err);
		} else {
			var tagArray = Item.tag;
			Item.remove({_id: id}, function(err) {
				if (err) {
					callback(err);
				} else {
					self.updateTagsRemove(tagArray);
					callback(null);
				}
			});
		}
	});

};

ItemProvider.prototype.searchFromTag = function(tag, callback) {

	if (tag == '') {
		Item.find({})
			.sort({'meta.updated_at': -1})
			.exec(function(err, items) {
				if (err) {
					callback(err);
				} else {
					var results = [];
					if (items.length) {
						items.forEach(function(item) {
							var item = {
								id: item._id,
								title: item.title,
								category: item.category,
								company: item.company,
								image: item.image,
								series: item.series,
								updated_time: item.meta.updated_at,
								tag: item.tag
							};
							results.push(item);
						});
					}
					callback(null, results);
				}
			});
	} else {
		Item.find({'tag': {$in: [tag]}})
			.sort({'meta.updated_at': -1})
			.exec(function(err, items) {
				if (err) {
					callback(err);
				} else {
					var results = [];
					if (items.length) {
						items.forEach(function(item) {
							var item = {
								id: item._id,
								title: item.title,
								category: item.category,
								company: item.company,
								image: item.image,
								series: item.series,
								updated_time: item.meta.updated_at,
								tag: item.tag
							};
							results.push(item);
						});
					}
					callback(null, results);
				}
			});
	}
};

ItemProvider.prototype.searchFromKeyword = function(keyword, callback) {
	var reg = new RegExp(keyword, 'i');

	Item.find({'title': reg})
		.sort({'meta.updated_at': -1})
		.exec(function(err, items) {
		if (err) {
			callback(err);
		} else {
			var results = [];
			if (items.length) {
				items.forEach(function(item) {
					var item = {
						id: item._id,
						title: item.title,
						category: item.category,
						company: item.company,
						image: item.image,
						series: item.series,
						updated_time: item.meta.updated_at,
						tag: item.tag
					};
					results.push(item);
				});
			}
			callback(null, results);
		}
	});
};

ItemProvider.prototype.addCommentById = function(id, comment, callback) {

	Item.findOne({
		_id: id
	}).populate('comments').exec(function(err, item) {
		if (err) {
			callback(err);
		} else {
			var _comment = new Comment({
				item: id,
				name: comment.name,
				email: comment.email,
				content: comment.content
			});

			_comment.save(function(err) {
				if (err) {
					callback(err);
				} else {
					item.comments.push(_comment);
					item.save(callback);
				}
			});
		}
	});

};

ItemProvider.prototype.findAllComments = function(item, callback) {

	var results = [];
	Comment.find({})
		.where('item').equals(Item._id).exec(function (err, comments) {
			if (err) {
				callback(err);
			}

			for (var i = 0, len = comments.length; i < len; i++) {
				results.push({
					name: comments[i].name,
					content: comments[i].content,
					created_at: comments[i].created_at
				})
			}

			callback(null, results);
		});
};

ItemProvider.prototype.findAllTags = function(callback) {

	var result = [];
	Tag.find({}, function(err, tags) {
		if (err) {
			callback(err);
		} else {
			tags.forEach(function(item) {
				result.push(item.name);
			});
			callback(null, result);
		}
	});

};

ItemProvider.prototype.addTag = function(tagName, callback) {
	Tag.findOne({name: tagName}, function(err, tag) {
		if (err) {
			callback(err);
		} else {
			if (tag) {
				Tag.update({name: tagName}, {$inc: {count: 1}}, function(err) {
					if (err) {
						console.error(err);
					}
				});
			} else {
				var newTag = new Tag({name: tagName, count: 1});
				newTag.save(function (err) {
					if (err) {
						console.error(err);
					}
				});
			}
		}
	});
};

ItemProvider.prototype.removeTag = function(tagName) {
	Tag.findOne({name: tagName}, function(err, tag) {
		if (err) {
			console.error(err);
		} else {
			if (tag) {

				Tag.update({name: tagName}, {$inc: {count: -1}}, function (err) {
					if (err) {
						console.error(err);
					} else {
						if (tag.count == 1) {
							Tag.remove({name: tagName}, function (err) {
								if (err) {
									console.error(err);
								}
							});
						}
					}
				});

			}
		}
	});
};

ItemProvider.prototype.updateTagsAdd = function(tagArray, callback) {

	var self = this;
	tagArray.forEach(function(tag) {
		var tagName = tag.trim();
		if (tagName.length !== 0) {
			self.addTag(tagName, callback);
		}
	});
};

ItemProvider.prototype.updateTagsRemove = function(tagArray) {

	var self = this;
	tagArray.forEach(function(tag) {
		tag = tag.trim();
		if (tag.length !== 0) {
			self.removeTag(tag);
		}
	});
};

exports.ItemProvider = ItemProvider;
