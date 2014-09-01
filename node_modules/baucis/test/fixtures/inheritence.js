// __Dependencies__
var mongoose = require('mongoose');
var express = require('express');
var deco = require('deco');
var async = require('async');
var baucis = require('../..');
var config = require('./config');

// __Private Module Members__
var app;
var server;

var BaseSchema = deco(function () {
  this.add({ name: String });
});

BaseSchema.inherit(mongoose.Schema);

var LiqueurSchema = BaseSchema();
var AmaroSchema = BaseSchema({ bitterness: Number });
var CordialSchema = BaseSchema({ sweetness: Number });

var Liqueur = mongoose.model('liqueur', LiqueurSchema);
var Amaro = Liqueur.discriminator('amaro', AmaroSchema).plural('amari');
var Cordial = Liqueur.discriminator('cordial', CordialSchema);

var fixture = module.exports = {
  init: function (done) {
    mongoose.connect(config.mongo.url);

    baucis.rest(Liqueur);
    baucis.rest(Amaro);
    
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
    var liqueurs = [ { name: 'Generic' } ];
    var amari = [
      { name: 'Amaro alle Erbe', bitterness: 3 },
      { name: 'Campari', bitterness: 5 },
      { name: 'Fernet', bitterness: 10 }
    ];
    var cordials = [
      { name: 'Blackberry', sweetness: 5 },
      { name: 'Peach', sweetness: 7 }
    ];
    var deferred = [
      Liqueur.remove.bind(Liqueur),
      Amaro.remove.bind(Amaro),
      Cordial.remove.bind(Cordial)
    ];

    deferred = deferred.concat(liqueurs.map(function (data) {
      var liqueur = new Liqueur(data);
      return liqueur.save.bind(liqueur);
    }));

    deferred = deferred.concat(amari.map(function (data) {
      var amaro = new Amaro(data);
      return amaro.save.bind(amaro);
    }));

    deferred = deferred.concat(cordials.map(function (data) {
      var cordial = new Cordial(data);
      return cordial.save.bind(cordial);
    }));

    async.series(deferred, done);
  }
};
