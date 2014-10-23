'use strict';

var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Like = mongoose.model('Like');
var Match = mongoose.model('Match');
var Invite = mongoose.model('Invite');

var _ = require('underscore');

var async = require('async');

router.get('/stats', function(req, res, next) {
  async.auto({

    count: function(next) {
      User.find({confirmed: true}).count().exec(next);
    },

    notConfirmed: function(next) {
      User.find({confirmed: false}).count().exec(next);
    },

    maleCount: function(next) {
      async.auto({
        mtu: function(next) {
          User.find({gender: 'male', confirmed: true, email: /mtu.edu/}).count().exec(next);
        },

        fu: function(next) {
          User.find({ gender: 'male', confirmed: true, $or: [ {email: /fu.edu/}, {email: /finlandia.edu/}]}).count().exec(next);
        }
      }, function(err, results) {
        next(err, results);
      });
    },

    femaleCount: function(next) {
      async.auto({
        mtu: function(next) {
          User.find({gender: 'female', confirmed: true, email: /mtu.edu/}).count().exec(next);
        },

        fu: function(next) {
          User.find({ gender: 'female', confirmed: true, $or: [ {email: /fu.edu/}, {email: /finlandia.edu/}]}).count().exec(next);
        }
      }, function(err, results) {
        next(err, results);
      });
    },

    likes: function(next) {
      async.auto({
        yes: function(next) {
          Like.find({likeType: 'yes'}).count().exec(next);
        },

        maybe: function(next) {
          Like.find({likeType: 'maybe'}).count().exec(next);
        },

        no: function(next) {
          Like.find({likeType: 'no'}).count().exec(next);
        }
      }, function(err, results) {
        next(err, results);
      });
    },

    matches: function(next) {
      async.auto({
        yes: function(next) {
          Match.find({matchType: 'yes'}).count().exec(next);
        },

        maybe: function(next) {
          Match.find({matchType: 'maybe'}).count().exec(next);
        }
      }, function(err, results) {
        next(err, results);
      });
    },
    joinDates: function(next) {
      User.find({confirmed: true}, {_id: 0, firstLogin: 1}).sort({firstLogin: 1}).exec(function(err, results) {
        if (err) {
          return next(err);
        }

        return next(err, _.pluck(results, 'firstLogin'));
      });
    },

    invites: function(next) {
      async.auto({
        sent: function(next) {
          Invite.find().count().exec(next);
        },

        accepted: function(next) {
          Invite.find({}, {_id: 0, email: 1}).exec(function(err, results) {
            async.map(results, function(result, next) {
              User.find({email: result.email}).count().exec(next);
            }, function(err, results) {
              var totalAccepted = _.reduce(results, function(a, b) { return a + b; }, 0);
              next(err,totalAccepted);
            });
          });
        }
      }, function(err, results) {
        next(err, results);
      });
    }

  }, function(err, results) {
    if (err) {
      next(err);
    }

    res.json(results);
  });
});

module.exports = router;
// Most liked yser
// Most matched user
// Most loving user

// # Total
// > db.users.count()
// 232
//
// # Male
// > db.users.find({gender: "male"}).count()
// 166
//
// # Female
// > db.users.find({gender: "female"}).count()
// 66
//
// # FU
// > db.users.find({ $or: [ {email: /fu.edu/}, {email: /finlandia.edu/}]}).count()
// 18
//
// # MTU
// > db.users.find({ email: /mtu.edu/}).count()
// 214
//
// # Matches
// > db.matches.find().count()
// 136
//
// # Types
//
// # Yes Type
// db.likes.find({likeType: "yes"});
//
// # Maybe Type
// db.likes.find({likeType: "maybe"});
//
// # No Types
