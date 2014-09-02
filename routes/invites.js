'use strict';

var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Invite = mongoose.model('Invite');

var async = require('async');

var notifications = require('notifications');

router.post('/invite', function(req, res, next) {
  if (!req.user) {
    return next('You must be logged in!');
  }

  var email = req.body.email;
  async.auto({
    previousInvite: function(next) {
      Invite.findOne({email: req.body.email}, function(err, invite) {
        if (invite === null) {
          return next('User has already been invited');
        }
        return next(err, invite);
      });
    },

    invite: ['previousInvite', function(next, results) {
      var previous = results.previousInvite;

      if (previous !== null || previous !== undefined) {
        return next('User has already been invited.');
      }
      var i = new Invite({
        email: email,
        from: req.user._id
      });

      i.save(next);
    }],

    email: ['invite', function(next) {
      notifications.email(email, 'Sngglr: You\'ve been invited!', notifications.inviteEmail, next);
    }]
  }, function(err) {
    if (err) {
      return next(err);
    }

    res.json('okay');
  });
});
