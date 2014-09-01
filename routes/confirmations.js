'use strict';

var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Confirmation = mongoose.model('Confirmation');
var User = mongoose.model('User');

var async = require('async');

router.post('/confirmation/:token', function(req, res, next) {

  async.auto({
    confirmation: function(next) {
      Confirmation.findOne({token: req.params.token}, next);
    },

    user: ['confirmation', function(next, results) {
      var confirmation = results.confirmation;
      User.findById(confirmation.user, next);
    }],

    updateUser: ['user', function(next, results) {
      var user = results.user;
      user.confirmed = true;
      user.save(next);
    }]
  }, function(err) {
    if (err) {
      return next(err);
    }

    res.json('okay');
  });
});

module.exports = router;
