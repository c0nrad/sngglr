'use strict';

var express = require('express');
var router = express.Router();

router.get('/config', function(req, res) {
  var out = {
    domains: process.env.EMAIL_DOMAINS.split(',')
  };

  res.json(out);
});

module.exports = router;
