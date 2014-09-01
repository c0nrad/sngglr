var expect = require('expect.js');
var mongoose = require('mongoose');
var express = require('express');
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;
var request = require('request');
var baucis = require('..');

var fixtures = require('./fixtures');

describe('Headers', function () {
  before(fixtures.vegetable.init);
  beforeEach(fixtures.vegetable.create);
  after(fixtures.vegetable.deinit);

  it('should set Last-Modified for single documents')
  it('should set Etag for single documents (?)')

  it('should set allowed', function (done) {
    var options = {
      url: 'http://localhost:8012/api/vegetables',
      json: true
    };
    request.head(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);
      expect(response.headers).to.have.property('allow', 'HEAD,GET,POST,PUT,DELETE');
      done();
    });
  });

  it('should send 406 Not Acceptable when the requested type is not accepted', function (done) {
    var options = {
      url: 'http://localhost:8012/api/vegetables',
      headers: {
        'Accept': 'application/xml'
      }
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(406);
      expect(body).to.be('Not Acceptable: The requested content type could not be provided (406).');
      done();
    });
  });

  it('should send 415 Unsupported Media Type when the request content type cannot be parsed', function (done) {
    var options = {
      url: 'http://localhost:8012/api/vegetables',
      headers: {
        'Content-Type': 'application/xml'
      }
    };
    request.post(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(415);
      expect(body).to.be("Unsupported Media Type: No parser is available for this request&#39;s content type (415).");
      done();
    });
  });

  it('should match the correct MIME type, ignoring extra options and linear whitespace', function (done) {
    var options = {
      url: 'http://localhost:8012/api/vegetables',
      headers: {
        'Content-Type': '     application/json        ;       charset=UTF-8    cheese=roquefort      '
      },
      json: { name: 'Tomatillo' }
    };
    request.post(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(201);
      done();
    });
  });

  it('should not set X-Powered-By', function (done) {
    var options = {
      url: 'http://localhost:8012/api/vegetables',
      json: true
    };
    request.head(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);
      expect(response.headers).not.to.have.property('x-powered-by');
      done();
    });
  });

});
