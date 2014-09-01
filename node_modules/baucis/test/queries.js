var expect = require('expect.js');
var mongoose = require('mongoose');
var express = require('express');
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;
var request = require('request');
var baucis = require('..');
var parselinks = require('parse-links');

var fixtures = require('./fixtures');

describe('Queries', function () {
  before(fixtures.vegetable.init);
  beforeEach(fixtures.vegetable.create);
  after(fixtures.vegetable.deinit);

  it('should support skip 1', function (done) {
    var options = {
      url: 'http://localhost:8012/api/vegetables?skip=1',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);
      expect(body).to.have.property('length', vegetables.length - 1);
      done();
    });
  });

  it('should support skip 2', function (done) {
    var options = {
      url: 'http://localhost:8012/api/vegetables?skip=2',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);
      expect(body).to.have.property('length', vegetables.length - 2);
      done();
    });
  });

  it('should support limit 1', function (done) {
    var options = {
      url: 'http://localhost:8012/api/minerals?limit=1',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);
      expect(body).to.have.property('length', 1);
      done();
    });
  });

  it('should support limit 2', function (done) {
    var options = {
      url: 'http://localhost:8012/api/minerals?limit=2',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);
      expect(body).to.have.property('length', 2);
      done();
    });
  });

  it('should disallow selecting deselected fields', function (done) {
    var options = {
      url: 'http://localhost:8012/api/vegetables?select=species+lastModified',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(403);
      expect(body).to.be('Forbidden: Including excluded fields is not permitted (403).');
      done();
    });
  });

  it('should disallow populating deselected fields 1', function (done) {
    var options = {
      url: 'http://localhost:8012/api/vegetables?populate=species',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(403);
      expect(body).to.be('Forbidden: Including excluded fields is not permitted (403).');
      done();
    });
  });

  it('should disallow populating deselected fields 2', function (done) {
    var options = {
      url: 'http://localhost:8012/api/vegetables?populate={ "path": "species" }',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(403);
      expect(body).to.be('Forbidden: Including excluded fields is not permitted (403).');
      done();
    });
  });

  it('should support default express query parser when using populate', function (done) {
    var options = {
      url: 'http://localhost:8012/api/vegetables?populate[path]=species',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(403);
      expect(body).to.be('Forbidden: Including excluded fields is not permitted (403).');
      done();
    });
  });

  it('should disallow using +fields with populate', function (done) {
    var options = {
      url: 'http://localhost:8012/api/vegetables?populate={ "select": "%2Bboiler" }',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(403);
      expect(body).to.be('Forbidden: Selecting fields of populated documents is not permitted (403).');
      done();
    });
  });

  it('should disallow using +fields with select', function (done) {
    var options = {
      url: 'http://localhost:8012/api/vegetables?select=%2Bboiler',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(403);
      expect(body).to.be('Forbidden: Including excluded fields is not permitted (403).');
      done();
    });
  });

  it('should disallow selecting fields when populating', function (done) {
    var options = {
      url: 'http://localhost:8012/api/vegetables?populate={ "path": "a", "select": "arbitrary" }',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(403);
      expect(body).to.be('Forbidden: Selecting fields of populated documents is not permitted (403).');
      done();
    });
  });

  it('should not crash when disallowing selecting fields when populating', function (done) {
    var options = {
      url: 'http://localhost:8012/api/vegetables?populate=[{ "path": "a", "select": "arbitrary actuary" }, { "path": "b", "select": "arbitrary actuary" }]',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(403);
      expect(body).to.be('Forbidden: Selecting fields of populated documents is not permitted (403).');
      done();
    });
  });

  it('should disallow selecting fields when populating', function (done) {
    var options = {
      url: 'http://localhost:8012/api/vegetables?populate={ "path": "a", "select": "arbitrary" }',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(403);
      expect(body).to.be('Forbidden: Selecting fields of populated documents is not permitted (403).');
      done();
    });
  });

  it('should allow populating children', function (done) {
    var id = vegetables[0]._id;
    var options = {
      url: 'http://localhost:8012/api/vegetables/' + id + '/?populate=nutrients',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);
      expect(body).to.have.property('nutrients');
      expect(body.nutrients).to.have.property('length', 1);
      expect(body.nutrients[0]).to.have.property('color', 'Blue');
      done();
    });
  });

  it('should allow default express query string format', function(done) {
    var options = {
      url: 'http://localhost:8012/api/vegetables?conditions[name]=Radicchio',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);
      expect(body).to.have.property('length', 1);
      expect(body[0]).to.have.property('name', 'Radicchio')
      done();
    });
  });

  it('should allow selecting fields', function (done) {
    var options = {
      url: 'http://localhost:8012/api/vegetables?select=-_id lastModified',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);
      expect(body[0]).not.to.have.property('_id');
      expect(body[0]).not.to.have.property('name');
      expect(body[0]).to.have.property('lastModified');
      done();
    });
  });

    it  ('should allow deselecting hyphenated field names', function (done) {
    var options = {
      url: 'http://localhost:8012/api/vegetables?select=-hyphenated-field-name',
      json: true
    };
    request.get(options, function (err, response, body) {
      if (err) return done(err);
      expect(response.statusCode).to.be(200);
      expect(body[0]).to.have.property('_id');
      expect(body[0]).to.have.property('__v');
      expect(body[0]).not.to.have.property('hpyhenated-field-name');
      done();
    });
  });

  it('should not add query string to the search link (collection)', function (done) {
    var options = {
      url: 'http://localhost:8012/api/minerals?sort=color',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      var expected = '</api/minerals>; rel="search", '
        + '</api/minerals?sort=color>; rel="self"';
      expect(response.statusCode).to.be(200);
      expect(response.headers.link).to.be(expected);
      done();
    });
  });

  it('should not add query string to the search link (instance)', function (done) {
    var options = {
      url: 'http://localhost:8012/api/minerals',
      json: true
    };

    request.get(options, function (error, response, body) {
      if (error) return done(error);

      var id = body[0]._id;
      var options = {
        url: 'http://localhost:8012/api/minerals/' + id + '?sort=color',
        json: true
      };

      request.get(options, function (error, response, body) {
        if (error) return done(error);

        var expected = '</api/minerals>; rel="collection", '
          + '</api/minerals>; rel="search", '
          + '</api/minerals/' + id + '>; rel="edit", '
          + '</api/minerals/' + id + '>; rel="self"';
        expect(response.statusCode).to.be(200);
        expect(response.headers.link).to.be(expected);
        done();
      });
    });
  });

  it('should send 400 if limit is invalid', function(done) {
    var options = {
      url: 'http://localhost:8012/api/minerals?limit=-1',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(400);
      expect(response.headers).not.to.have.property('link');
      expect(body).to.be('Bad Request: Limit must be a positive integer if set (400).');
      done();
    });
  });

  it('should send 400 if limit is invalid', function(done) {
    var options = {
      url: 'http://localhost:8012/api/minerals?limit=0',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(400);
      expect(response.headers).not.to.have.property('link');
      expect(body).to.be('Bad Request: Limit must be a positive integer if set (400).');
      done();
    });
  });

  it('should send 400 if limit is invalid', function(done) {
    var options = {
      url: 'http://localhost:8012/api/minerals?limit=3.6',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(400);
      expect(response.headers).not.to.have.property('link');
      expect(body).to.be('Bad Request: Limit must be a positive integer if set (400).');
      done();
    });
  });

  it('should send 400 if limit is invalid', function(done) {
    var options = {
      url: 'http://localhost:8012/api/minerals?limit= asd  asd ',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(400);
      expect(response.headers).not.to.have.property('link');
      expect(body).to.be('Bad Request: Limit must be a positive integer if set (400).');
      done();
    });
  });

  it('should send 400 if skip is invalid', function(done) {
    var options = {
      url: 'http://localhost:8012/api/minerals?skip=1.1',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(400);
      expect(response.headers).not.to.have.property('link');
      expect(body).to.be('Bad Request: Skip must be a non-negative integer if set (400).');
      done();
    });
  });

  it('should send 400 if count is invalid', function(done) {
    var options = {
      url: 'http://localhost:8012/api/minerals?count=1',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(400);
      expect(response.headers).not.to.have.property('link');
      expect(body).to.be('Bad Request: Count must be &quot;true&quot; or &quot;false&quot; if set (400).');
      done();
    });
  });

  it('should allow adding paging links', function(done) {
    var options = {
      url: 'http://localhost:8012/api/minerals?limit=2',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);
      expect(response.headers).to.have.property('link');
      done();
    });
  });

  it('should not return paging links if limit not set', function(done) {
    var options = {
      url: 'http://localhost:8012/api/minerals?sort=name',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);
      expect(response.headers.link).to.contain('rel="self"');
      expect(response.headers.link).to.contain('rel="search"');
      expect(response.headers.link).to.not.contain('rel="first"');
      expect(response.headers.link).to.not.contain('rel="last"');
      expect(response.headers.link).to.not.contain('rel="next"');
      expect(response.headers.link).to.not.contain('rel="previous"');
      done();
    });
  });

  it('should not return paging links if relations are not enabled', function(done) {
    var options = {
      url: 'http://localhost:8012/api/vegetables',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);
      expect(response.headers.link).to.be(undefined);
      done();
    });
  });

  it('should allow using relations: true with sorted queries', function (done) {
    var options = {
      url: 'http://localhost:8012/api/minerals?sort=color&limit=2&skip=2&select=-__v -_id -enables',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);
      expect(response.headers.link).to.contain('rel="first"');
      expect(response.headers.link).to.contain('rel="last"');
      expect(response.headers.link).to.contain('rel="next"');
      expect(response.headers.link).to.contain('rel="previous"');
      expect(body).to.eql([ { color: 'Indigo' }, { color: 'Orange' } ]);
      done();
    });
  });

  it('should return next for first page', function(done) {
    var options = {
      url: 'http://localhost:8012/api/minerals?limit=2',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);
      expect(response.headers).to.have.property('link');
      expect(response.headers.link).to.contain('rel="next"');
      done();
    });
  });

  it('should return previous for second page', function(done) {
    var options = {
      url: 'http://localhost:8012/api/minerals?limit=2&skip=2',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);
      expect(response.headers).to.have.property('link');
      expect(response.headers.link).to.contain('rel="previous"');
      done();
    });
  });

  it('should not return paging links previous for first page', function(done) {
    var options = {
      url: 'http://localhost:8012/api/minerals?limit=2',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);
      expect(response.headers).to.have.property('link');
      expect(response.headers.link).not.to.contain('rel="previous"');
      done();
    });
  });

  it('should not return paging links next for last page', function(done) {
    var options = {
      url: 'http://localhost:8012/api/minerals?limit=2&skip=6',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);
      expect(response.headers).to.have.property('link');
      expect(response.headers.link).not.to.contain('rel="next"');
      done();
    });
  });

  it('should preserve query in paging links', function(done) {
    var conditions = JSON.stringify({ color: { $regex: /.*e.*/ } });
    var options = {
      url: 'http://localhost:8012/api/minerals?limit=1&skip=0&conditions=' + conditions,
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);
      expect(response.headers).to.have.property('link');
      expect(response.headers.link).to.contain('rel="next"');
      var links = parselinks(response.headers.link);
      expect(links.next).to.contain('conditions=' + encodeURIComponent(conditions));
      done();
    });
  });

  it('should allow retrieving paging links next', function(done) {
    var options = {
      url: 'http://localhost:8012/api/minerals?limit=2&skip=0',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);

      expect(response.statusCode).to.be(200);
      expect(response.headers).to.have.property('link');

      var links = parselinks(response.headers.link);
      expect(links).to.have.property('next');

      var options = {
        url: 'http://localhost:8012' + links.next,
        json: true
      };
      request.get(options, function (error, response, body) {
        expect(response.statusCode).to.be(200);
        done();
      })
    });
  });

  it('should allow retrieving paging links previous', function(done) {
    var options = {
      url: 'http://localhost:8012/api/minerals?limit=2&skip=2',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);
      expect(response.headers).to.have.property('link');
      var links = parselinks(response.headers.link);
      expect(links).to.have.property('previous');
      var options = {
        url: 'http://localhost:8012' + links.previous,
        json: true
      };
      request.get(options, function (error, response, body) {
        expect(response.statusCode).to.be(200);
        done();
      })
    });
  });

  it('should allow retrieving paging links last', function(done) {
    var options = {
      url: 'http://localhost:8012/api/minerals?limit=2&skip=6',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);
      expect(response.headers).to.have.property('link');
      var links = parselinks(response.headers.link);
      expect(links).to.have.property('first');
      var options = {
        url: 'http://localhost:8012' + links.first,
        json: true
      };
      request.get(options, function (error, response, body) {
        expect(response.statusCode).to.be(200);
        done();
      })
    });
  });

  it('should allow retrieving paging links first', function(done) {
    var options = {
      url: 'http://localhost:8012/api/minerals?limit=2&skip=0',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);
      expect(response.headers).to.have.property('link');
      var links = parselinks(response.headers.link);
      expect(links).to.have.property('last');
      var options = {
        url: 'http://localhost:8012' + links.last,
        json: true
      };
      request.get(options, function (error, response, body) {
        expect(response.statusCode).to.be(200);
        done();
      });
    });
  });

  it('should allow retrieving count instead of documents', function (done) {
    var options = {
      url: 'http://localhost:8012/api/vegetables?count=true',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);
      expect(body).to.be(8);
      done();
    });
  });

  it('should not send count if count is not set to true', function (done) {
    var options = {
      url: 'http://localhost:8012/api/vegetables?count=false',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);
      expect(body).not.to.be(8);
      done();
    });
  });

  it('should report bad hints', function (done) {
    var options = {
      url: 'http://localhost:8012/api/vegetables?count=true&hint={ "foogle": 1 }',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(400);
      expect(body).to.be('Bad Request: The requested query hint is invalid (400).')
      done();
    });
  });

  it('should allow adding index hint', function (done) {
    var options = {
      url: 'http://localhost:8012/api/vegetables?count=true&hint={ "_id": 1 }',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);
      expect(body).to.be(8);
      done();
    });
  });

  it('should allow adding index hint', function (done) {
    var options = {
      url: 'http://localhost:8012/api/vegetables?count=true&hint[_id]=1',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);
      expect(body).to.be(8);
      done();
    });
  });

  it('should allow adding a query comment', function (done) {
    var options = {
      url: 'http://localhost:8012/api/vegetables?count=true&comment=testing testing 123',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);
      expect(body).to.be(8);
      done();
    });
  });

  it('should not allow adding an index hint if not enabled', function (done) {
    var options = {
      url: 'http://localhost:8012/api/fungi?hint={ "_id": 1 }',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(403);
      expect(body).to.be('Forbidden: Hints are not enabled for this resource (403).')
      done();
    });
  });

  it('should ignore query comments if not enabled', function (done) {
    var options = {
      url: 'http://localhost:8012/api/fungi?comment=testing testing 123',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);
      expect(body).to.have.property('length', 1);
      done();
    });
  });

  it('should allow querying for distinct values', function (done) {
    var options = {
      url: 'http://localhost:8012/api/vegetables?distinct=name',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);
      body.sort();
      expect(body).to.have.property('length', 8);
      expect(body[0]).to.be('Carrot');
      expect(body[1]).to.be('Lima Bean');
      expect(body[2]).to.be('Pea');
      expect(body[3]).to.be('Radicchio');
      expect(body[4]).to.be('Shitake');
      expect(body[5]).to.be('Spinach');
      expect(body[6]).to.be('Turnip');
      expect(body[7]).to.be('Zucchini');
      done();
    });
  });

  it('should allow querying for distinct values restricted by conditions', function (done) {
    var options = {
      url: 'http://localhost:8012/api/vegetables?distinct=name&conditions={ "name": "Carrot" }',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);
      expect(body).to.have.property('length', 1);
      expect(body[0]).to.be('Carrot');
      done();
    });
  });

  it('should not allow querying for distinct values of deselected paths', function (done) {
    var options = {
      url: 'http://localhost:8012/api/fungi?distinct=hyphenated-field-name',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(403);
      expect(body).to.be('Forbidden: You may not find distinct values for the requested path (403).')
      done();
    });
  });

  it('should allow using query operators with _id', function (done) {
    var options = {
      url: 'http://localhost:8012/api/vegetables?conditions={ "_id": { "$gt": "111111111111111111111111" } }',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);
      expect(body).to.have.property('length', 8);
      expect(body[0]).to.have.property('name', 'Turnip');
      done();
    });
  });

  it('should give a 400 if the query stirng is unpar using query operators with _id', function (done) {
    var options = {
      url: 'http://localhost:8012/api/vegetables?conditions={ \'_id\': { \'$gt\': \'111111111111111111111111\' } }',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(400);
      expect(body).to.be('Bad Request: The conditions query string value was not valid JSON: &quot;Unexpected token &#39;&quot; (400).');
      done();
    });
  });

});
