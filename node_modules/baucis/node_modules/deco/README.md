![deco.js](https://raw.githubusercontent.com/wprl/deco/master/deco.jpeg "deco.js")
=======
Compose modular decorators to build constructors.  You're Node.js code will never have been as organized, reusable, and pluggable.

Summary
-------

 * Compose decorators into constructors and modules
 * Supports public, private, and protected instance members
 * Build constructors & modules in a way similar to partial classes
 * Uses Node's built-in inherits functionality
 * Easily plug your constructors at runtime with additional decorators

Usage Overview
--------------

The main functionality is provided by the `deco()` function.  It builds constructors.

    var deco = require('deco');

    var Constructor = deco();
    var o = Constructor();

Inheritence can be achieved by the `inherit` constructor method.  This is shorthand for the built-in `util.inherits(Constructor, super_)`.  The super constructor will be called on the object before decoration.

    Constructor.inherit(super_);

To provide a constructor with decorators, use the `decorators` constructor method.

    Constructor.decorators(function () {
      this.cheese = 'Shropshire Blue';
    });

    var snack = Constructor();
    // `snack.cheese` will be "Shropshire Blue."

Decorators can also be supplied when the constructor is built.

    var Ale = deco(function () {
      this.created = new Date();
    });

Arrays of decorator functions are also allowed.

    var Lager = deco([ f1, f2 ]);

Deco.js provides a better way to provide default constructor options.

    Ale.defaults({
      yeast: 'Dry English Ale',
      hops: 'Nugget'
    });

    Ale.decorators(function (options) {
      // When `stout` is being created:
      // `options.yeast` will be set to "Nottingham."
      // `options.hops` will have the default value of "Nugget."
    });

    var stout = Ale({ yeast: 'Nottingham' });


Load a directory of decorator files into a constructor by sending in a path.

    var Composed = deco(__dirname);

Or to only load specific files:

    Composed = deco(__dirname, [ 'decorator1', 'decorator2' ]);

Deco.js constructors are themselves decorators!  Use them to group decorators for use in other constructors, or call them directly on existing objects.

    var AnotherConstructor = deco([ Composed, function () { /* ... */ }]);

    // also...

    var app = express();
    Composed.call(app);

You can have constructors use a factory method, instead of using prototypal inheritence.

    var ExpressConstructor = deco();
    ExpressConstructor.factory = express;
    // `ExpressConstructor()` will create the object to be decorated by
    // calling the factory function e.g. `express()`.

If you are setting a constructor as a property of another object, it will be interpreted as a method call and the runtime will pass the containing object in as `this`.  Deco will handle this situation for you if you designate the container.

    var collected = { Constructor1: deco(), Constructor2: deco() };
    collected.Constructor1.container(collected);
    collected.Constructor2.container(collected);

    var o = collected.Contructor1();

Protected instance members are passed into your decorators by deco.  Each constructed object has internal access to protected data, but it is hidden from outside code.

    var Bee = deco(function (options, protect) {
      protect.poisoned = true;
    });

    Bee.decorators(function (options, protect) {
      if (protect.poisoned) this.behavior = 'erratic';
    });

    var b = Bee();
    // `b.behavior` is set to "erratic."
    // `protect.poisoned` is not accessible in this scope, only to decorators.

To overwrite constructor options, use the protected `options` instance method.  The altered options will be merged with the constructor's defaults.

    var FortifiedWine = deco(function (optionsString, protect) {
      protect.options({ name: optionsString });
    });

    FortifiedWine.decorators(function (options) {
      this.name = options.name;
    });

    var quaff = FortifiedWine('sherry');
    // `quaff.name` will be set to "sherry."

Contact
-------

 * http://kun.io/
 * @wprl

&copy; 2014 William P. Riley-Land
