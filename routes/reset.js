'use strict';

var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Reset = mongoose.model('Reset');
var User = mongoose.model('User');

var async = require('async');
var moment = require('moment');

var notifications = require('./notifications');

router.post('/reset', function(req, res, next) {

  if (!req.body.email)
    return next('Not a valid email');

  async.auto({
    user: function(next) {
      User.findOne({email: req.body.email}, next);
    },

    reset: ['user', function(next, results) {
      var user = results.user;

      if (user === null) {
        // Don't allow them to enumerate users, so no error
        return next(null);
      }
      var r = new Reset({
        user: user._id
      });

      r.save(next);
    }],

    sendEmail: ['reset', 'user', function(next, results) {
      var reset = results.reset[0];
      var user = results.user;
      notifications.email(user.email, 'Sngglr: Reset Password', notifications.resetEmail(reset.token), next);
    }]
  }, function(err) {
    if (err) {
      return next(err);
    }

    return res.send('okay');
  });
});

router.post('/reset/:token', function(req, res, next) {
  console.log('wtf');
  if (req.body.password === undefined || req.body.password.length === 0) {
    return next('Not a valid password');
  }

  async.auto({
    reset: function(next) {
      Reset.findOne({token: req.params.token}, function(err, reset) {
        if (reset === null) {
          return next('not a valid reset token');
        }

        if (moment(reset.validTill).unix() < moment().unix()) {
          return next('reset token expired');
        }

        next(null, reset);
      });
    },

    user: ['reset', function(next, results) {
      var reset = results.reset;
      User.findById(reset.user, next);
    }],

    changePassword: ['user', function(next, results) {
      var user = results.user;
      user.password = req.body.password;
      user.save(next);
    }]
  }, function(err) {
    if (err) {
      return next(err);
    }

    res.send('okay');
  });
});

module.exports = router;
