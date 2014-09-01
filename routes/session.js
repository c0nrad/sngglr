'use strict';

var passport = require('passport');
var logger = require('../logger');
var express = require('express');
var router = express.Router();

router.delete('/logout', function (req, res) {
  req.logout();
  res.send(200);
});

router.post('/login', function (req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    logger.info(err, user, info);
    var error = err || info;
    if (error) {
      return res.json(401, error);
    }

    req.logIn(user, function(err) {

      if (err) {
        return res.send(err);
      }
      res.json(req.user.toJSON());
    });
  })(req, res, next);
});

module.exports = router;
