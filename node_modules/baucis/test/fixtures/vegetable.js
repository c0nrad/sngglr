// __Dependencies__
var mongoose = require('mongoose');
var express = require('express');
var bodyParser = require('body-parser');
var async = require('async');
var es = require('event-stream');
var baucis = require('../..');
var config = require('./config');

// __Private Module Members__
var app;
var server;

// __Fixture Schemata__
var Schema = mongoose.Schema;
var Fungus = new Schema({ 'hyphenated-field-name': String });
var Animal = new Schema({ name: String });
var Mineral = new Schema({
  color: String,
  enables: [ { type: Schema.ObjectId, ref: 'fungus' } ]
});
var Vegetable = new Schema({
  name: { type: String, required: true },
  lastModified: { type: Date, required: true, default: Date.now },
  diseases: { type: [ String ], select: false },
  species: { type: String, default: 'n/a', select: false },
  related: { type: Schema.ObjectId, ref: 'vegetable' },
  score: { type: Number, min: 1 },
  nutrients: [ { type: Schema.ObjectId, ref: 'mineral' } ]
});

Vegetable.pre('save', function (next) {
  this.set('related', this._id);
  next();
});

Vegetable.pre('save', function (next) {
  this.set('lastModified', new Date());
  next();
});

Vegetable.pre('save', function (next) {
  fixture.saveCount += 1;
  next();
});

Vegetable.pre('remove', function (next) {
  fixture.removeCount += 1;
  next();
});

mongoose.model('vegetable', Vegetable).lastModified('lastModified');
mongoose.model('fungus', Fungus).plural('fungi');
mongoose.model('mineral', Mineral);
mongoose.model('animal', Animal);

// __Module Definition__
var fixture = module.exports = {
  init: function (done) {
    mongoose.connect(config.mongo.url);

    fixture.saveCount = 0;
    fixture.removeCount = 0;

    baucis.rest('fungus').select('-hyphenated-field-name');
    baucis.rest('mineral').relations(true);

    baucis.rest('animal').fragment('empty-array').emptyCollection(200);
    baucis.rest('animal').fragment('no-content').emptyCollection(204);
    baucis.rest('animal').fragment('not-found').emptyCollection(404);

    var veggies = baucis.rest('vegetable');
    veggies.relations(false).hints(true).comments(true);

    veggies.request(function (request, response, next) {
      if (request.query.block === 'true') return response.send(401);
      next();
    });

    veggies.query(function (request, response, next) {
      if (request.query.testQuery !== 'true') return next();
      request.baucis.query.select('_id lastModified');
      next();
    });

    veggies.request(function (request, response, next) {
      if (request.query.failIt !== 'true') return next();
      request.baucis.incoming(es.through(function (context) {
        this.emit('error', baucis.Error.Forbidden('Bento box'));
      }));
      next();
    });

    veggies.request(function (request, response, next) {
      if (request.query.failItFunction !== 'true') return next();
      request.baucis.incoming(function (context, callback) {
        callback(baucis.Error.Forbidden('Bento box'));
      });
      next();
    });

    veggies.request(function (request, response, next) {
      if (request.query.failIt2 !== 'true') return next();
      request.baucis.outgoing(function (context, callback) {
        callback(baucis.Error.Forbidden('Bento box'));
      });
      next();
    });

    // Test streaming in through custom handler
    veggies.request(function (request, response, next) {
      if (request.query.streamIn !== 'true') return next();
      request.baucis.incoming(es.map(function (context, callback) {
        context.incoming.name = 'boom';
        callback(null, context);
      }));
      next();
    });

    // Test streaming in through custom handler
    veggies.request(function (request, response, next) {
      if (request.query.streamInFunction !== 'true') return next();
      request.baucis.incoming(function (context, callback) {
        context.incoming.name = 'bimm';
        callback(null, context);
      });
      next();
    });

    // Test streaming out through custom handler
    veggies.request(function (request, response, next) {
      if (request.query.streamOut !== 'true') return next();
      request.baucis.outgoing(es.map(function (context, callback) {
        context.doc.name = 'beam';
        callback(null, context);
      }));
      next();
    });

    // Test that parsed body is respected
    veggies.request(function (request, response, next) {
      if (request.query.parse !== 'true') return next();
      bodyParser.json()(request, response, next);
    });

    // Test arbitrary documents
    veggies.request(function (request, response, next) {
      if (request.query.creamIt !== 'true') return next();
      request.baucis.documents = 'Devonshire Clotted Cream.';
      next();
    });

    // Test 404 for documents
    veggies.request(function (request, response, next) {
      if (request.query.emptyIt !== 'true') return next();
      request.baucis.documents = 0;
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
    var Vegetable = mongoose.model('vegetable');
    var Mineral = mongoose.model('mineral');
    var Fungus = mongoose.model('fungus');
    var mineralColors = [ 'Blue', 'Green', 'Pearlescent', 'Red', 'Orange', 'Yellow', 'Indigo', 'Violet' ];
    var vegetableNames = [ 'Turnip', 'Spinach', 'Pea', 'Shitake', 'Lima Bean', 'Carrot', 'Zucchini', 'Radicchio' ];
    var fungus = new Fungus();
    var minerals = mineralColors.map(function (color) {
      return new Mineral({ 
        color: color,
        enables: fungus._id
      });
    });
    vegetables = vegetableNames.map(function (name) { // TODO leaked global
      return new Vegetable({ 
        name: name,
        nutrients: [ minerals[0]._id ]
      });
    });
    var deferred = [
      Vegetable.remove.bind(Vegetable),
      Mineral.remove.bind(Mineral),
      Fungus.remove.bind(Fungus)
    ];

    deferred = deferred.concat(vegetables.map(function (vegetable) {
      return vegetable.save.bind(vegetable);
    }));

    deferred = deferred.concat(minerals.map(function (mineral) {
      return mineral.save.bind(mineral);
    }));

    deferred.push(fungus.save.bind(fungus));

    async.series(deferred, done);
  }
};
