var request = require('request');
var config = require('./config');

exports.HOST = 'http://localhost:9000'

exports.MALE_TEST_USER = "test1"
exports.MALE_TEST_EMAIL = "test1@test.test"
exports.MALE_TEST_PASSWORD = "password"

exports.FEMALE_TEST_USER = "test2"
exports.FEMALE_TEST_EMAIL = "test2@test.test"
exports.FEMALE_TEST_PASSWORD = "password"

exports.validUser = validUser = function (user) {
  user.should.have.properties( "name", "email", "role", "gender", "looking", "bio", 
  "pictures", "activity", "lastLogin", "lastActivity", "firstLogin");
  user.should.not.have.properties('password', 'hashedPassword');
}

exports.createUser = createUser = function (name, email, password, cookieJar, next) {
  request.post(HOST+"/api/users", {json: true, jar: cookieJar, form: {email: email, name: name, password: password }}, function(err, response, body) {
    if (err) throw err;
    validUser(body);
    next(err, body);
  });
}

exports.loginUser = loginUser = function (email, password, cookieJar, next) {
  var URL = HOST + "/api/session";
  request.post(URL, {jar: cookieJar, json: true, form: {email: email, password: password }}, function(err, response, body) {
    if (err) throw err;
    validUser(body);
    next(err, body)
  })
}

exports.cleanDatabase = cleanDatabase = function cleanDatabase() {
  MongoClient.connect('mongodb://127.0.0.1:27017/sngglr', function(err, db) {
    if(err) throw err;

    db.dropDatabase(function(err, done) {
      if (err) throw err;
      process.exit();
    })
  });
}