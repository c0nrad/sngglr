# Baucis Change Log

## v1.0.0-candidate.10

Fix some typos.


## v1.0.0-candidate.9

Add more info about `baucis.rest` to the README.


## v1.0.0-candidate.8

Use caret for dependencies.  If you're using an older npm, let's talk about a fork or other migration path.


## v1.0.0-candidate.7

README tweaks.  More tests.


## v1.0.0-candidate.6

Minor tweaks.


## v1.0.0-candidate.5

Revisit all error conditions.  Make 422 error response body an array.


## v1.0.0-candidate.4

Fix issue #183.


## v1.0.0-candidate.3

Update baucis-error version.


## v1.0.0-candidate.2

Make 200 default for empty collection/search.  Split out baucis-errors and baucis-vivify.


## v1.0.0-candidate.1

Fix #149.  Fix #181.  Move handleErrors from Api to Controller.  Add parentController method.  Add emptyCollection method to controller.  It is set to 204 by defult, but can be set to 200, 204, or 404 to set how collection endpoint requests handle no matching documents per controller.


## v1.0.0-candidate.0

Use published version of baucis-json.


## v1.0.0-prerelease.9

Allow turning off error handling per API.  Fix #178.

    baucis().handleErrors(false);


## v1.0.0-prerelease.8

Correctly handle errors in user streams.  Improve error handling.  Fix #177.


## v1.0.0-prerelease.7

Rename `baucisPath` to `fragment`.  Use a decorator for Mongoose models, rather than a wrapper object.  Wrap `mongoose.model` to add decorator to all models.  Move `lastModified` and `locking` to model objects.


## v1.0.0-prerelease.6

Move parsers/formatters from Api to baucis object.


## v1.0.0-prerelease.5

Add PATENTS file.  A little more cleaning up.


## v1.0.0-prerelease.4

Remove `request.baucis.controller`.  Remove `controller.api`.


## v1.0.0-prerelease.3

Express 4!
del -> delete
Controller activation is no longer required (again)
API activation is not required
Controller properties can change at runtime, and the API will now reflect those changes
Remove X-Powered-By for all baucis routes


## v1.0.0-prerelease.2

Merge to master and make small update to the README.


## v1.0.0-prerelease.1

Add Model.  Change X-Baucis-Update-Operator to Update-Operator.  Begin refactoring Api into smaller decorators.


## v0.20.5

Update to the latest baucis-json.  Fixes an issue where POSTing or PUTing some kinds of malformed JSON bodies could crash the instance.  Now sends a 400 Bad Request for malformed JSON.  Fix #168


## v0.20.4

Check additional opportunities to send 400 Bad Request.


## v0.20.3

README improvements.


## v0.20.2

Fix bug that overwrote Express' parent property.  Please use the `controller.children` property instead.  (Fixes #161.)


## v0.20.1

Fix publish and some typos.


## v0.20.0

Add `controller.vivify` method for embedding subcontrollers.  Deprecate `basePath` controller option.  Update configuration to "methods over values."  Move baucis errors from `baucis.errors` to `baucis.Error`.  Enable relations by default.  Improve & update README.


## v0.19.2

Handle duplicate key error as a 422.  (Fix #160).


## v0.19.1

Fix #159.


## v0.19.0

Add context to incoming and outgoing user streams. (Fix #151).


## v0.18.4

Internal refactor to use protected pipeline method for internal as well as external stream interfaces.


## v0.18.3

Update to use the latest `baucis-json`.


## v0.18.2

Don't try to set the Last-Modified header if the feature isn't enabled (fix #157).


## v0.18.1

Fix an issue where the request's content type would not be recognized when it used a MIME type parameter. (#152)


## v0.18.0

Use the mongoose `toCollectionName` util method, instead of the lingo module.


## v0.17.0

Deprecate `documents` stage of middleware.


## v0.16.21

Update dependency for deco.


## v0.16.20

Updated outdated dependencies.


## v0.16.19

Improve error messages, correct some status codes, fix issue #147.


## v0.16.18

Discriminators - correctly handle POST.  The correct model is used based on the `__t` that is passed in the request body.


## v0.16.17

Use tilde instead of caret so older npms don't fall over!


## v0.16.16

Move JSON parser and formatter to a separate module.


## v0.16.15

Fix outdated require.


## v0.16.14

Add distinct request query option.


## v0.16.13

Fix missing dependency on event-stream.


## v0.16.12

Send 415 on unparseable request content type.  Also added experimental `Api.setParser` method.


## v0.16.11

Ensure 406 is sent on requests with Accept header that cannot be fulfilled.  Fix bug with calling `api.setFormatter`.


## v0.16.10

Allow passing in map function to incoming/outgoing user streams.  It's turned into a stream internally.


## v0.16.9

Add experimental `Api.setFormatter` method.


## v0.16.8

Fix incorrect Accept header.


## v0.16.7

Allow passing in a mongoose model to the `model` controller option, in addition to string name.


## v0.16.6

Update dependency for Express to 3.5.


## v0.16.5

Fix issue #142.  Also, use event-stream over highland.


## v0.16.4

Fix issue #141


## v0.16.3

Fix issue #131


## v0.16.2

Add documentation for streaming and clean up documentation.


## v0.16.1

Republish failed `npm publish`.


## v0.16.0

Streamy goodness!  Documentation will be updated for v0.16.2.  Things are in flux...


## v0.16.0-alpha

Stream documents to manage resources more efficiently.  (Performance tests forthcoming.)

The documentation has not been updated yet... public interface subject to change.  Suggestions welcome!


## v0.15.1

Send a descriptive body for validation errors.


## v0.15.0

Send 422 on validation error.


## v0.14.2

Remove stale calls to `connect.utils.merge`.


## v0.14.1

Update to use latest `deco` features.  Other additional refactoring.


## v0.14.0

Add support for external decorator plugins and move swagger support to its own module.

    npm install --save baucis-swagger


## v0.13.0

Allow setting `model` for controller, separately from `singular`.  This way, model name and controller path are not coupled.


## v0.12.3

Add dependency on connect for `connect.utils`.  (Special thanks to lcalvy.)


## v0.12.2

Fix issue #107.  (Special thanks to stemey.)


## v0.12.1

Fix issue #108.  (Special thanks to stemey.)


## v0.12.0

Major internal refactor!

Controller version range is now specified with the `versions` key on `baucis.rest`.

Controllers no longer need to be initialized.


## v0.11.0

Add API versioning using the `API-Version` header.


## v0.10.5

Send 405 when DELETE is disabled on a controller.  (Special thanks to lukaszfiszer.)


## v0.10.4

Fix a bug where Accept used "DEL" instead of "DELETE."  Fix another bug where ETag was not sent for HEAD requests.  (Special thanks to lukaszfiszer.)


## v0.10.3

Don't change status to 204 for HEAD requests.  (Special thanks to lukaszfiszer.)


## v0.10.2

Send 204 when no content.


## v0.10.1

Improvements to optimistic locking.  Adds the 'locking' controller option.  When set to true, this option enables *automatic* version increments and strict version checking.  When enabled, `__v` must always be sent with updates, and the baucis query must always have the `__v` key selected.

If this option is not enabled, no extra lock checking or version incrementing is performed outside what is normally done by Mongoose.

The 'always check version' controller option has been deprecated.


## v0.10.0

Deprecated


## v0.9.4


Fix an issue where remove middleware wasn't called.  Special thanks to lukaszfiszer!


## v0.9.3


Set X-Powered-By to baucis for baucis routes


## v0.9.2


Don't list "sort" query parameter for plural endpoints.


## v0.9.1

Custom swagger definitions — add an example to the README.


## v0.9.0


`controller.addSwaggerApi` has been destroyed in favor of exposing the controller Swagger APIs and models at `controller.swagger.apis` and `controller.swagger.models`.  These may be modified directly to change the genereated Swagger definitions.


## v0.8.0

More Swagger!

Add custom API definitions to a controller with `controller.addSwaggerApi`.  Other minor Swagger fixes.


## v0.7.0

Add support for hint and comment.  Enable them like so:

    baucis.rest({
      singular: 'fish',
      'allow hints': true,
      'allow comments': true
    });

Note: I decided to be more strict with implementing semver.  Minor version will be increasing with each new feature and patch number will be increased with bug fixes and misc. patches.


## v0.6.29

Fix issue #86 which caused request.baucis.controller to sometimes be set incorrectly.


## v0.6.28

Fix dependecy on async


## v0.6.27

Fix an issue where POST middleware could be called at query stage


## v0.6.26

Fix tests for latest version of Mongoose & Express


## v0.6.25

Respond with 400 for requests with malformed IDs.  Respond with 405 for disabled verbs.


## v0.6.24

Adds default support for form POST (`application/x-www-form-urlencoded`).  Also allows use of default Express request query string parser (`conditions[name]=Tomato`), in addition to the JSON string format that is supported.


## v0.6.23

Adds `request.baucis.controller`.  This also fixes issue #76 that was occurring with newer Express versions when they were used as a peer dependency.


## v0.6.22

Move Express to peer dependency.


## v0.6.21


Fix an issue where the `Location` response header would be set incorrectly.  Special thanks to feychenie.


## v0.6.20


Fix an issue with swagger when using models with hyphenated names.  Special
thanks to feychenie.


## v0.6.19


Better error handling when detecing selected fields when populating via query.


## v0.6.18


Fixes issue #72.  The `Location` header is now only set for POST responses.
This fixes the related issue of response headers being too large when doing
GET requests that return a large number of documents.


## v0.6.17


Fixes a bug in v0.6.16 that could allow deselected paths to be sent back in the
response body of a POST request.


## v0.6.16


Fixes issue #67


## v0.6.15


Allow support for $pull, and $set
  * Deprecates X-Baucis-Push
  * Enables X-Baucis-Update-Operator
  * By default, a mongoose document is updated using `doc.set` then `doc.save`.
  * When the X-Baucis-Update-Operator is set, `findOneAndUpdate` is used
  * *THIS BYPASSES VALIDATION*
  * Operators must be enabled per-controller
  * Supported operators are currently: `$set`, `$pull`, and `$push`.
  * Now positional $ can be used with `$set`!
  * Fields must be whitelisted by setting the appropriate controller option (notice additional $ character)

      var controller = baucis.rest({
        singular: 'arrbitrary',
        'allow $push': 'arr.$.pirates',
        'allow $pull': 'arr.$.pirates'
      });

      // Later...

      // PUT /api/arbitraries/1234567890abcdef12345678?conditions={ "arr.flag": "jolly roger" }

      // X-Baucis-Update-Operator: $push

      // BODY

      //   { "arr.$.pirates": { name: 'Blue beard' } }

      // Blue beard's dead, pull him from the array

      // PUT /api/arbitraries/1234567890abcdef12345678?conditions={ "arr.flag": "jolly roger" }

      // X-Baucis-Update-Operator: $pull

      // BODY

      //   { "arr.$.pirates": { name: 'Blue beard' } }



## v0.6.14


Add examples for AngularJS.  Contributed by Illniyar.


## v0.6.13


Allow pushing to embedded arrays using positional $
  * Validation is ignored
  * Paths with positional $ must be whitelisted
  * Embedded array must be specified in the conditions query parameter

      var controller = baucis.rest({
        singular: 'arbitrary',
        'allow push': 'arr.$.pirates'
      });

      // Later...

      // PUT /api/arbitraries/1234567890abcdef12345678?conditions={ "arr.flag": "jolly roger" }

      // X-Baucis-Push: true

      // BODY

      //   { "arr.$.pirates": { name: 'Blue beard' } }


## v0.6.12


Added X-Baucis-Push header for PUTs
 * Setting this uses $push on the body rather than $set for the update
 * Validation is ignored
 * Feature must be enabled per-controller
 * Fields must be whitelisted by setting the 'allow push' controller option, e.g.

    var controller = baucis.rest({
      singular: 'arbitrary',
      'allow push': 'field some.path some.other.path'
    });
