'use strict';

var express = require('express');
var router = express.Router();

router.post('/report', function(req, res) {
  console.log(req.params, req.body);
  res.send('okay');
});

module.exports = router;
