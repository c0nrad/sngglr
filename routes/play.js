'use strict';

var express = require('express');
var router = express.Router();

var async = require('async');

var mongoose = require('mongoose');
var Like = mongoose.model('Like');
var User = mongoose.model('User');
var Picture = mongoose.model('Picture');

router.get('/play', function(req, res, next) {
  var me = req.user;
  if (!me) {
    return res.send(401);
  }

  async.auto({
    // Find all peopel you're already rated

    pictures: function(next) {
      Picture.find({user: req.user._id}, function(err, results) {
        if (err) {
          return next(err);
        }

        if (results.length === 0) {
          return next('You must have a picture to play');
        }

        next();
      });
    },

    likes: function(next) {
      Like.find({'liker.user': me._id}).exec(next);
    },

    users: ['likes', function(next, results) {

      var previousLikes = results.likes.map(function(like) { return like.likee.user; } );
      previousLikes.push(me._id);

      var query = {
        _id: { $nin: previousLikes },
        looking: { $in: [me.gender, 'both'] },
      };

      if (me.looking !== 'both') {
        query.gender = me.looking;
      }

      User.find(query).exec(next);
    }],

    picturedUser: ['users', function(next, results) {
      var users = results.users;

      async.map(users, function(user, next) {
        var out = user.toJSON();
        Picture.find({user: user._id}, function(err, pictures) {
          out.pictures = pictures;
          return next(err, out);
        });
      }, function(err, results) {
        if (err) {
          return next(err);
        }

        for (var i = 0; i < results.length; ++i) {
          var user = results[i];
          if (user.pictures.length > 0) {
            return next(null, user);
          }
        }
        next(null, null);
      });
    }]
  }, function(err, results) {
    if (err) {
      return next(err);
    }

    res.send(results.picturedUser);
  });
});

module.exports = router;
