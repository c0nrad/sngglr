'use strict';

var express = require('express');
var router = express.Router();

var notifications = require('./notifications');

var email = process.env.gmailEmail;

router.post('/report', function(req, res) {
  var report = {
    user: req.user,
    ip: req.ip,
    body: req.body,
    params: req.params
  };

  notifications.email(email, 'report', JSON.stringify(report, null, '\t'), function(err) {
    console.log(err);
  });
  res.send('Thanks! <a href="http://sngglr.com"> Go Back </a> ');
});

module.exports = router;
