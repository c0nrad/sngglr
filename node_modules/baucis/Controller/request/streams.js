// __Dependencies__
var es = require('event-stream');
var domain = require('domain');

// __Module Definition__
var decorator = module.exports = function (options, protect) {
  // __Protected Module Members__
  // A utility method for ordering through streams.
  protect.pipeline = function (handler) {
    var streams = [];
    var d = domain.create();
    d.on('error', handler);
    return function (transmute) {
      // If it's a stream, add it to the reserve pipeline.
      if (transmute && (transmute.writable || transmute.readable)) {
        streams.push(transmute);
        d.add(transmute);
        return transmute;
      }
      // If it's a function, create a map stream with it.
      if (transmute) {
        transmute = es.map(transmute);
        streams.push(transmute);
        d.add(transmute);
        return transmute;
      }
      // If called without arguments, return a pipeline linking all streams.
      if (streams.length > 0) return es.pipeline.apply(es, streams);
      // But, if no streams were added, just pass back a through stream.
      return es.through();
    };
  };
  // __Middleware__
  // Create the pipeline interface the user interacts with.
  this.request(function (request, response, next) {
    request.baucis.incoming = protect.pipeline(next);
    request.baucis.outgoing = protect.pipeline(next);
    next();
  });
};
