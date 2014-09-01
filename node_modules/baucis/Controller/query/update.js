// __Dependencies__
var express = require('express');
var util = require('util');
var es = require('event-stream');
var BaucisError = require('baucis-error');

// __Private Module Members__
var validOperators = [ '$set', '$push', '$pull' ];

// __Module Definition__
var decorator = module.exports = function (options, protect) {
  var baucis = require('../..');
  var controller = this;

  function checkBadUpdateOperatorPaths (operator, paths) {
    var bad = false;
    var whitelisted = controller.operators(operator);
    var parts;

    if (!whitelisted) return true;

    parts = whitelisted.split(/\s+/);

    paths.forEach(function (path) {
      if (parts.indexOf(path) !== -1) return;
      bad = true;
    });

    return bad;
  }

  // If there's a body, send it through any user-added streams.
  controller.query('instance', 'put', function (request, response, next) {
    var parser;
    var count = 0;
    var operator = request.headers['update-operator'];
    var versionKey = controller.model().schema.get('versionKey');
    var pipeline = protect.pipeline(next);
    // Check if the body was parsed by some external middleware e.g. `express.json`.
    // If so, create a one-document stream from the parsed body.
    if (request.body) {
      pipeline(es.readArray([ request.body ]));
    }
    // Otherwise, stream and parse the request.
    else {
      parser = baucis.parser(request.get('content-type'));
      if (!parser) return next(BaucisError.UnsupportedMediaType());
      pipeline(request);
      pipeline(parser);
    }
    // Set up the stream context.
    pipeline(function (body, callback) {
      var context = { doc: undefined, incoming: body };
      callback(null, context);
    });
    // Load the Mongoose document and add it to the context, unless this is a
    // special update operator.
    if (!operator) {
      pipeline(function (context, callback) {
        var query = controller.model().findOne(request.baucis.conditions);
        query.exec(function (error, doc) {
          if (error) return callback(error);
          if (!doc) return callback(BaucisError.NotFound());
          // Add the Mongoose document to the context.
          callback(null, { doc: doc, incoming: context.incoming });
        });
      });
    }
    // Pipe through user streams, if any.
    pipeline(request.baucis.incoming());
    // If the document ID is present, ensure it matches the ID in the URL.
    pipeline(function (context, callback) {
      var bodyId = context.incoming[controller.findBy()];
      if (bodyId === undefined) return callback(null, context);
      if (bodyId === request.params.id) return callback(null, context);
      callback(BaucisError.UnprocessableEntity({
        message: "The ID of the update document did not match the URL's document ID.",
        name: 'BaucisError',
        path: controller.findBy(),
        value: bodyId
      }));
    });
    // Ensure the request includes a finite object version if locking is enabled.
    if (controller.model().locking()) {
      pipeline(function (context, callback) {
        var updateVersion = context.incoming[versionKey];
        if (updateVersion === undefined || !Number.isFinite(Number(updateVersion))) {
          callback(BaucisError.UnprocessableEntity({
            message: 'Locking is enabled, but the target version was not provided in the request body.',
            name: 'BaucisError',
            path: versionKey
          }));
          return;
        }
        callback(null, context);
      });
      // Add some locking checks only applicable to the default update operator.
      if (!operator) {
        // Make sure the version key was selected.
        pipeline(function (context, callback) {
          if (!context.doc.isSelected(versionKey)) {
            callback(BaucisError.BadRequest('The version key "%s" must be selected', versionKey));
            return;
          }
          // Pass through.
          callback(null, context);
        });
        pipeline(function (context, callback) {
          var updateVersion = Number(context.incoming[versionKey]);
          // Update and current version have been found.  Check if they're equal.
          if (updateVersion !== context.doc[versionKey]) return callback(BaucisError.LockConflict());
          // One is not allowed to set __v and increment in the same update.
          delete context.incoming[versionKey];
          context.doc.increment();
          // Pass through.
          callback(null, context);
        });
      }
    }
    // Ensure there is exactly one update document.
    pipeline(es.through(
      function (context) {
        count += 1;
        if (count === 2) {
          this.emit('error', BaucisError.UnprocessableEntity({
            message: 'The request body contained more than one update document',
            name: 'BaucisError'
          }));
          return;
        }
        if (count > 1) return;

        this.emit('data', context);
      },
      function () {
        if (count === 0) {
          this.emit('error', BaucisError.UnprocessableEntity({
            message: 'The request body did not contain an update document',
            name: 'BaucisError'
          }));
          return;
        }
        this.emit('end');
      }
    ));
    // Finish up for the default update operator.
    if (!operator) {
      // Update the Mongoose document with the request body.
      pipeline(function (context, callback) {
        context.doc.set(context.incoming);
        // Pass through.
        callback(null, context);
      });
      // Save the Mongoose document.
      pipeline(function (context, callback) { context.doc.save(callback); });
    }
    // Finish up for a non-default update operator (bypasses validation).
    else {
      pipeline(function (context, callback) {
        var wrapper = {};

        if (validOperators.indexOf(operator) === -1) {
          callback(BaucisError.NotImplemented('The requested update operator "%s" is not supported', operator));
          return;
        }
        // Ensure that some paths have been enabled for the operator.
        if (!controller.operators(operator)) {
          callback(BaucisError.Forbidden('The requested update operator "%s" is not enabled for this resource', operator));
          return;
        }
        // Make sure paths have been whitelisted for this operator.
        if (checkBadUpdateOperatorPaths(operator, Object.keys(context.incoming))) {
          callback(BaucisError.Forbidden('This update path is forbidden for the requested update operator "%s"', operator));
          return;
        }

        wrapper[operator] = context.incoming;
        if (controller.model().locking()) {
          request.baucis.conditions[versionKey] = Number(context.incoming[versionKey]);
        }
        // Update the doc using the supplied operator and bypassing validation.
        controller.model().update(request.baucis.conditions, wrapper, callback);
      });
    }

    var s = pipeline();
    s.on('end', next);
    s.resume();
  });
};
