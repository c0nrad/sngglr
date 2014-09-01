// __Dependencies__
var deco = require('deco');
var util = require('util');
// __Module Definition__
// Parent type for child baucis errors.
var BaucisError = module.exports = deco().inherit(Error);// __Private Module Members__
// Build a constructor function for a Baucis error, with a custom default message
// that can be overridden.
function buildConstructor (options) {
  var ChildError = deco(function (message) {
    this.status = options.status;
    this.name = options.name;
    // Format the formatted error message.
    this.message = util.format('%s (%s).', message, this.status);
  });

  ChildError.container(BaucisError).inherit(BaucisError);
  ChildError.sanitize(function () {
    // Use the given message (if any) and format it, or else use the default message.
    if (typeof arguments[0] === 'string') return util.format.apply(util, arguments);
    else return options.defaultMessage;
  });

  return ChildError;
};
// __Public Module Members__
BaucisError.BadRequest = buildConstructor({
  defaultMessage: 'Please fix this request and try again',
  status: 400,
  name: 'Bad Request'
});

BaucisError.Deprecated = buildConstructor({
  defaultMessage: 'One or more deprecated features were used in this request',
  status: 400,
  name: 'Bad Request'
});

BaucisError.BadSyntax = buildConstructor({
  defaultMessage: 'The body of this request was invalid and could not be parsed',
  status: 400,
  name: 'Bad Request'
});

BaucisError.Forbidden = buildConstructor({
  defaultMessage: 'This action is forbidden',
  status: 403,
  name: 'Forbidden'
});

BaucisError.NotFound = buildConstructor({
  defaultMessage: 'No document matched the requested query',
  status: 404,
  name: 'Not Found'
});

BaucisError.MethodNotAllowed = buildConstructor({
  defaultMessage: 'The requested HTTP method is not allowed for this resource',
  status: 405,
  name: 'Method Not Allowed'
});

BaucisError.NotAcceptable = buildConstructor({
  defaultMessage: 'The requested content type could not be provided',
  status: 406,
  name: 'Not Acceptable'
});

BaucisError.LockConflict = buildConstructor({
  defaultMessage: 'This update is for an outdated version of the document',
  status: 409,
  name: 'Conflict'
});

BaucisError.UnsupportedMediaType = buildConstructor({
  defaultMessage: "No parser is available for this request's content type",
  status: 415,
  name: 'Unsupported Media Type'
});

BaucisError.UnprocessableEntity = deco(function (error) {
  this.message = 'The request entity could not be processed (422).'
  this.status = 422;
  this.name = 'Unprocessable Entity';
  this.errors = [];
  this.errors.push(error);
});

BaucisError.UnprocessableEntity.container(BaucisError).inherit(BaucisError);
BaucisError.UnprocessableEntity.prototype.add = function (key, error) {
  this.errors.push(error);
  return this;
};

BaucisError.Misconfigured = buildConstructor({
  defaultMessage: 'Baucis is misconfigured',
  status: 500,
  name: 'Internal Server Error'
});

BaucisError.NotImplemented = buildConstructor({
  defaultMessage: 'The requested functionality is not implemented',
  status: 501,
  name: 'Not Implemented'
});
