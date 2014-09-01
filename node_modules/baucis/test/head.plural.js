var expect = require('expect.js');
var request = require('request');

var fixtures = require('./fixtures');

describe('HEAD plural', function () {
  before(fixtures.vegetable.init);
  beforeEach(fixtures.vegetable.create);
  after(fixtures.vegetable.deinit);

  it('should set etag and Last-Modified ... if possible');

  it("should get the header", function (done) {
    var options = {
      url: 'http://localhost:8012/api/vegetables',
      json: true
    };
    request.head(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);
      expect(body).to.equal(undefined);
      done();
    });
  });
});
