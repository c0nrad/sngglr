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
var chatRoutes = require('./chats');
var resetRoutes = require('./reset');
var confirmationRoutes = require('./confirmations');
var s3 = require('./s3');

router.use('/api/users?', userRoutes);
router.use('/api/users?/:person', likeRoutes);

router.use('/api', pictureRoutes);

router.use('/api', chatRoutes);
router.use('/api', matchRoutes);
router.use('/api', playRoutes);
router.use('/api', sessionRoutes);
router.use('/api', resetRoutes);
router.use('/api', confirmationRoutes);

router.use('/', s3);

module.exports = router;
