// __Dependencies__
var util = require('util');
var requireindex = require('requireindex');
// __Private Module Members__
function getValue (key) { return this[key] }
function isNotFunction (value) { return typeof value !== 'function' }
// Parse the deco function arguments.
function parse (args) {
  var incoming = args[0];
  var decorators;
  // Parse.
  if (!incoming) decorators = [];
  else if (Array.isArray(incoming)) decorators = [].concat(incoming);
  else if (typeof incoming === 'function') decorators = [].concat(incoming);
  else if (typeof incoming === 'string') decorators = deco.require.apply(deco, args);
  else throw new Error('Indecipherable arguments.');
  // Validate.
  if (decorators.some(isNotFunction)) throw new Error('Encountered non-function decorator.');

  return decorators;
}
// __Module Definition__
var deco = module.exports = function deco () {
  // Decorators to be applied to each newly constructed object.
  var decorators = parse(arguments);
  // Default constructor hash.
  var defaults = {};
  // Internal private data.
  var internal = {};
  // Protect is protected instance data
  var Constructor = function (incoming, protect) {
    // The object to be decorated.
    var o;
    // Incoming constructor options merged with defaults.
    var merged;
    // Constructor options that have been overwritten by a decorator.
    var overwritten;
    // Store values of properties.
    var properties = {};
    // Store values of multiproperties.
    var multi = {};
    // If `this`, the object to be decorated, has already been set it means
    // the object that is being decorated is already created. (It will be set to
    // `global` if not, thus creating the danger associated with the `new`
    // keyword, and its accidental omission.)
    if (this !== global && this !== internal.container) o = this;
    // If it hasn't been set yet, check for a factory function.
    else if (internal.factory) o = internal.factory(arguments);
    // Otherwise, construct the object to be decorated.
    else o = Object.create(Constructor.prototype);
    // Allow clean up of arguments, so that initial constructor call can be anything.
    if (internal.sanitize) {
      incoming = internal.sanitize.apply(undefined, arguments);
      protect = undefined;
    }
    // Default protected instance values.
    if (!protect) {
      protect = {
        options: function (newOptions) {
          overwritten = deco.merge(overwritten || defaults, newOptions);
        },
        property: function (name, initial, f) {
          function getter () {
            // Getter with transform.
            if (typeof initial === 'function') {
              return initial.bind(o)(properties[name]);
            }
            // Vanilla getter.
            return properties[name] === undefined ? initial : properties[name];
          }
          function setter (value) {
            if (f) properties[name] = f.bind(o)(value);
            else properties[name] = value;
            return o;
          }
          // Can't redefine properties.
          if (o[name]) {
            throw new Error('A property with the name "' + name + "' was already added to this object.")
          }
          // Set the initial value.
          if (typeof initial !== 'function') properties[name] = initial;
          // Define the property.
          o[name] = function (value) {
            if (arguments.length === 1) return setter(value);
            return getter();
          };
        },

        // o.name('a b c', val) -> store[a,b,c] = val;
        // o.name('a') -> store[a];
        // o.name() -> ['a', 'b']; // active ones
        multiproperty: function (name, keys, initial, action) {
          var store = multi[name] = {};
          if (o[name]) {
            throw new Error('A property with the name "' + name + "' was already added to this object.")
          }
          // Add the property to the controller.
          var f = o[name] = function (items, cargo) {
            // get the stores value
            function getter (key) {
              if (key.match(/\s/)) throw new Error('Can only specify one item when getting');
              var r = store[key];
              if (r === undefined) return initial;
              return r;
            }
            function setter () {
              items.split(/\s+/g).filter(function (v) { return v }).forEach(function (item) {
                store[item] = action ? action(cargo) : cargo;
              });
              return o;
            }
            // If one argument was passed, return the value for that item.
            if (arguments.length === 1) return getter(items);
            // If two arguments were passed, update the items with the cargo.
            else if (arguments.length === 2) return setter();
            // Otherwise, return a list of defined items.
            else return Object.keys(store).filter(getter);
          };

          if (keys) f(keys, initial);
          return o;
        }
      };
    }
    // Initialize the incoming constructor options, if necessary.
    if (incoming === undefined || incoming === null) incoming = {};
    // Merge the incoming options with any defaults, if they're a hash.
    if (typeof incoming === 'object') merged = deco.merge(defaults, incoming);
    // If the constructor inherits, call the super constructor on the object
    // to be decorated.
    if (Constructor.super_) Constructor.super_.call(o, incoming);
    // Apply decorators.
    decorators.forEach(function (decorator) {
      decorator.call(o, overwritten || merged || incoming, protect);
    });
    // The object has been created and decorated.  Done!
    return o;
  };

  Constructor.sanitize = function (f) {
    internal.sanitize = f;
    return Constructor;
  };

  Constructor.decorators = function () {
    decorators = decorators.concat(parse(arguments));
    return Constructor;
  };

  Constructor.defaults = function (incoming) {
    defaults = deco.merge(defaults, incoming);
    return Constructor;
  };

  Constructor.inherit = function (super_) {
    util.inherits(Constructor, super_);
    return Constructor;
  };

  Constructor.factory = function (factory) {
    internal.factory = factory;
    return Constructor;
  };

  Constructor.container = function (container) {
    internal.container = container;
    return Constructor;
  };

  return Constructor;
};

// __Public Module Members__

deco.merge = function (defaults, incoming) {
  // TODO make this except 0 or more arguments.
  var keys;
  var merged = {};

  if (!defaults) defaults = {};
  if (!incoming) incoming = {};

  keys = Object.keys(defaults).concat(Object.keys(incoming));
  keys.forEach(function (key) {
    merged[key] = incoming[key] === undefined ? defaults[key] : incoming[key];
  });

  return merged;
};

deco.require = function () {
  var decoratorFor = requireindex.apply(requireindex, arguments);
  var decorators = Object.keys(decoratorFor).map(getValue.bind(decoratorFor));
  decorators.hash = decoratorFor;
  return decorators;
};

// __Built-In Decorators__
deco.builtin = {};

// A decorator that calls `.set` on each constructor options argument.
// Useful with Express apps.
deco.builtin.setOptions = function (options) {
  var that = this;
  Object.keys(options).forEach(function (key) {
    var value = options[key];
    that.set(key, value);
  });
};
