describe('play', function() {
  var j = request.jar();

  it("Shouldn't allow users with no picture to play", function(done) {
    async.auto({
      create: function(next) {
        util.createUser('noPicture', 'noPicture@test.test', 'noPicture', j, next);
      },

      login: ["create", function(next) {
        util.loginUser('noPicture@test.test', 'noPicture', j, next);
      }],

      play: ["create", 'login', function(next, results) {
        request.get(HOST+'/api/play', {jar: j, json: true}, function(err, response, body) {
          response.statusCode.should.eql(401);
          body.should.containEql('picture');
          done()
        });
      }]
    })
  })

  it("Shouldn't allow two straight male users to find each other")

  it("should allow a straight male to find a female")

  it("should allow a gay male to find a gay male")

})