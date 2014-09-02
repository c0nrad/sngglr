'use strict';

var express = require('express');
var router = express.Router();

var async = require('async');

var mongoose = require('mongoose');
var Match = mongoose.model('Match');
var Chat = mongoose.model('Chat');

router.get('/users/:user/matches/:match/chats', function(req, res, next) {
  Match.findOne({'users' : {$elemMatch: {user: req.user._id}}, _id: req.params.match}, function(err, match) {
    if (err) {
      return next(err);
    }

    Chat.find({match: match._id}, function(err, chats) {
      if (err) {
        return next(err);
      }

      res.json(chats);
    });

  });
});

router.put('/users/:user/matches/:match/chats/seen', function(req, res, next) {
  Chat.update({match: req.params.match}, {$set: { 'to.seen': true}}, {multi: true}, function(err) {
    if (err) {
      return next(err);
    }

    res.send('okay');
  });
});

router.post('/users/:user/matches/:match/chats', function(req, res, next) {

  async.auto({
    match: function(next) {
      Match.findById(req.params.match, function(err, match) {
        if (err) {
          return next(err);
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
    }]

  }, function(err, results) {
    if (err) {
      return next(err);
    }

    res.json(results.chat[0]);
  });
});

module.exports = router;
