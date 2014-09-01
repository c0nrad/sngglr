// __Dependencies__
var es = require('event-stream');
var crypto = require('crypto');
var BaucisError = require('baucis-error');

// __Private Module Members__
// A map that is used to create empty response body.
function empty (context, callback) { callback(null, '') }
// Map contexts back into documents.
function redoc (context, callback) { callback(null, context.doc) }
// Generate a respone Etag from a context.
function etag (response) {
  return es.map(function (context, callback) {
    var hash = crypto.createHash('md5');
    var etag = response.get('Etag');
    if (etag) return callback(null, context);
    hash.update(JSON.stringify(context.doc));
    response.set('Etag', '"' + hash.digest('hex') + '"');
    callback(null, context);
  });
}
// Generate a Last-Modified header
function lastModified (response, lastModifiedPath) {
  return es.map(function (context, callback) {
    if (!response.get('Last-Modified') && lastModifiedPath) {
      response.set('Last-Modified', context.doc.get(lastModifiedPath));
    }
    callback(null, context);
  });
}
// Build a reduce stream.
function reduce (accumulated, f) {
  return es.through(
    function (context) {
      accumulated = f(accumulated, context);
    },
    function () {
      this.emit('data', accumulated);
      this.emit('end');
    }
  );
}
// Count emissions.
function count () {
  return reduce(0, function (a, b) { return a + 1 });
}

// __Module Definition__
var decorator = module.exports = function (options, protect) {
  var baucis = require('..');
  var controller = this;

  // Create the basic stream.
  protect.finalize(function (request, response, next) {
    var count = 0;
    var documents = request.baucis.documents;
    var pipeline = request.baucis.send = protect.pipeline(function (error) {
      if (error.message === 'bad hint') {
        next(BaucisError.BadRequest('The requested query hint is invalid'));
        return;
      }
      next(error);
    });
    // If documents were set in the baucis hash, use them.
    if (documents) pipeline(es.readArray([].concat(documents)));
    // Otherwise, stream the relevant documents from Mongo, based on constructed query.
    else pipeline(request.baucis.query.stream());
    // Map documents to contexts.
    pipeline(function (doc, callback) {
      callback(null, { doc: doc, incoming: null });
    });
    // Check for not found.
    pipeline(es.through(
      function (context) {
        count += 1;
        this.emit('data', context);
      },
      function () {
        if (count > 0) return this.emit('end');
        this.emit('error', BaucisError.NotFound());
      }
    ));
    // Apply user streams. 
    pipeline(request.baucis.outgoing());
    // Set the document formatter based on the Accept header of the request.
    baucis.formatters(response, function (error, formatter) {
      if (error) return next(error);
      request.baucis.formatter = formatter;
      next();
    });
  });

  // HEAD
  protect.finalize('instance', 'head', function (request, response, next) {
    var modified = controller.model().lastModified();
    if (modified) request.baucis.send(lastModified(response, modified));
    request.baucis.send(etag(response));
    request.baucis.send(empty);
    next();
  });

  protect.finalize('collection', 'head', function (request, response, next) {
    request.baucis.send(empty);
    next();
  });

  // GET
  protect.finalize('instance', 'get', function (request, response, next) {
    var modified = controller.model().lastModified();
    if (modified) request.baucis.send(lastModified(response, modified));
    request.baucis.send(etag(response));
    request.baucis.send(redoc);
    request.baucis.send(request.baucis.formatter());
    next();
  });

  protect.finalize('collection', 'get', function (request, response, next) {
    if (request.baucis.count) {
      request.baucis.send(count());
      request.baucis.send(es.stringify());
    }
    else {
      request.baucis.send(redoc);
      request.baucis.send(request.baucis.formatter(true));
    }
    next();
  });

  // POST
  protect.finalize('collection', 'post', function (request, response, next) {
    request.baucis.send(redoc);
    request.baucis.send(request.baucis.formatter());
    next();
  });

  // PUT
  protect.finalize('put', function (request, response, next) {
    request.baucis.send(redoc);
    request.baucis.send(request.baucis.formatter());
    next();
  });

  // DELETE
  protect.finalize('delete', function (request, response, next) {
    // Remove each document from the database.
    request.baucis.send(function (context, callback) { context.doc.remove(callback) });
    // Respond with the count of deleted documents.
    request.baucis.send(count());
    request.baucis.send(es.stringify());
    next();
  });

  protect.finalize(function (request, response, next) {
    request.baucis.send().pipe(response);
  });
};
