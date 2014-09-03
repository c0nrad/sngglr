'use strict';

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Confirmation = mongoose.model('Confirmation');
var Picture = mongoose.model('Picture');
var Chat = mongoose.model('Chat');
var Like = mongoose.model('Like');
var Match = mongoose.model('Match');

var notifications = require('./notifications');

var async = require('async');
var _ = require('underscore');

var express = require('express');
var router = express.Router();

var logger = require('../logger');

router.post('/', function (req, res, next) {
  logger.info('Creating new user:', req.body.name, req.body.email);

  var u = _.pick(req.body, 'email', 'name', 'password');

  async.auto({
    user: function(next) {
      var newUser = new User(u);
      newUser.provider = 'local';
      newUser.save(next);
    },

    confirmation: ['user', function(next, results) {
      var user = results.user[0];

      var c = new Confirmation({ user: user._id });
      c.save(next);
    }],

    email: ['confirmation', function(next, results) {
      var user = results.user[0];
      var confirmation = results.confirmation[0];

      var to = user.email;
      var token = confirmation.token;

      var body = 'Howdy! \
      \
      Welcome to Sngglr! To get started please click the following link to confirm your email! \
      http://sngglr.com/#/confirmation/' + token + ' \
      \
      Happy Snuggling!\
      Sngglr Team';

      notifications.email(to, 'Sngglr: Confirm Email', body, next);
    }]

  }, function(err, results) {
    if (err) {
      return next(err);
    }

    req.login(results.user[0], function(err) {
      if (err) {
        return next(err);
      }

      res.send(req.user.toJSON());
    });
  });
});

router.put('/:id', function (req, res, next) {
  if (!req.user) {
    next(401);
  }

  var updatedFields = _.pick(req.body, 'gender', 'looking', 'bio', 'activity', 'notifications', 'phone');
  _.extend(req.user, updatedFields);

  req.user.save(function(err, user) {
    if(err) {
      return res.json(400,err);
    }

    req.user = user;
    return res.json(req.user.toJSON());
  });
});

router.get('/me', function(req, res) {
  if (req.user) {
    res.json(req.user.toJSON() || null);
  } else {
    res.json({});
  }
});

router.get('/:id', function (req, res, next) {
  var userId = req.params.id;

  User.findById(userId, function (err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.send(404);
    }

    res.send(user.toJSON());
  });
});

router.delete('/:id', function(req, res, next) {
  if (!req.user) {
    return next('you must be logged in');
  }

  async.auto({
    pictures: function(next) {
      Picture.find({user: req.user._id}).remove(next);
    },

    confirmation: function(next) {
      Confirmation.find({user: req.user._id}).remove(next);
    },

    chat: function(next) {
      Chat.find({ $or: [{'to.user': req.user._id}, {'from.user': req.user._id}]}).remove(next);
    },

    match: function(next) {
      Match.find({ $or: [{'users.1.user': req.user._id}, {'users.0.user': req.user._id}]}).remove(next);
    },

    like: function(next) {
      Like.find({ $or: [{'likeer.user': req.user._id}, {'likee.user': req.user._id}]}).remove(next);
    },

    user: function(next) {
      User.findById(req.user._id).remove(next);
    }
  }, function(err) {
    if (err) {
      console.log('ERROR DELETING USER', req.user, err);
      return next(err);
    }

    req.logout();
    res.send('okay');
  });
});

module.exports = router;
