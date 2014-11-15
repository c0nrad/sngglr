'use strict';

var express = require('express');
var router = express.Router();

var notifications = require('./notifications');

var async = require('async');

var mongoose = require('mongoose');
var Match = mongoose.model('Match');
var Chat = mongoose.model('Chat');
var User = mongoose.model('User');

router.get('/users/:user/matches/:match/chats', function(req, res, next) {
  if (!req.user) {
    return next(401);
  }

  Match.findOne({'users' : {$elemMatch: {user: req.user._id}}, _id: req.params.match}, function(err, match) {
    if (err) {
      return next(err);
    }

    if (match === null) {
      return next('not a valid match');
    }

    Chat.find({match: match._id}, function(err, chats) {
      if (err) {
        return next(err);
      }

      res.json(chats);
    });

  });
});

router.get('/users/:user/matches/:match/chats/unseen', function(req, res, next) {
  if (!req.user) {
    return next(401);
  }

  Match.findOne({'users' : {$elemMatch: {user: req.user._id}}, _id: req.params.match}, function(err, match) {
    if (err) {
      return next(err);
    }

    if (match === null) {
      return next('not a valid match');
    }

    Chat.find({ 'to.user': req.user._id, 'to.seen': false, match: req.params.match }).count().exec(function(err, count) {
      if (err) {
        return next(err);
      }

      res.json({count: count});
    });

  });
});

router.post('/users/:user/matches/:match/chats', function(req, res, next) {
  if (!req.user) {
    return next(401);
  }

  if (!req.body.message || req.body.message.trim() === '') {
    return next('Not a valid message');
  }

  async.auto({
    match: function(next) {
      Match.findOne({'users' : {$elemMatch: {user: req.user._id}}, _id: req.params.match}, function(err, match) {
        if (err) {
          return next(err);
        }

        if (match === null) {
          return next('not a valid match');
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

    chat: ['match', function(next, results) {
      var match = results.match;
      var c = new Chat({
        from: {
          user: req.user._id,
          name: req.user.name
        },

        to: {
          user: match.other.user,
          name: match.other.name
        },
        message: req.body.message,
        match: match._id
      });

      c.save(next);
    }],

    other: ['match', function(next, results) {
      var match = results.match;
      User.findById(match.other.user, next);
    }],

    notifications: ['other', 'chat', 'match', function(next, results) {
      var other = results.other;
      console.log('other', other);

      var match = results.match;

      if (other.notifications.onChat.sms) {
        notifications.sms(other.phone, notifications.onChat.sms(req.user.name, match._id), function(err) {
          if (err) {
            console.log(err);
          }
        });
      }

      if (other.notifications.onChat.email) {
        notifications.email(other.email, 'Sngglr: New Chat', notifications.onChat.email(req.user.name, match._id), function(err) {
          if (err) {
            console.log(err);
          }
        });
      }
      next();
    }]

  }, function(err, results) {
    if (err) {
      return next(err);
    }

    res.json(results.chat[0]);
  });
});

module.exports = router;
