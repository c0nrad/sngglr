var env = require('node-env-file');

var fs = require('fs');

if (fs.existsSync(__dirname + '/.env')) {
  env(__dirname + '/.env');
}
