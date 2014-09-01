// Baucis examples using jQuery
// ============================

(function () {
  // Fetch an entity by ID
  $.getJSON('/api/vegetables/4f4028e6e5139bf4e472cca1', function (data) {
    console.log('Fetch an entity:');
    console.log(data);
  });

  // POST a new entity to the vegetables collection
  $.ajax({
    type: 'POST',
    dataType: 'json',
    contentType : 'application/json',
    url: '/api/vegetables',
    data: JSON.stringify({
      name: 'carrot',
      color: 'orange'
    })
  }).done(function (vegetable) {
    // The new document that was just created
    console.dir(vegetable);
  });

  // Requests to the collection (not its members) take standard MongoDB query parameters to filter the documents based on custom criteria.
  $.ajax({
    type: 'GET',
    dataType: 'json',
    url: '/api/vegetables',
    contentType : 'application/json',
    data: JSON.stringify({
      limit: 2,
      sort: 'color',
      conditions: {
        color: 'red',
        'nutrition.sodium': { $lte: 10 }
      },
      populate: [
        {
          path: 'child1',
          select: ['fieldA', 'fieldB'],
          match: {
            'foo': { $gte: 7 }
          },
          options: { limit: 1 }
        },
        {
          path: 'child2',
          select: '-_id color nutrition'
        }
      ]
    })
  }).done(function (vegetables) {
    console.dir(vegetables);
  });

})();
