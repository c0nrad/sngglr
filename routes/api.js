'use strict';

var express = require('express');
var router = express.Router();

//var matchController = baucis.rest('Match');
//var chatController  = baucis.rest('Chat');

var userRoutes = require('./users');
var likeRoutes = require('./likes');
var pictureRoutes = require('./pictures');
var playRoutes = require('./play');
var sessionRoutes = require('./session');
var matchRoutes = require('./matches');
var resetRoutes = require('./reset');

router.use('/api/users?', userRoutes);
router.use('/api/users?/:person', pictureRoutes);
router.use('/api/users?/:person', likeRoutes);
router.use('/api', matchRoutes);
router.use('/api', playRoutes);
router.use('/api', sessionRoutes);
router.use('/api', resetRoutes);

// login / logout
// /api/login
// /api/logout
module.exports = router;
