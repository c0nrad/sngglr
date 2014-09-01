'use strict';

var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Picture = mongoose.model('Picture');

var async = require('async');

router.post('/pictures', function (req, res, next) {
  if (!req.user) {
    return next(401);
  }

  if (req.body.url === undefined || req.body.url.length === 0) {
    return next('url field required');
  }

  async.auto({
    maxIndex: function(next) {
      Picture.find({user: req.user._id}, 'z').sort({z: 1}).limit(1).exec(next);
    },

    picture: ['maxIndex', function(next, results) {
      var z = results.maxIndex.z || 1;
      var picture = new Picture({url: req.body.url, z: z, user: req.user._id});
      picture.save(next);
    }],
  }, function(err, results) {
    if (err) {
      return next(err);
    }

    return res.json(results.picture[0]);
  });
});

router.get('/pictures', function(req, res, next) {
  if (!req.user) {
    return next(401);
  }

  Picture.find({user: req.user._id}).sort({z: 1}).exec(function(err, pictures) {
    if (err) {
      return next(err);
    }

    return res.json(pictures);
  });
});

router.delete('/pictures/:id', function(req, res, next) {
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

router.put('/pictures/:id/first', function(req, res, next) {
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
      Picture.findByIdAndUpdate(req.params.id, {z: z+1}).exec(next);
    }]
  }, function(err, results) {
    if (err) {
      return next(err);
    }

    res.json(results);
  });
});

module.exports = router;
