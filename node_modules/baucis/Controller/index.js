// __Dependencies__
var deco = require('deco');
var express = require('express');
var BaucisError = require('baucis-error');

// __Module Definition__
var Controller = module.exports = deco();

Controller.factory(express.Router);
Controller.decorators(__dirname, [
  'configure',
  'stages',
  'activation',
  'request',
  'query',
  'send'
]);
Controller.decorators(BaucisError.handler);
