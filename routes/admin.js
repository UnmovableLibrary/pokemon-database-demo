var express = require('express');
var User = require('../model/user');
var _ = require('underscore');
var router = express.Router();

module.exports = function(itemProvider) {
	router.get('/', function(req, res, next) {
		res.redirect('/admin/home');
	});

	/*router.get('/signup', function(req, res, next) {
		res.render('signup');
	});

	router.post('/signup', function(req, res, next) {
		var _user = req.body.user;
		_user.avatar = 'http://7xrn7f.com1.z0.glb.clouddn.com/16-6-11/21531535.jpg';

		User.findOne({
			username: _user.username
		}, function(err, user) {
			if (err) {
				console.error(err);
			}

			if (user) {
				res.redirect('/admin/signup');
			} else {
				var user = new User(_user);

				user.save(function(err, user) {
					if (err) console.error(err);

					res.redirect('/admin/login');
				})
			}
		})
	}); */

	router.get('/login', function(req, res, next) {
		res.render('login');
	}).post('/login', function(req, res, next) {
		var _user = req.body.user;
		var username = _user.username;
		var password = _user.password;
		var pageErrors = {
			username: username,
			password: password
		};

		User.findOne({
			username: username
		}, function(err, user) {
			if (err) {
				console.error(err);
			}

			if (!user) {
				return res.render('login', {
					incorrectUser: true,
					pageErrors: pageErrors
				});
			}

			user.validatePassword(password, function(err, isMatched) {
				if (err) {
					console.error(err);
				}

				if (isMatched) {
					req.session.user = user;
					return res.redirect('/admin/home');

				} else {
					return res.render('login', {
						incorrectPassword: true,
						pageErrors: pageErrors
					});
				}
			});
		})
	});

	router.get('/logout', function(req, res) {
		delete req.session.user;

		res.redirect('/');
	});

	router.get('/home', function(req, res) {
		if (req.session.user) {
			itemProvider.findAll(function(error, items) {
				itemProvider.findAllTags(function(err, allTags) {
					if (err) {
						console.error(err);
					} else {
						res.render('home', {
							user: req.session.user,
							items: items,
							tags: allTags
						});
					}
				});

			});
		} else {
			res.render('login');
		}
	});

	/* GET users listing. */
	router.get('/merch/new', function(req, res) {
		if (req.session.user) {
			itemProvider.findAllTags(function(err, allTags) {
				if (err) {
					console.error(err);
				} else {
					return res.render('new_merch', {
						user: req.session.user,
						item: {
							title: '',
							character: '',
							category: '',
							content: '',
							image: '',
							company: '',
							series: '',
							releaseYear: '',
							priceUSD: '',
							priceYen: '',
							tag: ['','',''],
							comments: [],
							meta: {}
						},
						isUpdate: false,
						tags: allTags
					});
				}
			});

		} else {
			return res.render('login');
		}
	});

	router.post('/merch/new', function(req, res) {
		var id = req.body.item._id;
		var itemObj = req.body.item;
		itemObj.author = req.session.user.username;
		itemObj.content = req.body.content;
		itemObj.tag = [];
		itemObj.tag.push(req.body.tag1.toLowerCase(), req.body.tag2.toLowerCase(), req.body.tag3.toLowerCase());
		var _item;

		if (id !== 'undefined') {
			itemProvider.findById(id, function(err, item) {
				if (err) {
					console.error(err);
				}
				_item = _.extend(item, itemObj);
				_item.save(function(err, item) {
					if (err) {
						console.error(err);
					}
					res.redirect('/merch/' + item._id);
				})
			})
		} else {
			itemProvider.save(itemObj, function(err, id) {
				if (err) {
					console.error(err);
				} else {
					itemProvider.updateTagsAdd(itemObj.tag, function(err) {
						if (err) {
							console.error(err);
						}
					});
					res.redirect('/merch/' + id);
				}
			});
		}
	});

	router.get('/merch/update/:id', function(req, res) {
		var id = req.params.id;

		if (id) {
			itemProvider.findById(id, function(err, item) {
				itemProvider.findAllTags(function(err, allTags) {
					if (err) {
						console.error(err);
					} else {
						res.render('new_merch', {
							user: req.session.user,
							item: item,
							tags: allTags,
							isUpdate: true
						})
					}
				});

			})
		} else {
			console.error('Lost post id...');
		}
	});

	router.get('/merch/remove/:id', function(req, res) {
		var id = req.params.id;

		if (id) {
			itemProvider.removeById(id, function(err) {
				if (err) {
					console.error(err);
				} else {
					res.redirect('/admin/home');
				}
			});
		}
	});

	return router;
};
