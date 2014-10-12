'use strict';

var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Invite = mongoose.model('Invite');

var async = require('async');

var notifications = require('./notifications');

router.post('/invite', function(req, res, next) {
  if (!req.user) {
    return next('You must be logged in!');
  }

  var email = req.body.email;
  console.log(email);
  async.auto({
    previousInvite: function(next) {
      Invite.findOne({email: req.body.email}, function(err, invite) {
        if (invite !== null) {
          return next('User has already been invited');
        }
        return next(err, invite);
      });
    },

    invite: ['previousInvite', function(next) {

      var i = new Invite({
        email: email,
        from: req.user._id
      });

      i.save(next);
    }],

    email: ['invite', function(next) {
      notifications.email(email, 'Sngglr: You\'ve been invited!', notifications.inviteEmail(email), next);
    }]
  }, function(err) {
    if (err) {
      return next(err);
    }

    res.json('User has been invited.');
  });
});

module.exports = router;
