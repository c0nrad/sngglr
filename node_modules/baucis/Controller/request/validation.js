// __Dependencies__
var util = require('util');
var BaucisError = require('baucis-error');

// __Module Definition__
var decorator = module.exports = function (options, protect) {
  var controller = this;
  var check = ['ObjectID', 'Number'];

  protect.isInvalid = function (id, instance, type) {
    var error;
    if (!id) return false;
    if (check.indexOf(instance) === -1) return false;
    if (instance === 'ObjectID' && id.match(/^[a-f0-9]{24}$/i)) return false;
    if (instance === 'Number' && !isNaN(Number(id))) return false;
    return true;
  };

  // Validate URL's ID parameter, if any.
  controller.request(function (request, response, next) {
    var id = request.params.id;
    var instance = controller.model().schema.path(controller.findBy()).instance;
    var invalid = protect.isInvalid(request.params.id, instance, 'url.id');
    if (!invalid) return next();
    next(BaucisError.BadRequest('The requested document ID "%s" is not a valid document ID', id));
  });

  // Check that the HTTP method has not been disabled for this controller.
  controller.request(function (request, response, next) {
    var method = request.method.toLowerCase();
    if (controller.methods(method) !== false) return next();
    next(BaucisError.MethodNotAllowed('The requested method has been disabled for this resource'));
  });

  // Treat the addressed document as a collection, and push the addressed object
  // to it.  (Not implemented.)
  controller.request('instance', 'post', function (request, response, next) {
    return next(BaucisError.NotImplemented('Cannot POST to an instance'));
  });

  // Update all given docs.  (Not implemented.)
  controller.request('collection', 'put', function (request, response, next) {
    return next(BaucisError.NotImplemented('Cannot PUT to the collection'));
  });
};
