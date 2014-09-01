var expect = require('expect.js');
var mongoose = require('mongoose');
var express = require('express');
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;
var request = require('request');
var baucis = require('..');

var fixtures = require('./fixtures');

describe('Controllers', function () {
  before(fixtures.controller.init);
  beforeEach(fixtures.controller.create);
  after(fixtures.controller.deinit);

  it('should allow passing string name to create', function (done) {
    var makeController = function () { baucis.Controller('unmade') };
    makeController();
    expect(makeController).to.not.throwException();
    done();
  });

  it('should allow passing a model to create', function (done) {
    var makeController = function () { baucis.Controller(mongoose.model('unmade')) };
    expect(makeController).to.not.throwException();
    done();
  });

  it('should not allow leaving off arguments to create', function (done) {
    var makeController = function () { baucis.Controller() };
    expect(makeController).to.throwException(/You must pass in a model or model name [(]500[)][.]/);
    done();
  });

  it('should not allow weird arguments to create', function (done) {
    var makeController = function () { baucis.Controller({}) };
    expect(makeController).to.throwException(/You must pass in a model or model name [(]500[)][.]/);
    done();
  });

  it('should have methods set by default', function (done) {
    var controller;
    var makeController = function () { controller = baucis.Controller('unmade') };
    makeController();
    expect(makeController).to.not.throwException();
    expect(controller.methods()).to.eql([ 'head', 'get', 'put', 'post', 'delete' ]);
    done();
  });

  it('should support select options for GET requests', function (done) {
    var options = {
      url: 'http://localhost:8012/api/cheeses',
      qs: { sort: 'name' },
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);
      expect(body).to.have.property('length', 3);
      expect(body[1]).to.have.property('color', 'Yellow');
      expect(body[1]).to.have.property('name', 'Cheddar');
      expect(body[1]).not.to.have.property('_id');
      expect(body[1]).not.to.have.property('cave');
      done();
    });
  });

  it('should allow deselecting', function (done) {
    var options = {
      url: 'http://localhost:8012/api/liens',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);
      expect(body[0]).to.have.property('_id');
      expect(body[0]).to.have.property('__v');
      expect(body[0]).not.to.have.property('title');
      done();
    });
  });

  it('should allow deselecting hyphenated field names', function (done) {
    var options = {
      url: 'http://localhost:8012/api/stores',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);
      expect(body[0]).to.have.property('_id');
      expect(body[0]).to.have.property('__v');
      expect(body[0]).not.to.have.property('hpyhenated-field-name');
      expect(body[0]).not.to.have.property('voltaic');
      done();
    });
  });

  it('should support select options for POST requests', function (done) {
    var options = {
      url: 'http://localhost:8012/api/cheeses',
      json: true,
      body: { name: 'Gorgonzola', color: 'Green' }
    };
    request.post(options, function (err, response, body) {
      if (err) return done(err);
      expect(response.statusCode).to.be(201);
      expect(body).to.have.property('color', 'Green');
      expect(body).to.have.property('name', 'Gorgonzola');
      expect(body).not.to.have.property('_id');
      expect(body).not.to.have.property('cave');
      done();
    });
  });

  it('should support select options for PUT requests', function (done) {
    var options = {
      url: 'http://localhost:8012/api/cheeses/Cheddar',
      json: true,
      body: { color: 'White' }
    };
    request.put(options, function (err, response, body) {
      if (err) return done(err);
      expect(response.statusCode).to.be(200);
      expect(body).to.have.property('color', 'White');
      expect(body).to.have.property('name', 'Cheddar');
      expect(body).not.to.have.property('_id');
      expect(body).not.to.have.property('cave');
      done();
    });
  });

  it('should allow POSTing when fields are deselected (issue #67)', function (done) {
    var options = {
      url: 'http://localhost:8012/api/stores',
      json: true,
      body: { name: "Lou's" }
    };
    request.post(options, function (err, response, body) {
      if (err) return done(err);
      expect(response.statusCode).to.be(201);
      expect(body).to.have.property('_id');
      expect(body).to.have.property('__v');
      expect(body).to.have.property('name', "Lou's");
      done();
    });
  });

  it('should support finding documents with custom findBy field', function (done) {
    var options = {
      url: 'http://localhost:8012/api/cheeses/Camembert',
      json: true
    };
    request.get(options, function (err, response, body) {
      if (err) return done(err);
      expect(response.statusCode).to.be(200);
      expect(body).to.have.property('color', 'White');
      done();
    });
  });

  it('should disallow adding a non-unique findBy field', function (done) {
    var makeController = function () {
      baucis.Controller('cheese').findBy('color');
    };
    expect(makeController).to.throwException(/^`findBy` path for model "cheese" must be unique [(]500[)][.]$/);
    done();
  });

  it('should allow adding a uniqe findBy field 1', function (done) {
    var makeController = function () {
      var rab = new mongoose.Schema({ 'arb': { type: String, unique: true } });
      mongoose.model('rab', rab);
      baucis.Controller('rab').findBy('arb');
    };
    expect(makeController).not.to.throwException();
    done();
  });

  it('should allow adding a unique findBy field 2', function (done) {
    var makeController = function () {
      var barb = new mongoose.Schema({ 'arb': { type: String, index: { unique: true } } });
      mongoose.model('barb', barb);
      baucis.Controller('barb').findBy('arb');
    };
    expect(makeController).not.to.throwException();
    done();
  });

  it('should allow adding arbitrary routes', function (done) {
    var options = {
      url: 'http://localhost:8012/api/stores/info',
      json: true
    };
    request.get(options, function (err, response, body) {
      if (err) return done(err);
      expect(response.statusCode).to.be(200);
      expect(body).to.be('OK!');
      done();
    });
  });

  it('should allow adding arbitrary routes with params', function (done) {
    var options = {
      url: 'http://localhost:8012/api/stores/XYZ/arbitrary',
      json: true
    };
    request.get(options, function (err, response, body) {
      if (err) return done(err);
      expect(response.statusCode).to.be(200);
      expect(body).to.be('XYZ');
      done();
    });
  });

  it('should still allow using baucis routes when adding arbitrary routes', function (done) {
    var options = {
      url: 'http://localhost:8012/api/stores',
      qs: { select: '-_id -__v', sort: 'name' },
      json: true
    };
    request.get(options, function (err, response, body) {
      if (err) return done(err);
      expect(response.statusCode).to.be(200);
      expect(body).to.eql([ { name: 'Corner' }, { name: 'Westlake' } ]);
      done();
    });
  });

  it('should allow using middleware', function (done) {
    var options = {
      url: 'http://localhost:8012/api/stores',
      json: true
    };
    request.del(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);
      expect(response.headers['x-poncho']).to.be('Poncho!');
      done();
    });
  });

  it('should allow using middleware mounted at a path', function (done) {
    var options = {
      url: 'http://localhost:8012/api/stores/binfo',
      json: true
    };
    request.post(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);
      expect(body).to.be('Poncho!');
      done();
    });
  });

  it('should disallow unrecognized verbs', function (done) {
    var controller = baucis.Controller('store');
    var register = function () { controller.request('get dude', function () {}) };
    expect(register).to.throwException(/^Unrecognized HTTP method: "dude" [(]500[)][.]$/);
    done();
  });

  it('should disallow unrecognized howManys', function (done) {
    var controller = baucis.Controller('store');
    var register = function () { controller.request('gargoyle', 'get put', function () {}) };
    expect(register).to.throwException(/^End-point type must be either "instance" or "collection," not "gargoyle" [(]500[)][.]$/);
    done();
  });

  it('should allow specifying instance or collection middleware', function (done) {
    var controller = baucis.Controller('store');
    var register = function () {
      controller.request('collection', 'get put head delete post', function () {});
      controller.request('instance', 'get put head delete post', function () {});
    };
    expect(register).to.not.throwException();
    done();
  });

  it('should allow registering query middleware for other verbs', function (done) {
    var controller = baucis.Controller('store');
    var register = function () { controller.query('get put head delete', function () {}) };
    expect(register).not.to.throwException();
    done();
  });

  it('should allow registering POST middleware for other stages', function (done) {
    var controller = baucis.Controller('store');
    var register = function () {
      controller.request('post', function () {});
      controller.query('post', function () {});
    };

    expect(register).not.to.throwException();
    done();
  });

  it('should correctly set the deselected paths property', function (done) {
    var doozle = new mongoose.Schema({
      a: { type: String, select: false },
      b: String,
      c: String,
      d: String
    });
    mongoose.model('doozle', doozle);
    var controller = baucis.Controller('doozle').select('-d c -a b');
    expect(controller.deselected()).eql([ 'a', 'd' ]);
    done();
  });

  it('should disallow push mode by default', function (done) {
    var options = {
      url: 'http://localhost:8012/api/stores/Westlake',
      headers: { 'Update-Operator': '$push' },
      json: true,
      body: { molds: 'penicillium roqueforti', __v: 0 }
    };
    request.put(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(403);
      expect(body).to.be('Forbidden: The requested update operator &quot;$push&quot; is not enabled for this resource (403).');
      done();
    });
  });

  it('should disallow pushing to non-whitelisted paths', function (done) {
    var options = {
      url: 'http://localhost:8012/api/cheeses/Huntsman',
      headers: { 'Update-Operator': '$push' },
      json: true,
      body: { 'favorite nes game': 'bubble bobble' }
    };
    request.put(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(403);
      expect(body).to.be('Forbidden: This update path is forbidden for the requested update operator &quot;$push&quot; (403).');
      done();
    });
  });

  it("should allow pushing to an instance document's whitelisted arrays when $push mode is enabled", function (done) {
    var options = {
      url: 'http://localhost:8012/api/cheeses/Huntsman?select=molds',
      headers: { 'Update-Operator': '$push' },
      json: true,
      body: { molds: 'penicillium roqueforti' }
    };
    request.put(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);

      expect(body).to.have.property('molds');
      expect(body.molds).to.have.property('length', 1);
      expect(body.molds).to.eql([ 'penicillium roqueforti' ]);

      done();
    });
  });

  it('should disallow $pull mode by default', function (done) {
    var options = {
      url: 'http://localhost:8012/api/stores/Westlake',
      headers: { 'Update-Operator': '$pull' },
      json: true,
      body: { molds: 'penicillium roqueforti', __v: 0 }
    };
    request.put(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(403);
      expect(body).to.be('Forbidden: The requested update operator &quot;$pull&quot; is not enabled for this resource (403).');
      done();
    });
  });

  it('should disallow pulling non-whitelisted paths', function (done) {
    var options = {
      url: 'http://localhost:8012/api/cheeses/Huntsman',
      headers: { 'Update-Operator': '$pull' },
      json: true,
      body: { 'favorite nes game': 'bubble bobble' }
    };
    request.put(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(403);
      expect(body).to.be('Forbidden: This update path is forbidden for the requested update operator &quot;$pull&quot; (403).');
      done();
    });
  });

  it("should allow pulling from an instance document's whitelisted arrays when $pull mode is enabled", function (done) {
    var options = {
      url: 'http://localhost:8012/api/cheeses/Huntsman?select=molds',
      headers: { 'Update-Operator': '$push' },
      json: true,
      body: { molds: 'penicillium roqueforti' }
    };
    request.put(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);

      expect(body).to.have.property('molds');
      expect(body.molds).to.have.property('length', 1);
      expect(body.molds).to.eql([ 'penicillium roqueforti' ]);

      options.headers['Update-Operator'] = '$pull';

      request.put(options, function (error, response, body) {
        if (error) return done(error);

        expect(response.statusCode).to.be(200);

        expect(body).to.have.property('molds');
        expect(body.molds).to.have.property('length', 0);

        done();
      });
    });
  });

  it('should disallow push mode by default', function (done) {
    var options = {
      url: 'http://localhost:8012/api/stores/Westlake',
      headers: { 'Update-Operator': '$set' },
      json: true,
      body: { molds: 'penicillium roqueforti', __v: 0 }
    };
    request.put(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(403);
      expect(body).to.be('Forbidden: The requested update operator &quot;$set&quot; is not enabled for this resource (403).');
      done();
    });
  });

  it('should disallow setting non-whitelisted paths', function (done) {
    var options = {
      url: 'http://localhost:8012/api/cheeses/Huntsman',
      headers: { 'Update-Operator': '$set' },
      json: true,
      body: { 'favorite nes game': 'bubble bobble' }
    };
    request.put(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(403);
      expect(body).to.be('Forbidden: This update path is forbidden for the requested update operator &quot;$set&quot; (403).');
      done();
    });
  });

  it("should allow setting an instance document's whitelisted paths when $set mode is enabled", function (done) {
    var options = {
      url: 'http://localhost:8012/api/cheeses/Huntsman?select=molds',
      headers: { 'Update-Operator': '$set' },
      json: true,
      body: { molds: ['penicillium roqueforti'] }
    };
    request.put(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);

      expect(body).to.have.property('molds');
      expect(body.molds).to.have.property('length', 1);
      expect(body.molds).to.eql([ 'penicillium roqueforti' ]);

      done();
    });
  });

  it("should allow pushing to embedded arrays using positional $", function (done) {
    var options = {
      url: 'http://localhost:8012/api/cheeses/Camembert?select=arbitrary',
      headers: { 'Update-Operator': '$push' },
      json: true,
      qs: { conditions: JSON.stringify({ 'arbitrary.goat': true }) },
      body: { 'arbitrary.$.llama': 5 }
    };
    request.put(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);

      expect(body).to.have.property('arbitrary');
      expect(body.arbitrary).to.have.property('length', 2);
      expect(body.arbitrary[0]).to.have.property('llama');
      expect(body.arbitrary[0].llama).to.have.property('length', 3);
      expect(body.arbitrary[0].llama[0]).to.be(3);
      expect(body.arbitrary[0].llama[1]).to.be(4);
      expect(body.arbitrary[0].llama[2]).to.be(5);
      expect(body.arbitrary[1].llama).to.have.property('length', 2);
      expect(body.arbitrary[1].llama[0]).to.be(1);
      expect(body.arbitrary[1].llama[1]).to.be(2);

      done();
    });
  });

  it("should allow setting embedded fields using positional $", function (done) {
    var options = {
      url: 'http://localhost:8012/api/cheeses/Camembert?select=arbitrary',
      headers: { 'Update-Operator': '$set' },
      json: true,
      qs: { conditions: JSON.stringify({ 'arbitrary.goat': false }) },
      body: { 'arbitrary.$.champagne': 'extra dry' }
    };
    request.put(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);

      expect(body).to.have.property('arbitrary');
      expect(body.arbitrary).to.have.property('length', 2);
      expect(body.arbitrary[0]).not.to.have.property('champagne');
      expect(body.arbitrary[1]).to.have.property('champagne', 'extra dry');

      done();
    });
  });

  it("should allow pulling from embedded fields using positional $", function (done) {
    var options = {
      url: 'http://localhost:8012/api/cheeses/Camembert?select=arbitrary',
      headers: { 'Update-Operator': '$pull' },
      json: true,
      qs: { conditions: JSON.stringify({ 'arbitrary.goat': true }) },
      body: { 'arbitrary.$.llama': 3 }
    };
    request.put(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);

      expect(body).to.have.property('arbitrary');
      expect(body.arbitrary).to.have.property('length', 2);
      expect(body.arbitrary[0]).to.have.property('llama');
      expect(body.arbitrary[0].llama).to.have.property('length', 1);
      expect(body.arbitrary[0].llama[0]).to.be(4);
      expect(body.arbitrary[1].llama).to.have.property('length', 2);
      expect(body.arbitrary[1].llama[0]).to.be(1);
      expect(body.arbitrary[1].llama[1]).to.be(2);

      done();
    });
  });

  it('should send 405 when a verb is disabled (GET)', function (done) {
    request.get('http://localhost:8012/api/beans', function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(405);
      expect(response.headers).to.have.property('allow', 'HEAD,POST,PUT,DELETE');
      expect(body).to.be('Method Not Allowed: The requested method has been disabled for this resource (405).');
      done();
    });
  });

  it('should send 405 when a verb is disabled (DELETE)', function (done) {
    request.del('http://localhost:8012/api/liens', function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(405);
      expect(response.headers).to.have.property('allow', 'HEAD,GET,POST,PUT');
      expect(body).to.be('Method Not Allowed: The requested method has been disabled for this resource (405).');
      done();
    });
  });

  it('should return a 400 when ID malformed (not ObjectID)', function (done) {
    var options = {
      url: 'http://localhost:8012/api/beans/bad',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(400);
      expect(body).to.be('Bad Request: The requested document ID &quot;bad&quot; is not a valid document ID (400).');
      done();
    });   
  });

  it('should return a 400 when ID malformed (not Number)', function (done) {
    var options = {
      url: 'http://localhost:8012/api/deans/0booze',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(400);
      expect(body).to.eql('Bad Request: The requested document ID &quot;0booze&quot; is not a valid document ID (400).');
      done();
    });
  });

  it('should allow setting path different from model name', function (done) {
    var options = {
      url: 'http://localhost:8012/api/baloo/?sort=name',
      json: true
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);
      expect(body).to.have.length(2);
      done();
    });
  });

  it('should allow setting model independently of name', function (done) {
    var options = {
      url: 'http://localhost:8012/api/timeentries/Camembert',
      json: true
    };
    request.get(options, function (err, response, body) {
      if (err) return done(err);
      expect(response.statusCode).to.be(200);
      expect(body).to.have.property('color', 'White');
      done();
    });
  });

  it('should handle unique key error as a validation error', function (done) {
    var options = {
      url: 'http://localhost:8012/api/cheeses',
      json: true,
      body: { name: 'Gorgonzola', color: 'Green' }
    };
    request.post(options, function (err, response, body) {
      if (err) return done(err);
      expect(response.statusCode).to.be(201);
      request.post(options, function (err, response, body) {
        if (err) return done(err);
        expect(response.statusCode).to.be(422);
        expect(body).to.have.property('name');
        expect(body.name).to.have.property('message', 'Path `name` (Gorgonzola) must be unique.');
        expect(body.name).to.have.property('originalMessage', 'E11000 duplicate key error index: yYyBaUcIsTeStYyY.cheeses.$name_1  dup key: { : "Gorgonzola" }');
        expect(body.name).to.have.property('name', 'MongoError');
        expect(body.name).to.have.property('path', 'name');
        expect(body.name).to.have.property('type', 'unique');
        expect(body.name).to.have.property('value', 'Gorgonzola');
        done();
      });
    });
  });

  it('should not handle errors if disabled', function (done) {
    var options = {
      url: 'http://localhost:8012/api-no-error-handler/geese',
      json: true,
      body: { name: 'Gorgonzola', color: 'Green' }
    };
    request.post(options, function (err, response, body) {
      if (err) return done(err);
      expect(response.statusCode).to.be(201);
      request.post(options, function (err, response, body) {
        if (err) return done(err);
        expect(response.statusCode).to.be(422);
        expect(body).to.match(/^MongoError: E11000 duplicate key error index:/);
        done();
      });
    });
  });

  it('should allow setting path apart from plural', function (done) {
    var options = {
      url: 'http://localhost:8012/api/linseed.oil',
      json: true
    };
    request.get(options, function (err, response, body) {
      if (err) return done(err);
      expect(response.statusCode).to.be(200);
      expect(body).to.have.property('length', 2);
      done();
    });
  });

});
