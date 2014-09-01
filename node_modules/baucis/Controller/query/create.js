// __Dependencies__
var es = require('event-stream');
var util = require('util');
var domain = require('domain');
var BaucisError = require('baucis-error');

// __Module Definition__
var decorator = module.exports = function (options, protect) {
  var baucis = require('../..');
  var controller = this;

  controller.query('post', function (request, response, next) {
    var url = request.originalUrl || request.url;
    var findBy = controller.findBy();
    var pipeline = protect.pipeline(next);
    var parser;
    // Add trailing slash to URL if needed.
    if (url.lastIndexOf('/') === (url.length - 1)) url = url.slice(0, url.length - 1);
    // Set the status to 201 (Created).
    response.status(201);
    // Check if the body was parsed by some external middleware e.g. `express.json`.
    // If so, create a stream from the POST'd document or documents.
    if (request.body) {
      pipeline(es.readArray([].concat(request.body)));
    }
    // Otherwise, stream and parse the request.
    else {
      parser = baucis.parser(request.get('content-type'));
      if (!parser) return next(BaucisError.UnsupportedMediaType());
      pipeline(request);
      pipeline(parser);
    }
    // Create the stream context.
    pipeline(function (incoming, callback) {
      callback(null, { incoming: incoming, doc: null });
    });
    // Process the incoming document or documents.
    pipeline(request.baucis.incoming());
    // Map function to create a document from incoming JSON and update the context.
    pipeline(function (context, callback) {
      var transformed = { incoming: context.incoming };
      var Model = controller.model();
      var type = context.incoming.__t;
      var Discriminator = type ? Model.discriminators[type] : undefined;
      if (type && !Discriminator) {
        callback(BaucisError.UnprocessableEntity({
          message: "A document's type did not match any known discriminators for this resource",
          name: 'BaucisError',
          path: '__t',
          value: type
        }));
        return;
      }
      // Create the document using either the model or child model.
      if (type) transformed.doc = new Discriminator();
      else transformed.doc = new Model();
      // Transformation complete.
      callback(null, transformed);
    });
    // Update the new Mongoose document with the incoming data.
    pipeline(function (context, callback) {
      context.doc.set(context.incoming);
      callback(null, context);
    });
    // Save each document.
    pipeline(function (context, callback) {
      context.doc.save(function (error, doc) {
        if (error) return callback(error);
        callback(null, { incoming: context.incoming, doc: doc });
      });
    });
    // Map the saved documents to document IDs.
    pipeline(function (context, callback) {
      callback(null, context.doc.get(findBy));
    });
    // Write the IDs to an array and process them.
    var s = pipeline();
    s.pipe(es.writeArray(function (error, ids) {
      if (error) return next(error);
      // URL location of newly created document or documents.
      var location;
      // Set the conditions used to build `request.baucis.query`.
      var conditions = request.baucis.conditions[findBy] = { $in: ids };
      // Check for at least one document.
      if (ids.length === 0) {
        next(BaucisError.UnprocessableEntity({
          message: 'The request body must contain at least one document',
          name: 'BaucisError'
        }));
        return;
      }
      // Set the `Location` header if at least one document was sent.
      if (ids.length === 1) location = url + '/' + ids[0];
      else location = util.format('%s?conditions={ "%s": %s }', url, findBy, JSON.stringify(conditions));
      response.set('Location', location);
      next();
    }));
    s.resume();
  });
};
