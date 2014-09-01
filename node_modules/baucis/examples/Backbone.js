// Baucis examples using Backbone
// ==============================

(function () {

  // A utility function for easily making requests to a Baucis API.  Supply Baucis
  // options such as `select` or `populate` in the first parameter, and regular
  // Backbone fetch options as the second parameter.
  function baucisFetch (options, fetchOptions) {
    fetchOptions = _.clone(fetchOptions || {});
    fetchOptions.data = {};

    if (options) {
      Object.keys(options).forEach(function (key) {
        var value = options[key];
        if (typeof value === 'object') fetchOptions.data[key] = JSON.stringify(value);
        else fetchOptions.data[key] = value;
      });
    }

    return this.fetch(fetchOptions);
  };

  // Set up URLs and add baucis fetch method for models/collections
  var Vegetables = Backbone.Collection.extend({
    url: '/vegetables',
    baucis: baucisFetch
  });

  var Vegetable = Backbone.Model.extend({
    urlRoot: '/vegetables',
    baucis: baucisFetch
  });

  // Instantiate a collection and a couple models
  var vegetables = new Vegetables();
  var tomato = new Vegetable({ _id: 'abcdabcdabcdabcd' });
  var potato = new Vegetable({ name: 'Potato' });

  // Make some requests and print out the results

  // Fetch red vegetables, setting a few options
  vegetables.baucis(
    {
      conditions: { color: 'red' },
      populate: 'child',
      skip: 20,
      limit: 10,
      sort: 'foo -bar'
    },
    {
      silent: true
    }
  ).then(function () {
    console.log('Fetched Collection:');
    console.dir(vegetables.toJSON());
  });

  // Fetch the model's data based on ID, but select only the `bar` field
  tomato.baucis({
    select: '-_id bar'
  }).then(function () {
    console.log('Fetched Entity:');
    console.dir(tomato.toJSON());
  });

  // Save a new vegetable
  potato.save().then(function () {
    console.log('Saved a potato:');
    console.dir(potato.toJSON());
  });

})();
