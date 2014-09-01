var mongoose = require('mongoose');
var express = require('express');
var baucis = require('../..');
var config = require('./config');

var app;
var server;
var Schema = mongoose.Schema;

var User = new Schema({
  name: String,
  tasks: [{ type: Schema.ObjectId, ref: 'task' }]
});
var Task = new Schema({
  name: String,
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

mongoose.model('user', User);
mongoose.model('task', Task);

var fixture = module.exports = {
  init: function (done) {

    mongoose.connect(config.mongo.url);

    var users = baucis.rest('user');
    var tasks = users.vivify('tasks');

    tasks.request(function (request, response, next) {
      request.baucis.outgoing(function (context, callback) {
        context.doc.name = 'Changed by Middleware';
        callback(null, context);
      });
      next();
    });

    tasks.query(function (request, response, next) {
      request.baucis.query.where('user', request.params._id);
      next();
    });

    app = express();
    app.use('/api', baucis());

    server = app.listen(8012);

    done();
  },
  deinit: function (done) {
    server.close();
    mongoose.disconnect();
    done();
  },
  create: function (done) {
    // clear all first
    mongoose.model('user').remove({}, function (error) {
      if (error) return done(error);

      mongoose.model('task').remove({}, function (error) {
        if (error) return done(error);

        mongoose.model('user').create(
          ['Alice', 'Bob'].map(function (name) { return { name: name } }),
          function (error, alice) {
            if (error) return done(error);

            mongoose.model('task').create(
              ['Mow the Lawn', 'Make the Bed', 'Darn the Socks'].map(function (name) { return { name: name } }),
              function (error,task) {
                if (error) return done(error);
                task.user = alice._id;
                task.save(done)
              }
            );
          }
        );
      });
    });
  }
};
