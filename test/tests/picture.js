var should = require('should');
var request = require('request');
var async = require('async');
var config = require('../config');
var util = require('../util');

var HOST = config.HOST;

describe('user pictures', function() {
  var j = request.jar();

  before(function(next) {
    util.createUser(config.TEST_USER, config.TEST_EMAIL, config.TEST_PASSWORD, j, next);
  })

  it('Should allow users to upload a picture', function(done) {
    console.log("picture", j)
    var image = "http://placekitten.com/200/300";
    request.post(HOST+"/api/users/picture", {jar: j, json: true, form: {url: image}}, function(err, response, body) {
      if(err) done(err);
      util.validUser(body);

      body.pictures[0].url.should.eql(image);
      done()
    })
  });

  it('Should allow users to delete a picture');

  it('Should allow users to change their password');

  it('Should allow users to do password recovery');
})