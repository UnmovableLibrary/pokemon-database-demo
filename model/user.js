var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;
var SALT_WORK_FACTOR = 10;

var userSchema = new Schema({
	username: {
		unique: true,
		type: String
	},
	password: String,
	avatar: String
});

userSchema.pre('save', function(next) {
	var user = this;

	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
		if (err) next(err);

		bcrypt.hash(user.password, salt, function(err, hash) {
			if (err) next(err);

			user.password = hash;
			next();
		})
	})
});

userSchema.methods = {
	validatePassword: function(password, callback) {
		bcrypt.compare(password, this.password, function(err, isMatched) {
			if (err) {
				return callback(err);
			}

			callback(null, isMatched);
		})
	}
};

var User = mongoose.model('User', userSchema);

module.exports = User;
