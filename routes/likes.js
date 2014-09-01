'use strict';

var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Like = mongoose.model('Like');
var Match = mongoose.model('Match');
var User = mongoose.model('User');

var async = require('async');

var notifications = require('./notifications');

router.post('/like', function(req, res, next) {

  if (!req.user) {
    return next('Must be logged in to like someone');
  }

  var otherId = req.query.other;
  var likeType = req.query.likeType.toLowerCase();

  async.auto({
    previousLike: function(next) {
      Like.findOne({'liker.user': req.user._id, 'likee.user': otherId}).exec(next);
    },

    checkPrevious: ['previousLike', function(next, results) {
      if (results.previousLike !== null) {
        return next('This like already exist!');
      }
      next(null);
    }],

    otherLike: ['checkPrevious', function(next) {
      Like.findOne({'liker.user': otherId, 'likee.user': req.user._id, likeType: { $in: ['yes', 'maybe']}}).exec(next);
    }],

    me: ['checkPrevious', function(next) {
      User.findById(req.user._id).exec(next);
    }],

    other: ['checkPrevious', function(next) {
      User.findById(otherId).exec(next);
    }],

    like: ['me', 'other', function(next, results) {
      var me = results.me;
      var other = results.other;

      if (!me) {
        return next('Liker does not exist!');
      }

      if (!other) {
        return next('Likee does not exist!');
      }

      var l = new Like({
        likeType: likeType,
        liker: { user: me._id, name: me.name },
        likee: { user: other._id, name: other.name }
      });
      l.save(next);
    }],

    likeNotification: ['like', 'other', function(next, results) {
      var other = results.other;
      if (likeType === 'no' || likeType === 'maybe') {
        next(null, 'not a yes like');
      }

      async.auto({
        sms: function(next) {
          if (other.notifications.onLike.sms) {
            return notifications.sms(other.phone, notifications.onLike.sms, next);
          }
          next();
        },

        email: function(next) {
          if (other.notification.onLike.email) {
            return notifications.email(other.email, 'Sngglr: New Like!', notifications.onLike.email, next);
          }
          next();
        }
      }, function(err, results) {
        if (err) {
          console.log(err, results);
        }

        next(null, JSON.stringify(err) + results);
      });
    }],

    match: ['otherLike', 'me', 'other', function(next, results) {
      var me = results.me;
      var other = results.other;
      var otherLike = results.otherLike;

      if (otherLike === null || otherLike.likeType === 'no' || likeType === 'no') {
        return next(null);
      }

      var m = new Match({
        matchType: otherLike.likeType,
        users: [{ user: me._id, name: me.name },{ user: other._id, name: other.name }]
      });
      m.save(next);
    }],

    matchNotifications: ['match', 'other', function(err, results) {
      var other = results.other;
      if (results.match === null) {
        return next(null);
      }

      async.auto({
        sms: function(next) {
          if (other.notifications.onMatch.sms) {
            return notifications.sms(other.phone, notifications.onMatch.sms(other.name), next);
          }
          next();
        },

        email: function(next) {
          if (other.notification.onMatch.email) {
            return notifications.email(other.email, 'Sngglr: New Match!', notifications.onMatch.email(other.name), next);
          }
          next();
        }
      }, function(err, results) {
        if (err) {
          console.log(err, results);
        }

        next(null, JSON.stringify(err) + results);
      });
    }]
  }, function(err, results) {
    if (err) {
      return next(err);
    }

    res.send(results.like[0]);
  });
});

module.exports = router;
