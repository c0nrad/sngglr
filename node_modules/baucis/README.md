# baucis v1.0.0-candidate.10

Baucis enables you to build scalable REST APIs using the open source tools and standards you and your team already know.  Like Baucis and Philemon of old, the module provides REST to the weary traveler.  [Baucis](https://en.wikipedia.org/wiki/Baucis_and_Philemon) is not the same as [Bacchus](https://en.wikipedia.org/wiki/Dionysus).

Baucis is used in production by startups, departments, and at least one Fortune 500 company, not to mention at hackathons and conferences worldwide.  The current stable version is v0.20.5.  Lots of goodness is around the corner in v1.0.0!

Baucis is now compatible with Express 4!

If you like Baucis, [please consider tipping](https://www.gittip.com/wprl/).

The official baucis documentation is being moved to [kun.io/baucis](http://kun.io/baucis) but is still right here for the moment!


## Features

 * Awesomely scalable.  Takes full advantage of the inherent power of Node.js and MongoDB.
 * Fully takes advantage of Node streaming to nimbly process large datasets (both incoming and outgoing)
 * Automatically build APIs through reflection of your Mongoose schemata.
 * Built on Express 4 so adding custom middleware is a snap.  100% compatible with existing middleware such as passport.
 * Supports geolocation and full text search.
 * Highly customizable, simple interface.  Can be extended with plugins.
 * Automatically generate interactive Swagger documentation for the API.
 * Perform rich queries of the API using an expressive JSON syntax via query string.
 * Mongoose middleware, inheritence, and validation methods are automatically respected.
 * Version your API using semver.
 * Over 140 Mocha.js tests.


### Coming Soon

 * Real time browser/client [subscription with EventSource](https://github.com/wprl/baucis-subscribe) (server sent events)
 * [Web hooks](https://github.com/wprl/baucis-hooks)

Check the [change log](CHANGES.md) for info on all the latest features.


## Examples

 * [Example REST API server built with Node and Baucis](//github.com/wprl/baucis-example)
 * [Examples with Backbone.js](examples/Backbone.js)
 * [Examples with AngularJS](examples/angular-example-resource.html)
 * [Examples with Restangular](examples/angular-example-restangular.html)
 * [Examples with jQuery](examples/jQuery.js)
 * [mongoose-administration-example](https://www.npmjs.org/package/mongoose-administration-example)


![David Rjckaert III - Philemon and Baucis Giving Hospitality to Jupiter and Mercury](http://github.com/wprl/baucis/raw/master/david_rijckaert_iii-philemon_and_baucis.jpg "Hermes is like: 'Hey Baucis, don't kill that goose.  And thanks for the REST.'")

*David Rijckaert - Philemon and Baucis Giving Hospitality to Jupiter and Mercury*



## Getting Started


To install:

    npm install --save baucis

An example of creating a REST API from a couple Mongoose schemata.

``` javascript
// Create a mongoose schema.
var Vegetable = new mongoose.Schema({ name: String });
// Register new models with mongoose.
mongoose.model('vegetable', Vegetable);
// Create a simple controller.  By default these HTTP methods
// are activated: HEAD, GET, POST, PUT, DELETE
baucis.rest('vegetable');
// Create the app and listen for API requests
var app = express();
app.use('/api', baucis());
app.listen(80);
```

Later, make requests:

| HTTP Verb     | /vegetables   | /vegetables/:id |
| ------------- | ------------- | --------------- |
| GET           | Get all documents, or documents that match the query conditions. | Get the addressed document. |
| POST          | Creates new documents and sends them back.  You can POST a single document or an array of documents.      | n/a |
| PUT           | n/a | Update the addressed document. |
| DELETE        | Delete all documents, or documents that match the query conditions. | Delete the addressed object. |
| HEAD          | Check what headers would be sent for the given GET request. | Check what headers would be returned for the instance. |


## baucis.rest


`baucis.rest` creates a new controller associated with a given model.

You can pass in a mongoose model name:

``` javascript
var controller = baucis.rest('robot');
```

Or, pass in a Mongoose model:

``` javascript
var controller = baucis.rest(mongoose.model('robot'));
```

Calling `baucis.rest` also adds the newly created controller to the current API.  When `baucis()` is called, the API is finalized and any subsequent controllers will be added to another API instance.

```javascript
// Creating the first API.
baucis.rest('legume');
var api = baucis();
// Creating another API.
baucis.rest('tuber');
var api2 = baucis();
```

Controllers also have the ususal Express features.  Controllers are Express 4 `Routes`.

``` javascript
// Add middleware before API routes
controller.use('/qux', function (request, response, next) {
  // Do something cool…
  next();
});

controller.get('/readme', function (request, response, next) {
  // Send a readme document about the resource (for example)
  next();
});

// Do other stuff...
controller.set('some option name', 'value');
controller.listen(3000);
```

Customize them with Express middleware, including pre-existing modules like `passport`.

Baucis also adds controller the `request` and `query` methods to interact with the baucis interal Mongoose query.  **(See the [middleware section](#middleware).)**

``` javascript
controller.request(function (request, response, next) {
  if (request.isAuthenticated()) return next();
  return response.send(401);
});
```

##Controllers

### controller.model

This property sets the controller's mongoose model.  You can pass in a string or a directly pass in a mongoose model.

``` javascript
controller.model('cheese');
```

### controller.select

Select or deselect fields for all queries.

``` javascript
controller.select('field -password');
controller.select('+groats');
```

Note that mixing inluding and excluding fields causes an error.

### controller.relations

By default the response Link header is set with various useful links based on context.  This is especially useful for paging.  May be disabled using this method.

``` javascript
controller.relations(false);
```

### controller.findBy

The unique path used to identify documents for this controller.  Defaults to `_id`.

``` javascript
controller.findBy('name');
```

### controller.hints

Allow sending an index hint for the query from the client.  Disabled by default.

``` javascript
controller.hints(true);
```

### controller.comments

Allow sending a query comment from the client.  Disabled by default.

``` javascript
controller.comments(true);
```

### controller.methods

Used to disable specific HTTP methods for the controller.

``` javascript
controller.methods('post put delete', false);
```

### controller.operators

**BYPASSES VALIDATION** Use this method to enable non-defualt update operators.  The update method can be set using the `Update-Operator` header field.

``` javascript
controller.operators('$push $set', 'foo some.path some.other.path');
controller.operators('$pull', 'another.path');
```

### controller.fragment

This is the fragment to match request URLs agains.  Defaults to the plural name of the model.

``` javascript
controller.fragment('/somewhere');
```

### controller.emptyCollection

This can be used to set what status code & body are returned for requests that yield empty query results.  The default is status code 200 with a JSON body containing an empty array.  Other possible options are 204 No Content and 404 Not Found.

``` javascript
controller.emptyCollection(200);
controller.emptyCollection(204);
controller.emptyCollection(404);
```

### controller.handleErrors

Baucis sets the response status code based on different errors.  By default, it also catches and builds responses for certain errors.  Set this to false to have the controller only set status codes, and not handle errors further.

``` javascript
controller.emptyCollection(false);
```


### controller.versions

Versioning is implemented using [semver](http://semver.org).  Supported releases are specified when calling `baucis()`.  The release(s) that a controller belongs to are specified with the `versions` controller option.

``` javascript
baucis.rest('cat').versions('0.0.1');
baucis.rest('cat').versions('>0.0.1 <1.0.0');
baucis.rest('cat').versions('~1');
baucis.rest('cat').versions('>2.0.0');
var api = baucis();
baucis().release('0.0.2').release('1.0.0').release('1.1.0').release('2.0.0')
app.use('/api', api);
```

Later, make requests and set the `API-Version` header to a [semver](http://semver.org) range, such as `~1`, `>2 <3`, `*`, etc.  Baucis will use the highest release number that satisfies the range.  If no `API-Version` is specified in a request, the highest release will be used.


## Streaming

Baucis takes full advantage of Node streams internally to offer even more performance, especially when dealing with large datasets.  Both outgoing and incoming documents are streamed!

To alter or inspect documents being sent or process, add a through stream that transforms or processes them.  As a shortcut, a map function can be passed in.  It will be used to create a map stream internally.  Here's an example of adding a stream to alter POST'd or PUT'd request bodies:

``` javascript
controller.request(function (request, response, next) {
  request.baucis.incoming(function (context, callback) {
    context.incoming.name = 'Feverfew';
    callback(null, context);
  });
  next();
});
```

For PUT requests, the document is available to the stream.  For POSTs `context.doc` will be set to `null`.

``` javascript
controller.request(function (request, response, next) {
  request.baucis.incoming(function (context, callback) {
    if (context.doc.created !== context.incoming.created) {
      callback(baucis.errors.Forbidden('The created date cannot be updated'));
      return;
    }
    callback(null, context);
  });
  next();
});
```

Passing in through streams is also allowed.  Here's an example using the [through module](https://www.npmjs.org/package/through) to create a stream that checks for a forbidden sort of whiskey and alters the name of incoming (POSTed) documents.

``` javascript
controller.request(function (request, response, next) {
  request.baucis.incoming(through(function (context) {
    if (context.incoming.whiskey === 'Canadian') {
      // Errors will be passed off to `next` later, and the stream will
      // be stopped.
      this.emit('error', baucis.errors.Forbidden('Too smooth.'));
      return;
    }
    context.incoming.name = 'SHAZAM';
    this.queue(context);
  }));
  next();
});
```

If `request.baucis.incoming` or `request.baucis.outgoing` is called multiple times, the multiple through streams will be piped together.

Here's an example of how a stream that interacts with outgoing documents may be added:

``` javascript
controller.request(function (request, response, next) {
  request.baucis.outgoing(through(function (context) {
    if (context.doc.owner !== request.user) {
      // Errors will be passed off to `next` later, and the stream will
      // be stopped.
      this.emit('error', baucis.errors.Forbidden());
      return;
    }
    delete context.doc.password;
    this.queue(context);
  }));
  next();
});
```

-----------

  * For POSTs, if `request.body` is present, the incoming request will be parsed as a whole, negating many of the benefits of streaming.  However, especially when POSTing only one new document at a time, this is not an issue.  If you want to POST many objects at once, using the default streaming behavior is highly recommened.
  * If you set `request.baucis.documents`, this will be streamed out instead of the Mongoose query results.
  * The document stage of middleware has been deprecated.  Use an outgoing through stream instead.


## Middleware


Baucis adds middleware registration functions for two stages of the request cycle:

### request

This stage of middleware will be called after baucis applies defaults based on the request, but before the Mongoose query is generated.

### query

This stage of middleware will be called after baucis applies defaults to the Mongoose query object, but before the documents are streamed out through the response.  The Mongoose query can be accessed and changed in your custom middleware via `request.baucis.query`.  Query middleware cannot be added explicitly for POST and will be ignored when added for POST implicitly.

### How to use baucis middleware

To apply middleware to all API routes, just pass the function or array to the method for the appropriate stage:

``` javascript
controller.request(function (request, response, next) {
  if (request.isAuthenticated()) return next();
  return response.send(401);
});

controller.query(function (request, response, next) {
  request.baucis.query.populate('fences');
  next();
});
```

To add middleware that applies only to specific HTTP methods, use the second form.  It adds a paramater that must contain a space delimted list of HTTP methods that the middleware should be applied to.

``` javascript
controller.query('head get', function (request, response, next) {
  request.baucis.query.limit(5);
  next();
});
```

The final form is the most specific.  The first argument lets you specify whether the middleware applies to document instances (paths like `/cheeses/:id`) or to collection requests (paths like `/cheeses`).

``` javascript
controller.request('instance', 'head get delete', middleware);
controller.request('collection', 'post', middleware);
```

## Swagger

Here's how to use swagger.  First, install the plugin:

    npm install --save baucis-swagger

Next, download the [swagger-ui](https://github.com/wordnik/swagger-ui) client.

    git clone git@github.com:wordnik/swagger-ui.git
    open swagger-ui/dist/index.html

Then, create your API as normal, but be sure to require `baucis-swagger`.

``` javascript
var baucis = require('baucis');
var swagger = require('baucis-swagger');
app.use('/api', baucis());
```

Point the swagger client at your API:

    http://localhost:8012/api/api-docs

Now you have documentation and a test client!

To customize the swagger definition, simply alter the controler's swagger data directly:

``` javascript
var controller = baucis.rest('sauce');

controller.swagger.apis.push({
  'path': '/sauces/awesome',
  'description': 'Awesome sauce.',
  'operations': [
    {
      'httpMethod': 'GET',
      'nickname': 'getAwesomeSauce',
      'responseClass': 'Sauce',
      'summary': 'Carolina BBQ Sauce.'
    }
  ]
});
```

## HTTP Headers

### Request

| Header Field | Notes |
| ------------ | ----- |
| API-Version | Set this to a valid semver range to request a specific version or range of versions for the requested controller. |
| Update-Operator | Use this to perform updates (that **BYPASS VALIDATION**) using a special update operator such as `$set`, `$push`, or `$pull`.  The fields that may be updated must be whitelisted per controller.

### Response


| Header Field | Notes |
| ------------ | ----- |
| ETag | Used for HTTP caching based on response body.  Supported automatically for single object endpoints. |
| Last-Modified | Used for HTTP caching.  Can be set automatically by Baucis for single object endpoints. |
| Accept | Set to `application/json` for all responses. |
| Allow | Set automatically, correctly removing HTTP methods when those methods have been disabled. |
| Location | Set to the URL of the created/edited entity for PUT and POST responses. |
| Link | Baucis adds related links to the header for you.  Especially useful for paging through a query.  `first`, `last`, `next`, and `previous` links are added when paging through a collection when using the `limit` & `skip` query options. |

## Query Options

Use query options from the client to make dynamic requests.  Query options can be mixed as you see fit.

### conditions

Set the Mongoose query's `find` or `remove` arguments.  This can take full advtange of the MongoDB query syntax, using geolocation, regular expressions, or full text search.  Special query operators are fine, and in fact geolocation, regular expression, and full text search capabilities are available to your API clients by default!

    GET /api/people?conditions={ "location": { "$near": [44, -97] } }
    GET /api/people?articles={ "summary": { "$text": "dog bites man" } }
    GET /api/cats?sort=-name&limit=1&conditions={ "features": "stripes" }
    DELETE /api/people?conditions={ "name": { "$regex": "^Bob W", $flags: "i" } }

### skip

Skip sending the first *n* matched documents in the response.  Useful for paging.

    GET /api/horses?skip=3

### limit

Limit the response document count to *n* at maximum.

    GET /api/horses?limit=3

If both limit and skip are used on a request, the response `Link` header will be set with extra relations that give URLs for paging.

### sort

Sort response documents by the given criteria. Here's how you'd sort the collection by `name` in ascending order, then by `age` in descending order.

    GET /api/cheeses?sort=name -age

### select

Set which fields should be selected for response documents.

    GET /api/phones?select=-_id -year

It is not permitted to use the `select` query option to select deselected paths.  This is to allow a mechanism for hiding fields from client software.

You can deselect paths in the Mongoose schema definition using `select: false` or in the controller by calling e.g. `controller.select('-foo')`.  Your server middleware will be able to select these fields as usual using `query.select`, while preventing the client from selecting the field.

Note that mixing inluding and excluding fields causes an error.

### populate

Set which fields should be populated for response documents.  See the Mongoose [population documentation](http://mongoosejs.com/docs/populate.html) for more information.  The string or object syntax can be used:

    GET /api/boats?populate=captain
    GET /api/cities?populate={ "path": "captain", "match": { "age": "44" } }

The `select` option of `populate` is disallowed.  Only paths deselected at the model level will be deselected in populate queries.

### count

May be set to true for GET requests to specify that a count should be returned instead of documents

    GET /api/stereos?count=true

### distinct

Set to a path name to retrieve an array of distinct values.

    GET /api/restaurants?distinct=category

### hint

Add an index hint to the query (must be enabled per controller).

    GET /api/pools?hint={ name: 1 }

### comment

Add a comment to a query (must be enabled per controller).

    GET /api/wrenches?comment=Something informative


## Models

Baucis decorates Mongoose models with a few additional methods to add richer textual and other semantics.  The Model API is ubstable.  It will be stablized for v1.0.0.

Typically, these methods would be called when the schema is registered with Mongoose:
``` javascript
mongoose.model('cactus', Cactus).plural('cacti');
mongoose.model('hen', Hen).locking(true);
```


### model.singular

Customize the name used for singular instances of documents associated with this model.
``` javascript
model.singular('cactus');
```


### model.plural

Customize the name used for groups of documents associated with this model.  Defaults to the plural of the model's singular name.  Uses Mongoose's pluralizer utility method.
``` javascript
model.plural('cacti');
```


### model.lastModified

Set the `Last-Modified` HTTP header using the given `Date` field.  Disabled by default.
``` javascript
model.lastModified('modified.date');
```


### model.locking

Enable optimistic locking.  (Disabled by default.)  Requires that all PUTs must send the document version (`__v` by default) and will send a 409 response if there would be a version conflict, instead of performing the update.
``` javascript
model.locking(true);
```


## Errors & Status Codes

Baucis supports a rich array of error responses and status codes. For more information on status codes see [RFC2616](http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html) the HTTP sepcification.

### 4xx

4xx status codes mean that the client, for example a web browser made a mistake and needs to fix the response.

#### 400 Bad Request

The client made a bad request and should fix the request before trying again.  This is also sent when a deprecated command is used.

    baucis.Error.BadRequest
    baucis.Error.BadSyntax
    baucis.Error.Deprecated

#### 403 Forbidden

Sent when the requested action is disallowed for a controller.

    baucis.Error.Forbidden;

#### 404 Not Found

Sent when the query does not match any document, or when the requested resource does not exist.

    baucis.Error.NotFound

#### 405 Method Not Allowed

The request HTTP method (i.e one of `HEAD`, `GET`, `POST`, `PUT`, `DELETE`) is disabled for this resource.  This can be done by e.g. `controller.methods('post put delete', false)`.

    baucis.Error.MethodNotAllowed

#### 406 Not Acceptable

The `Accept` header specified in the request could not be fulfilled.  By default JSON is supported.  Baucis is pluggable to allow adding formatters for additional content types.

    baucis.Error.NotAcceptable

#### 409 Conflict

If a controller has optimistic locking enabled, baucis will automatically check each updated document's version and give a 409 error if another API client modified the document before the requester was able to send their update.

In this case, a client could reload the document, present the user with a description of the conflict, and ask them how to procede.

    baucis.Error.LockConflict

#### 415 Unspported Media Type

The request body content type was not able to be parsed.  By default JSON is supported.  Baucis is pluggable to allow adding parsers for additional content types.

    baucis.Error.UnsupportedMediaType

#### 422 Unprocessable Entity

This status indicates the request body was syntactically correct and could be parsed, but that it is not semantically correct, and so it could not be processed.  Most often countered when a document's validation step fails.

    baucis.Error.UnprocessableEntity

Baucis will send a response body with error 422 that indicates what validation failed for which fields.
``` json
{
  "name": {
  "message": "Path `name` is required.",
  "name": "ValidatorError",
  "path": "name",
      "type": "required"
  },
  "score": {
  "message": "Path `score` (-1) is less than minimum allowed value (1).",
  "name": "ValidatorError",
  "path": "score",
  "type": "min",
      "value": -1
  }
}
```

Technically, this error is from [RFC4918](https://tools.ietf.org/html/rfc4918#section-11.2), the WebDAV specification.


### 5xx

Where as `4xx` errors mean the requester messed up, `5xx` errors mean the server messed up :)

#### 500 Internal Server Error

This means that baucis is misconfigured, or that the server tried to perform the requested action but failed.

    baucis.Error.Misconfigured

#### 501 Not Implemented

The requested functionality is not implemented now, but may be implented in the future.

    baucis.Error.NotImplemented


## Roadmap

### Q2 2014

 * v1.0.0 Release candidates
 * Refine & improve documentation
 * Benchmark
 * ~~Internal refactoring and simplification~~ *(completed)*
 * v1.0.0
 * Begin a cookbook-style guide with lots of code examples.
 * ~~Express 4~~ *(completed)*

### Q3 2014

 * Full `Accept` header field(s) semantics
 * Expand hypermedia support (in-band information)
 * Code-on-demand features?
 * More features & more plugins


## Extending Baucis

Baucis can be augmented via incoming and outgoing streams, as well as with decorators.

Add decorators to Controllers and other baucis constructors by using the `decorators` method.  Adding a decorator will affect all subsequently created controllers.  Here's how you could add a tiny plugin that makes all subsequently added controllers check authentication for all PUTs and POSTs.
``` javascript
baucis.Controller.decorators(function (options, protect) {
  var controller = this;
  controller.request('put post', function (request, response, next) {
    if (!request.isAuthenticated()) return next(new Error());
    next();
  });
});
```


## Plugins

|Module Name  |  |
|------------ | ----- |
|[baucis-access](https://github.com/hippich/baucis-access) | Configure read/write access on a per-attribute basis (created by Pavel Karoukin) |
|[baucis-swagger](https://www.npmjs.org/package/baucis-swagger) | automatically generate interactive API documentation (created by wprl)
|[bswagger](https://www.npmjs.org/package/bswagger) | alternative swagger package (created by j.sedlan)
|[baucis-gform](https://www.npmjs.org/package/baucis-gform) | Rapidly develop a administration UI for your baucis API (created by stemey)
|[baucis-vivify](https://www.npmjs.org/package/baucis-vivify) | Used for embedding controllers under a parent path (created by wprl)
|[baucis-patch](https://www.npmjs.org/package/baucis-patch) | created by wprl
|[baucis-json](https://www.npmjs.org/package/baucis-json) | created by wprl
|[baucis-error](https://www.npmjs.org/package/baucis-error) | created by wprl

*The `baucis-json` and `baucis-error` plugins are bundled with baucis by default.  `baucis-json` is a good example for writing your own plugins for parsing or formatting custom content types.*


##Contact

 * @wprl
 * https://linkedin.com/in/willprl
 * william@kun.io

&copy; 2012-2014 William P. Riley-Land
