var util = require('util');
var mongoose = require('mongoose');
var BaucisError = require('./definitions');

var plugin = module.exports = function (options, protect) {
  var controller = this;
  // A controller property used to set what error status code
  // and response is sent when a query to a collection endpoint
  // yields no documents.
  protect.property('emptyCollection', 200);
  // A controller property that sets whether errors should be
  // handled if possible, or just set status code.
  protect.property('handleErrors', true, function (handle) {
    return handle ? true : false;
  });
  // Handle mongo validation and unprocessable entity errors.
  protect.use(function (error, request, response, next) {
    if (!error) return next();
    // Validation errors.
    if (!((error instanceof mongoose.Error.ValidationError) || (error instanceof BaucisError.UnprocessableEntity))) {
      next(error);
      return;
    }
    
    response.status(422);
    if (!controller.handleErrors()) return next(error);
    if (Array.isArray(error.errors)) return response.json(error.errors);
    response.json(Object.keys(error.errors).map(function (key) { return error.errors[key] }));
  });
  // Handle mongo duplicate key error.
  protect.use(function (error, request, response, next) {
    if (!error) return next();
    if (error.message.indexOf('E11000 duplicate key error') === -1) {
      next(error);
      return;
    }

    var body = {};
    var scrape = /[$](.+)[_]\d+\s+dup key: [{] : "([^"]+)" [}]/;
    var scraped = scrape.exec(error.message);
    var path = scraped ? scraped[1] : '???';
    var value = scraped ? scraped[2] : '???';
    body[path] = {
      message: util.format('Path `%s` (%s) must be unique.', path, value),
      originalMessage: error.message,
      name: 'MongoError',
      path: path,
      type: 'unique',
      value: value
    };

    response.status(422);
    if (controller.handleErrors()) return response.json(body);
    next(error);
  });
  // Handle not found.
  protect.use('/:id?', function (error, request, response, next) {
    if (!error) return next();
    // Handle 404
    if (!(error instanceof BaucisError.NotFound)) return next(error);

    response.status(error.status);
    if (!controller.handleErrors()) return next(error);
    if (request.params.id) return next(error);
    if (error.parentController === true) return next(error);
    response.status(controller.emptyCollection());
    if (controller.emptyCollection() === 200) return response.json([]);
    if (controller.emptyCollection() === 204) return response.send();
    next(error);
  });
  // Set response status code for all baucis errors.
  protect.use(function (error, request, response, next) {
    if (!error) return next();
    // Just set the status code for these errors.
    if (!(error instanceof BaucisError)) return next(error);
    response.status(error.status);
    next(error);
  });
  // Handle mongoose version conflict error.
  protect.use(function (error, request, response, next) {
    if (!error) return next();
    if (!(error instanceof mongoose.Error.VersionError)) {
      next(error);
      return;
    }
    response.status(409);
    next(error);
  });
};