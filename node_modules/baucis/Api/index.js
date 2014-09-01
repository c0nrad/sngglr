// __Dependencies__
var deco = require('deco');
var semver = require('semver');
var express = require('express');
var Controller = require('../Controller');
var BaucisError = require('baucis-error');

// __Module Definition__
var Api = module.exports = deco(function (options, protect) {
  var api = this;

  var middleware = api.middleware = express.Router();

  api.use(function (request, response, next) {
    if (request.baucis) return next(BaucisError.Misconfigured('Baucis request property already created'));
    request.baucis = {};
    response.removeHeader('x-powered-by');
    next();
  });

  api.use(middleware);
  
  // __Public Members___
  protect.property('releases', [ '0.0.1' ], function (release) {
    if (!semver.valid(release)) {
      throw BaucisError.Misconfigured('Release version "%s" is not a valid semver version', release);
    }
    return this.releases().concat(release);
  });

  api.rest = function (model) {
    var controller = Controller(model);
    api.add(controller);
    return controller;
  };
});

Api.factory(express.Router);
Api.decorators(__dirname, ['controllers']);
