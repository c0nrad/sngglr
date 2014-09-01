// __Dependencies__
var util = require('util');
var semver = require('semver');
var BaucisError = require('baucis-error');

// __Module Definition__
var plugin = module.exports = function () {
  var api = this;
  var controllers = [];

  // __Public Instance Members__
  // Add a controller to the API.
  api.add = function (controller) {
    controllers.push(controller);
    return api;
  };
  // Find the correct controller to handle the request.  
  api.middleware.use('/:path', function (request, response, next) {
    var found = false;
    var fragment = '/' + request.params.path;
    // Requested range is used to select highest possible release number.
    // Then later controllers are checked for matching the release number.
    var range = request.headers['api-version'] || '*';
    // Check the requested API version is valid.
    if (!semver.validRange(range)) {
      next(BaucisError.BadRequest('The requested API version range "%s" was not a valid semver range', range));
      return;
    }
    var release = semver.maxSatisfying(api.releases(), range);
    // Check for API version unsatisfied and give a 400 if no versions match.
    if (!release) {
      next(BaucisError.BadRequest('The requested API version range "%s" could not be satisfied', range));
      return;
    }
    // Set API-related headers
    response.set('API-Version', release);
    response.set('Vary', 'API-Version');
    // Filter to only controllers that match the requested release.
    var filteredControllers = controllers.filter(function (controller) {
      return semver.satisfies(release, controller.versions());
    });
    // Find the matching controller among controllers that match the requested release.
    filteredControllers.forEach(function (controller) {
      if (found) return;
      if (fragment !== controller.fragment()) return; 
      // Path and version match.
      found = true;
      request.baucis.controller = controller;
      controller(request, response, next);
    });
    if (!found) return next();
  });
};
