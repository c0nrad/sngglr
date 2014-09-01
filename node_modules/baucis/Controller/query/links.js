// __Dependencies__
var url = require('url');
var qs = require('querystring');
var deco = require('deco');

// __Module Definition__
var decorator = module.exports = function () {
  var controller = this;

  // Add "Link" header field, with some basic defaults
  controller.query('instance', '*', function (request, response, next) {
    if (controller.relations() === false) return next();

    var originalPath = request.originalUrl.split('?')[0];
    var originalPathParts = originalPath.split('/');
    var linkBase;

    originalPathParts.pop();
    linkBase = originalPathParts.join('/');

    response.links({
      collection: linkBase,
      search: linkBase,
      edit: linkBase + '/' + request.params.id,
      self: originalPath
    });

    next();
  });

  // Add "Link" header field, with some basic defaults (for collection routes)
  controller.query('collection', '*', function (request, response, next) {
    if (controller.relations() === false) return next();

    var originalPath = request.originalUrl.split('?')[0];
    // Used to create a link from current URL with new query string.
    var makeLink = function (query) {
      var newQuery = deco.merge(request.query, query);
      return originalPath + '?' + qs.stringify(newQuery);
    };
    // Response Link header links.
    var links = { search: originalPath, self: makeLink() };
    // Call this function to set response links then move on to next middleware.
    var done = function () { response.links(links), next() };

    // Add paging links unless these conditions are met.
    if (request.method !== 'GET') return done();
    if (!request.query.limit) return done();

    controller.model().count(request.baucis.conditions, function (error, count) {
      if (error) return next(error);

      var limit = Number(request.query.limit);
      var skip = Number(request.query.skip || 0);

      links.first = makeLink({ skip: 0 });
      links.last = makeLink({ skip: Math.max(0, count - limit) });

      if (skip) links.previous = makeLink({ skip: Math.max(0, skip - limit) });
      if (limit + skip < count) links.next = makeLink({ skip: limit + skip });

      done();
    });
  });
};
