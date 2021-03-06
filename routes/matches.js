'use strict';

var express = require('express');
var router = express.Router();

var async = require('async');

var mongoose = require('mongoose');
var Match = mongoose.model('Match');
var Chat = mongoose.model('Chat');
var Like = mongoose.model('Like');

router.get('/users/:user/matches', function(req, res, next) {
	if (!req.user) {
		return next(401);
	}


	Match.find({'users' : {$elemMatch: {user: req.user._id}}}, function(err, matches) {
  	if (err) {
			return next(err);
		}

		var out = matches.map(function(m) {
			var match = m.toJSON();
			for (var i = 0; i < match.users.length; ++i) {
				var user = match.users[i];
				if (user.user.toString() === req.user._id.toString()) {
					match.me = user;
				} else {
					match.other = user;
				}
			}
			return match;
		});
  	res.json(out);
	});
});

router.put('/users/:user/matches/:match/seen', function(req, res, next) {
	if (!req.user) {
		return next(401);
	}

	Match.findOne({'users' : {$elemMatch: {user: req.user._id}}, _id: req.params.match}, function(err, match) {
		if (err) {
			return next(err);
		}

		for (var i = 0; i < match.users.length; ++i) {
			if (match.users[i].user.toString() === req.user._id.toString() && !match.users[i].seen) {

				match.users[i].seen = true;
				match.save(function(err) {
					if (err) {
						console.log(err);
					}
				});
			}
		}

		Chat.update({match: req.params.match, 'to.user': req.user._id }, {$set: { 'to.seen': true}}, {multi: true}, function(err) {
			if (err) {
				return next(err);
			}

			res.send('okay');
		});

	});
});

router.get('/users/:user/matches/:match', function(req, res, next) {
	if (!req.user) {
		return next(401);
	}

	Match.findOne({'users' : {$elemMatch: {user: req.user._id}}, _id: req.params.match}, function(err, match) {
		if (err) {
			return next(err);
		}

		if (match === null) {
			return next('no a valid match');
		}

		match = match.toJSON();
		for (var i = 0; i < match.users.length; ++i) {
			var user = match.users[i];
			if (user.user.toString() === req.user._id.toString()) {
				match.me = user;
			} else {
				match.other = user;
			}
		}

		res.json(match);
	});
});


router.delete('/users/:user/matches/:match', function(req, res, next) {
	if (!req.user) {
		return next(401);
	}

	async.auto({
		match: function(next) {
			Match.findOne({'users' : {$elemMatch: {user: req.user._id}}, _id: req.params.match}, function(err, match) {
				if (err) {
					return next(err);
				}

				if (match === undefined) {
					return next('no such model exists');
				}

				match = match.toJSON();
				for (var i = 0; i < match.users.length; ++i) {
					var user = match.users[i];
					if (user.user.toString() === req.user._id.toString()) {
						match.me = user;
					} else {
						match.other = user;
					}
				}

				if (match.me === undefined) {
					next('User not apart of match');
				}

				next(null, match);
			});
		},

		like: ['match', function(next, results) {
			var match = results.match;
			Like.findOne({ 'liker.user': match.me.user, 'likee.user': match.other.user}, next);
		}],

		removeChats: ['match', function(next, results) {
			var match = results.match;
			Chat.find({match: match._id}).remove(next);
		}],

		changeLike: ['like', function(next, results) {
			var like = results.like;
			like.likeType = 'no';
			like.save(next);
		}],

		removeMatch: ['match', function(next, results) {
			var match = results.match;
			Match.findByIdAndRemove(match._id, next);
		}]
	}, function(err) {
		if (err) {
			console.log('err', err);
			return next(err);
		}

		res.send('okay');
	});
});

module.exports = router;
