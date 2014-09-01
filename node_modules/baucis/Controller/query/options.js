// __Dependencies__
var BaucisError = require('baucis-error');

// __Private Methods__
function isDefinedAndNotNull (n) {
  if (n === null) return false;
  if (n === undefined) return false;
  return true;
}

function isPositiveInteger (n) {
  if (!isDefinedAndNotNull(n)) return false;
  n = Number(n);
  if (n < 1) return false;
  return n === Math.ceil(n);
}

function isNonNegativeInteger (n) {
  if (!isDefinedAndNotNull(n)) return false;
  n = Number(n);
  if (n < 0) return false;
  return n === Math.ceil(n);
}

// __Module Definition__
var decorator = module.exports = function () {
  var controller = this;

  function checkBadSelection (select) {
    var bad = false;
    controller.deselected().forEach(function (path) {
      var badPath = new RegExp('[+]?' + path + '\\b', 'i');
      if (badPath.exec(select)) bad = true;
    });
    return bad;
  }

  // Perform distinct query.
  this.query(function (request, response, next) {
    var distinct = request.query.distinct;
    if (!distinct) return next();
    if (controller.deselected(distinct)) {
      next(BaucisError.Forbidden('You may not find distinct values for the requested path'));
      return;
    }
    var query = controller.model().distinct(distinct, request.baucis.conditions);
    query.exec(function (error, values) {
      if (error) return next(error);
      request.baucis.documents = values;
      next();
    });
  });
  // Apply incoming request sort.
  this.query(function (request, response, next) {
    var sort = request.query.sort;
    if (sort) request.baucis.query.sort(sort);
    next();
  });
  // Apply controller select options to the query.
  this.query(function (request, response, next) {
    var select = controller.select();
    if (select) request.baucis.query.select(select);
    next();
  });
  // Apply incoming request select to the query.
  this.query(function (request, response, next) {
    var select = request.query.select;
    if (!select) return next();

    if (select.indexOf('+') !== -1) {
      return next(BaucisError.Forbidden('Including excluded fields is not permitted'));
    }
    if (checkBadSelection(select)) {
      return next(BaucisError.Forbidden('Including excluded fields is not permitted'));
    }

    request.baucis.query.select(select);
    next();
  });
  // Apply incoming request populate.
  this.query(function (request, response, next) {
    var populate = request.query.populate;
    var error = null;

    if (populate) {
      if (typeof populate === 'string') {
        if (populate.indexOf('{') !== -1) populate = JSON.parse(populate);
        else if (populate.indexOf('[') !== -1) populate = JSON.parse(populate);
      }

      if (!Array.isArray(populate)) populate = [ populate ];

      populate.forEach(function (field) {
        if (error) return;
        if (checkBadSelection(field.path || field)) {
          return error = BaucisError.Forbidden('Including excluded fields is not permitted');
        }
        // Don't allow selecting fields from client when populating
        if (field.select) {
          return error = BaucisError.Forbidden('Selecting fields of populated documents is not permitted');
        }

        request.baucis.query.populate(field);
      });
    }

    next(error);
  });
  // Apply incoming request skip.
  this.query(function (request, response, next) {
    var skip = request.query.skip;
    if (skip === undefined || skip === null) return next();
    if (!isNonNegativeInteger(skip)) {
      return next(BaucisError.BadRequest('Skip must be a non-negative integer if set'));
    }
    request.baucis.query.skip(skip);
    next();
  });
  // Apply incoming request limit.
  this.query(function (request, response, next) {
    var limit = request.query.limit;
    if (limit === undefined || limit === null) return next();
    if (!isPositiveInteger(limit)) {
      return next(BaucisError.BadRequest('Limit must be a positive integer if set'));
    }
    request.baucis.query.limit(limit);
    next();
  });
  // Set count flag.
  this.query(function (request, response, next) {
    if (!request.query.count) return next();
    if (request.query.count === 'false') return next();
    if (request.query.count !== 'true') {
      return next(BaucisError.BadRequest('Count must be "true" or "false" if set'));
    }

    request.baucis.count = true;
    next();
  });
  // Check for query comment.
  this.query(function (request, response, next) {
    var comment = request.query.comment;
    if (!comment) return next();
    if (controller.comments()) request.baucis.query.comment(comment);
    else console.warn('Query comment was ignored.');
    next();
  });
  // Check for query hint.
  this.query(function (request, response, next) {
    var hint = request.query.hint;

    if (!hint) return next();
    if (!controller.hints()) {
      return next(BaucisError.Forbidden('Hints are not enabled for this resource'));
    }

    if (typeof hint === 'string') hint = JSON.parse(hint);
    // Convert the value for each path from stirng to number.
    Object.keys(hint).forEach(function (path) {
      hint[path] = Number(hint[path]);
    });
    request.baucis.query.hint(hint);

    next();
  });
};
