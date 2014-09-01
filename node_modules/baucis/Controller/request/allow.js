// __Module Definition__
var decorator = module.exports = function () {
  var controller = this;
  // Build the "Allow" response header
  controller.request(function (request, response, next) {
    var active = ['head', 'get', 'post', 'put', 'delete'].filter(function (method) {
      return controller.methods(method) !== false;
    });
    var allowed = active.map(function (verb) {
      return verb.toUpperCase();
    });
    response.set('Allow', allowed.join());
    next();
  });
};
