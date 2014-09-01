var expect = require('expect.js');
var express = require('express');
var util = require('util');
var deco = require('..');

describe('deco', function () {

  it('should allow building a constructor with default behavior', function () {
    var constructor = deco();
    var o = constructor();

    expect(constructor).to.be.a(Function);
    expect(o).to.be.an(Object);
    expect(o).to.be.a(constructor);
    expect(Object.keys(o)).to.eql([]);
  });

  it('should allow building a constructor from a single decorator', function () {
    var constructor = deco(function () { this.genre = 'reggae' });
    var o = constructor();

    expect(o).to.have.property('genre', 'reggae');
  });

  it('should allow building a constructor from a series of decorators', function () {
    var decorator1 = require('./decorators/d1');
    var decorator2 = require('./decorators/d2');
    var constructor = deco([decorator1, decorator2]);
    var o = constructor();

    expect(o).to.have.property('artist', 'busy signal');
    expect(o).to.have.property('genre', 'reggae');
  });

  it('should allow building a constructor from a directory of decorator files', function () {
    var constructor = deco(__dirname + '/decorators');
    var o = constructor();

    expect(o).to.have.property('artist', 'busy signal');
    expect(o).to.have.property('genre', 'reggae');
  });

  it('should allow building a constructor from a list of string file names', function () {
    var constructor = deco(__dirname + '/decorators', ['d1']);
    var o = constructor();

    expect(o).not.to.have.property('artist');
    expect(o).to.have.property('genre', 'reggae');
  });

  it('should allow adding a single decorator', function () {
    var constructor = deco();
    var o;

    constructor.decorators(require('./decorators/d1'));

    o = constructor();
    expect(o).to.have.property('genre', 'reggae');
  });

  it('should allow adding a series of decorators', function () {
    var decorator1 = require('./decorators/d1');
    var decorator2 = require('./decorators/d2');
    var constructor = deco();
    var o;

    constructor.decorators([ decorator1, decorator2 ]);

    o = constructor();
    expect(o).to.have.property('genre', 'reggae');
  });

  it('should allow adding a directory of decorator files', function () {
    var constructor = deco();
    var o;

    constructor.decorators(__dirname + '/decorators');

    o = constructor();
    expect(o).to.have.property('artist', 'busy signal');
    expect(o).to.have.property('genre', 'reggae');
  });

  it('should allow adding a series of file names', function () {
    var constructor = deco();
    var o;

    constructor.decorators(__dirname + '/decorators', ['d1']);

    o = constructor();
    expect(o).not.to.have.property('artist');
    expect(o).to.have.property('genre', 'reggae');
  });

  it('should not overwrite decorators when adding more', function () {
    var decorator1 = require('./decorators/d1');
    var decorator2 = require('./decorators/d2');
    var constructor = deco();
    var o;

    constructor.decorators(decorator1);
    constructor.decorators(decorator2);

    o = constructor();
    expect(o).to.have.property('artist', 'busy signal');
    expect(o).to.have.property('genre', 'reggae');
  });

  it('should allow adding defaults', function () {
    var constructor = deco();

    constructor.defaults({ genre: 'reggae', artist: 'midnite' });
    constructor.decorators(function (options) {
      expect(options).to.have.property('genre', 'reggae');
      expect(options).to.have.property('artist', 'midnite');
    });

    constructor();
  });

  it('should allow merging in additional defaults', function () {
    var constructor = deco();

    constructor.defaults({ genre: 'reggae', artist: 'midnite' });
    constructor.defaults({ label: 'gargamel records', artist: 'lutan fyah' });
    constructor.decorators(function (options) {
      expect(options).to.have.property('genre', 'reggae');
      expect(options).to.have.property('artist', 'lutan fyah');
      expect(options).to.have.property('label', 'gargamel records');
    });

    constructor();
  });

  it('should allow inheriting', function () {
    var Parent = function Parent () { return this };
    var constructor = deco();
    var o;

    constructor.inherit(Parent);

    o = constructor();
    expect(o).to.be.an(Object);
    expect(o).to.be.a(Parent);
    expect(o).to.be.a(constructor);
  });

  it('should allow inheriting from Error', function () {
    var constructor = deco(function (message) { this.message = message });
    var message = 'Test error message.';
    var o;

    constructor.inherit(Error);

    o = constructor(message);
    expect(o).to.be.an(Object);
    expect(o).to.be.an(Error);
    expect(o).to.be.a(constructor);
    expect(o).to.have.property('message', message);
  });


  it('should allow calling a constructor not as a method', function () {
    var container = {
      constructor: deco(function (message) { this.message = message })
    };
    var message = 'Test error message.';
    var o;

    container.constructor.inherit(Error);
    container.constructor.container(container);

    o = container.constructor(message);
    expect(o).to.be.an(Object);
    expect(o).to.be.an(Error);
    expect(o).to.be.a(constructor);
    expect(o).to.have.property('message', message);
  });

  it('should allow decorating an existing object (i.e. Express)', function () {
    var constructor = deco();
    var o;

    constructor.factory(express);

    o = constructor();
    expect(o).to.be.an(Object);
    expect(o).not.to.be.an(express); // `express` doesn't set this up, other constructors may well
    expect(o).not.to.be.a(constructor); // decorating an existing object
    expect(o).to.have.property('set');
    expect(o.set).to.be.a(Function);
  });

  it('should allow constructors to act as decorators', function () {
    var constructor1 = deco(__dirname + '/decorators');
    var constructor2 = deco(constructor1);
    var o = constructor2();

    expect(constructor1).to.be.a(Function);
    expect(constructor2).to.be.a(Function);
    expect(o).not.to.be.a(constructor1);
    expect(o).to.be.a(constructor2);
    expect(o).to.have.property('artist', 'busy signal');
    expect(o).to.have.property('genre', 'reggae');
  });

  it('should support protected instance members', function () {
    var constructor = deco();

    constructor.decorators(function (options, protect) {
      protect.year = 2014;
    });

    constructor.decorators(function (options, protect) {
      expect(protect).to.have.property('year', 2014)
    });

    constructor();
  });

  it('should make sure array is array of functions', function () {
    var f = deco.bind(deco, ['barron von beluga']);
    expect(f).to.throwException(/Encountered non-function decorator[.]/);
  });

  it('should leave non-object constructor options alone', function () {
    var constructor = deco();

    constructor.decorators(function (options, protect) {
      expect(options).to.be(0);
    });

    constructor(0);
  });

  it('should allow a decorator to overwrite options for the rest of the chain', function () {
    var constructor = deco();

    constructor.decorators(function (options, protect) {
      protect.options({ wrapper: options });
    });

    constructor.decorators(function (options, protect) {
      protect.options(undefined);
    });

    constructor.decorators(function (options) {
      expect(options).to.have.property('wrapper', 'ping');
    });

    constructor('ping');
  });

  it('should allow a later decorator to overwrite options', function () {
    var constructor = deco();

    constructor.decorators(function (s, protect) {
      protect.options({ genre: s });
    });

    constructor.decorators(function (options, protect) {
      protect.options({ genre: 'r&b' });
    });

    constructor.decorators(function (options) {
      expect(options).to.have.property('genre', 'r&b');
    });

    constructor('ragtime');
  });

  it('should provide a default constructor options object', function () {
    var constructor = deco();

    constructor.decorators(function (options, protect) {
      expect(options).to.eql({});
    });

    constructor();
  });

  it('should allow any number of arguments for the initial constructor call', function () {
    var constructor = deco().sanitize(function () {
      return util.format.apply(util, arguments);
    });

    constructor.decorators(function (options, protect) {
      expect(options).to.eql('foo ! bar');
      expect(protect).not.to.eql(null);
      expect(protect).to.have.property('options');
    });

    constructor('%s ! %s', 'foo', 'bar');
  });

  it('should allow adding a property', function (done) {
    var constructor = deco(function (option, protect) {
      protect.property('channels');
    });
    var o = constructor();
    expect(o.channels()).to.be(undefined);
    done();
  });

  it('should allow setting a property', function (done) {
    var constructor = deco(function (option, protect) {
      protect.property('panels', true);
    });
    var o = constructor();
    expect(o.panels()).to.be(true);
    o.panels(undefined);
    expect(o.panels()).to.be(true);
    o.panels(false);
    expect(o.panels()).to.be(false);
    done();
  });

  it('should allow adding a multiproperty', function (done) {
    var constructor = deco(function (options, protect) {
      protect.multiproperty('flannels', null, false);
    });
    var o = constructor();
    expect(o.flannels('plaid')).to.be(false);
    expect(o.flannels('rad')).to.be(false);
    done();
  });

  it('should allow setting a multiproperty', function (done) {
    var constructor = deco(function (options, protect) {
      protect.multiproperty('bundles', undefined, 'lively');
    });
    var o = constructor();
    expect(o.bundles('one')).to.be('lively');
    expect(o.bundles('   one two    three   ', 'tubular')).to.be(o);
    expect(o.bundles('one')).to.be('tubular');
    expect(o.bundles('two')).to.be('tubular');
    expect(o.bundles('three')).to.be('tubular');
    expect(o.bundles('one', false)).to.be(o);
    expect(o.bundles('one')).to.be(false);
    expect(o.bundles()).to.eql([ 'two', 'three' ]);
    done();
  });

  it('should set defaults for a multiproperty', function (done) {
    var constructor = deco(function (options, protect) {
      protect.multiproperty('bundles', 'head get put post delete', true, function (v) {
        return v ? true : false;
      });
    });
    var o = constructor();
    expect(o.bundles()).to.eql([ 'head', 'get', 'put', 'post', 'delete' ]);
    o.bundles('head get put post', false);
    expect(o.bundles()).to.eql([ 'delete' ]);
    done();
  });

  it('should allow any number of arguments for the initial factory call');
  it('should not allow inheriting and using a factory at the same time');
  it('should call the super constructor for inherited objects');
  it('should pass arguments through unmodified where approrpaite e.g. inheriting Error sends undefined as first argument which bombs');

});
