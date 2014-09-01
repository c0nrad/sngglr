var BaucisError = require('baucis-error');

// __Module Definition__
var decorator = module.exports = function () {
  var controller = this;
  // Set the conditions used for finding/updating/removing documents.
  this.request(function (request, response, next) {
    var conditions = request.query.conditions || {};

    if (typeof conditions === 'string') {
      try {
        conditions = JSON.parse(conditions);
      }
      catch (exception) {
        next(BaucisError.BadRequest('The conditions query string value was not valid JSON: "%s"', exception.message));
        return;
      }
    }
    if (request.params.id !== undefined) {
      conditions[controller.findBy()] = request.params.id;
    }

    request.baucis.conditions = conditions;
    next();
  });
};
