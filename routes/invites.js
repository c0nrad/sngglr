'use strict';

var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Invite = mongoose.model('Invite');
var User = mongoose.model('User');

var async = require('async');

var _ = require('underscore');

var notifications = require('./notifications');

router.post('/invite', function(req, res, next) {
  if (!req.user) {
    return next('You must be logged in!');
  }
  console.log('email ft', req.user.email, req.body.email);

  var email = req.body.email;

  if (email.split('@').length !== 2) {
    return next('not a valid email');
  }


  var emailDomain = email.split('@')[1];
  var validDomains = process.env.EMAIL_DOMAINS.split(',');
  if (!_.any(_.map(validDomains, function(a) { return a === emailDomain; }))) {
    return next('email must be belong to one of: ' + validDomains.join(', '));
  }

  async.auto({
    previousInvite: function(next) {
      Invite.findOne({email: req.body.email}, function(err, invite) {
        if (invite !== null) {
          return next('User has already been invited');
        }
        return next(err, invite);
      });
    },

    previousUser: function(next) {
      User.findOne({email: req.body.email}, function(err, user) {
        if (user !== null) {
          return next('User is already a member');
        }
        return next(err, user);
      });
    },

    invite: ['previousInvite', 'previousUser', function(next) {

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
