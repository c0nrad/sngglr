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

var secrets = {
  hostname: process.env.HOSTNAME
};

router.post('/', function (req, res, next) {
  logger.info('Creating new user:', req.body.name, req.body.email);

  var u = _.pick(req.body, 'email', 'name', 'password');

  if (!u.password) {
    return next('You need a password!');
  }

  if (!u.name) {
    return next('You need a name!');
  }

  if (!u.email) {
    return next('You need an email!');
  }

  if (u.email.split('@').length === 1) {
    return next('not a valid email!');
  }

  var emailDomain = u.email.split('@')[1];
  var validDomains = process.env.EMAIL_DOMAINS.split(',');
  if (!_.any(_.map(validDomains, function(a) { return a === emailDomain; }))) {
    return next('email must be belong to one of: ' + validDomains.join(', '));
  }

  async.auto({
    checkPrevious: function(next) {
      User.findOne({email: u.email}).exec(function(err, user) {
        if (err) {
          return next(err);
        }

        if (user) {
          return next('Email already in use!');
        }

        next();
      });
    },

    user: ['checkPrevious', function(next) {
      var newUser = new User(u);
      newUser.provider = 'local';
      newUser.save(next);
    }],

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

      var body = 'Howdy!\n\n' +
      'Welcome to Sngglr! To get started please click the following link to confirm your email!\n' +
      'http://' + secrets.hostname + '/#/confirmation/' + token + '\n\n' +
      'Happy Snuggling!\n' +
      'Sngglr Team';

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
    return next(401);
  }

  var updatedFields = _.pick(req.body, 'gender', 'looking', 'standing', 'bio', 'activity', 'notifications', 'phone');
  _.extend(req.user, updatedFields);

  req.user.save(function(err, user) {
    if(err) {
      return res.json(400,err);
    }

    req.user = user;
    return res.json(req.user.toJSON());
  });
});

router.get('/me', function(req, res, next) {
  if (!req.user) {
    return res.send({});
  }

  var me = req.user.toJSON();

  async.auto({
    unseenMatches: function(next) {
      Match.find({'users' : {$elemMatch: {user: me._id}}}, function(err, matches) {

        async.map(matches, function(match, next) {
          for (var u = 0; u < match.users.length; ++u) {
              var user = match.users[u];
              if (user.user.equals(me._id) && !user.seen) {
                return next(null, 1);
              }
          }

          Chat.find({match: match._id, 'to.user': me._id, 'to.seen': false}).count().exec(next);
        }, function (err, results) {
          var count = _.reduce(results, function(a,b) {return a + b;}, 0);
          next(err, count);
        });
      });
    },

    pictures: function(next) {
      Picture.find({user: me._id}).sort({z: -1}).limit(1).exec(next);
    }
  }, function(err, results) {
    if (err) {
      return next(err);
    }

    if (results.pictures.length) {
      me.picture = results.pictures[0].url;
    }
    me.unseenMatches = results.unseenMatches;
    res.json(me);
  });
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
