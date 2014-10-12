'use strict';

var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Picture = mongoose.model('Picture');
var async = require('async');

var fs = require('fs');
var crypto = require('crypto');

router.post('/users?/:user/pictures/upload', function (req, res) {
  var file = req.files.file;

  crypto.randomBytes(48, function(ex, buf) {
    var name = __dirname + '/../public/img/pictures/' + buf.toString('hex');

    fs.renameSync(file.path, name);
    res.send('/img/pictures/' + buf.toString('hex'));
  });
});

router.post('/users?/:user/pictures', function (req, res, next) {
  if (!req.user) {
    return next(401);
  }

  if (req.body.url === undefined || req.body.url.length === 0) {
    return next('url field required');
  }

  async.auto({
    maxIndex: function(next) {
      Picture.find({user: req.user._id}, 'z').sort({z: -1}).limit(1).exec(next);
    },

    picture: ['maxIndex', function(next, results) {
      console.log(results);
      var z = 1;
      if (results.maxIndex.length) {
        z = results.maxIndex[0].z;
      }
      var picture = new Picture({url: req.body.url, z: z+2, user: req.user._id});
      picture.save(next);
    }],
  }, function(err, results) {
    if (err) {
      return next(err);
    }

    return res.json(results.picture[0]);
  });
});

router.get('/users?/:user/pictures', function(req, res, next) {
  if (!req.user) {
    return next(401);
  }

  Picture.find({user: req.params.user}).sort({z: -1}).exec(function(err, pictures) {
    if (err) {
      return next(err);
    }

    return res.json(pictures);
  });
});

router.delete('/users?/:user/pictures/:id', function(req, res, next) {
  if (!req.user) {
    return next(401);
  }

  Picture.find({ _id: req.params.id, user: req.user._id}).remove(function(err, results) {
    if (err) {
      return next(err);
    }

    return res.json(results);
  });
});

router.put('/users?/:user/pictures/:id/first', function(req, res, next) {
  if (!req.user) {
    return next(401);
  }

  async.auto({

    maxIndex: function(next) {
      Picture.find({user: req.user._id}, 'z').sort({z:1}).limit(1).exec(next);
    },

    first: ['maxIndex', function(next, results) {
      console.log(results);
      var z = results.maxIndex[0].z || 1;
      Picture.findByIdAndUpdate(req.params.id, {z: z+2}).exec(next);
    }]
  }, function(err, results) {
    if (err) {
      return next(err);
    }

    res.json(results);
  });
});

module.exports = router;
