var should = require('should');
var async = require('async');
var request = require('request');
var util = require('../util');
console.log(util);

var HOST = 'http://localhost:9000'

describe('user creation', function() {
  var j = request.jar();

  it('Should allow new users to be created', function(done) {
    util.createUser("test1", "test1@test.test", "test1", j, function(err, user) {
      if (err) done(err);
      validUser(user);
      done()
    });
  })

  it('Should allow users to start a session', function(done) {
    util.loginUser("test1@test.test", "test1", j, function(err, user) {
      if (err) done(err);
      validUser(user);
      j.getCookies(HOST + "/api/sessions")[0].key.should.eql('connect.sid');
      done()
    })
  })

  it('Should allow users to set properties of themsleves', function(done) {
    var updates = {name: "update", gender: "male", looking: "female", bio: "Antichrist", email: "update", activity: "sex"}
    async.auto({
      me: function(next){
        return request.get(HOST+"/api/users/me", {jar: j, json: true}, function(err, response, body) {
          next(err, body);
        });
      },

      updateMe: ["me", function(next) {
        return request.put(HOST+"/api/users", {jar: j, json: true, form: updates}, function(err, response, body) {
          next(err, body);
        });
      }],
    }, function(err, results) {
      if (err) next(err);

      var me = results.me;
      var updatedMe = results.updateMe;

      // name and email shouldn't be able to change
      updatedMe.name.should.eql(me.name);
      updatedMe.email.should.eql(me.email);

      // gender, looking, bio, actiity are user configurable
      updatedMe.gender.should.eql(updates.gender);
      updatedMe.looking.should.eql(updates.looking);
      updatedMe.bio.should.eql(updates.bio);
      updatedMe.activity.should.eql(updates.activity);
      done();
    })
  });

  it('Should allow users to change their password');

  it('Should allow users to do password recovery');
})