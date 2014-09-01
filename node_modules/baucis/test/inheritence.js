// __Dependencies__
var expect = require('expect.js');
var request = require('request');
var baucis = require('..');

var fixtures = require('./fixtures');

describe('Inheritence', function () {
  // __Test Hooks__
  before(fixtures.inheritence.init);
  beforeEach(fixtures.inheritence.create);
  after(fixtures.inheritence.deinit);

  it('should return all documents for parent model controller', function (done) {
    var options = {
      url: 'http://localhost:8012/api/liqueurs',
      json: true
    };
    request.get(options, function (err, response, body) {
      if (err) return done(err);
      expect(response.statusCode).to.be(200);
      expect(body).to.have.property('length', 6);
      done();
    });
  });

  // There seems to be an bug in mongoose that prevents this from working...
  it('should return typed documents for child model controller');/*, function (done) {
    var options = {
      url: 'http://localhost:8012/api/amari',
      json: true
    };
    request.get(options, function (err, response, body) {
      if (err) return done(err);
      expect(response.statusCode).to.be(200);
      expect(body).to.have.property('length', 3);
      done();
    });
  });*/


  // __Tests__
  it('should create parent model when no discriminator is supplied', function (done) {
    var options = {
      url: 'http://localhost:8012/api/liqueurs',
      json: { name: 'Generic 2' }
    };
    request.post(options, function (error, response, body) {
      if (error) return done(error);

      expect(response.statusCode).to.equal(201);
      expect(body).not.to.have.property('__t');

      var options = {
        url: 'http://localhost:8012' + response.headers.location,
        json: true
      };
      request.get(options, function (error, response, body) {
        if (error) return done(error);
        expect(response.statusCode).to.equal(200);
        expect(body).to.have.property('name', 'Generic 2');
        done();
      });
    });
  });

  it('should create child model when a discriminator is supplied', function (done) {
    var options = {
      url: 'http://localhost:8012/api/liqueurs',
      json: { name: 'Elderberry', sweetness: 3, __t: 'cordial' }
    };
    request.post(options, function (error, response, body) {
      if (error) return done(error);

      expect(response.statusCode).to.equal(201);
      expect(body).to.have.property('__t', 'cordial');

      var options = {
        url: 'http://localhost:8012' + response.headers.location,
        json: true
      };
      request.get(options, function (error, response, body) {
        if (error) return done(error);
        expect(response.statusCode).to.equal(200);
        expect(body).to.have.property('name', 'Elderberry');
        done();
      });
    });
  });

  it('should give a 422 if the discriminator does not exist', function (done) {
    var options = {
      url: 'http://localhost:8012/api/liqueurs',
      json: { name: 'Oud Bruin', __t: 'ale' }
    };
    request.post(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.equal(422);
      expect(body).to.eql([ 
        { 
          message: 'A document\'s type did not match any known discriminators for this resource',
          name: 'BaucisError',
          path: '__t',
          value: 'ale' 
        }
      ]);
      done();
    });
  });
});
