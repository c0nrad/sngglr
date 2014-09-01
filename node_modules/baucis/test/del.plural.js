var expect = require('expect.js');
var request = require('request');

var fixtures = require('./fixtures');

describe('DEL plural', function () {
  before(fixtures.vegetable.init);
  beforeEach(fixtures.vegetable.create);
  after(fixtures.vegetable.deinit);

  it('should delete all documents in addressed collection', function (done) {
    var options = {
      url: 'http://localhost:8012/api/vegetables/',
      json: true
    };
    request.del(options, function (err, response, body) {
      if (err) return done(err);
      expect(response.statusCode).to.be(200);
      // Check that the correct number were deleted.
      expect(body).to.be(8);
      done();
    });
  });

  it('should invoke "remove" middleware', function (done) {
    var options = {
      url: 'http://localhost:8012/api/vegetables/',
      json: true
    };

    fixtures.vegetable.removeCount = 0;
    request.del(options, function (error, response, body) {
      if (error) return done(error);
      expect(fixtures.vegetable).to.have.property('removeCount', 8);
      done();
    });

  });

});
