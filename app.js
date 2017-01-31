var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var mongoose = require('mongoose');
var mongoStore = require('connect-mongo')(session);

var dbUrl = '';
var app = express();

var ItemProvider = require('./itemprovider').ItemProvider;
var itemProvider = new ItemProvider();

var routes = require('./routes/index')(itemProvider);
var admin = require('./routes/admin')(itemProvider);

// Configure express
if ('development' == app.get('env')) {
	dbUrl = 'mongodb://localhost:27017/sample';
}

if ('production' == app.get('env')) {
	dbUrl = process.env.MONGOLAB_URI;
}

mongoose.connect(dbUrl);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true,
	keepExtensions: true
}));

app.use(cookieParser());
app.use(session({
	secret: 'blog',
	store: new mongoStore({
		mongooseConnection: mongoose.connection,
		collection: 'sessions',
		ttl: 24 * 60 * 60
	})
}));
app.use(express.static(path.join(__dirname, 'public')));
app.locals.moment = require('moment');

app.use('/', routes);
app.use('/admin', admin);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});


module.exports = app;
