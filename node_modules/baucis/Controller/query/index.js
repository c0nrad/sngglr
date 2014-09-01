// __Dependencies__
var deco = require('deco');

// __Module Definition__
var middleware = module.exports = deco(__dirname, [
  // __Query-Stage Middleware__
  'create',
  'update',
  'build',
  'options',
  'links'
]);
