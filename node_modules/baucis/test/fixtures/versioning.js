var mongoose = require('mongoose');
var express = require('express');
var baucis = require('../..');
var config = require('./config');

var app;
var server;
var Schema = mongoose.Schema;
var Party = new Schema({ hobbits: Number, dwarves: Number });
var Dungeon = new Schema({ treasures: Number });
var Pumpkin = new Schema({ title: String });

mongoose.model('party', Party);
mongoose.model('dungeon', Dungeon);
mongoose.model('pumpkin', Pumpkin).locking(true);

var fixture = module.exports = {
  init: function (done) {

    mongoose.connect(config.mongo.url);

    app = express();

    baucis.rest('pumpkin');
    baucis.rest('party').versions('1.x');
    baucis.rest('party').versions('2.1.0');
    baucis.rest('party').versions('~3');

    app.use('/api/versioned', baucis().releases('1.0.0').releases('2.1.0').releases('3.0.1'));

    baucis.rest('dungeon');

    app.use('/api/unversioned', baucis());

    server = app.listen(8012);

    done();
  },
  deinit: function (done) {
    server.close();
    mongoose.disconnect();
    done();
  }
};
