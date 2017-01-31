var express = require('express');
var router = express.Router();
var Comment = require('../model/comment');

module.exports = function(itemProvider) {

	/* GET home page. */
	router.get('/', function(req, res, next) {
		if (req.session.user) {
			res.redirect('/admin/home');
		} else {

			itemProvider.findAll(function (error, items) {
				itemProvider.findAllTags(function (err, allTags) {
					if (err) {
						console.error(err);
					} else {
						res.render('index', {
							title: 'My Collection',
							description: 'figures - plush - accessories',
							items: items,
							tags: allTags
						});
					}
				});

			});
		}
	});

	router.get('/merch/search', function(req, res) {
		var keyword = req.query.keyword;

		itemProvider.searchFromKeyword(keyword, function(err, results) {
			if (err) {
				console.error(err);
			} else {
				var logged = false;
				if (req.session.user) {
					logged = true;
				}
				res.json({result: results, logged: logged});
			}
		});
	});

	router.get('/merch/category', function(req, res) {
		var tag = req.query.tag;

		itemProvider.searchFromTag(tag, function(err, results) {
			if (err) {
				console.error(err);
			} else {
				var logged = false;
				if (req.session.user) {
					logged = true;
				}
				res.json({result: results, logged: logged});
			}
		});
	});

	router.get('/merch/:id', function(req, res) {
		var id = req.params.id;

		itemProvider.findById(id, function(err, item) {
			if (err) {
				console.error(err);
			} else {
				itemProvider.findAllComments(item, function(err, comments) {
					if (err) {
						console.error(err);
					}
					itemProvider.findAllTags(function(err, allTags) {
						if (err) {
							console.error(err);
						} else {
							res.render('detail', {
								user: req.session.user,
								item: item,
								comments: comments,
								tags: allTags
							});
						}
					});

				});
			}
		});
	});

	router.post('/merch/reply/:id', function(req, res) {
		var id = req.params.id;

		var comment = {
			name : req.body.name,
			email : req.body.email,
			content : req.body.content
		};

		itemProvider.addCommentById(id, comment, function(err, item) {
			if (err) {
				console.error(err);
			}

			var backURL = '/merch/' + id;
			res.redirect(backURL);
		});
	});

	return router;
};
