'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var uuid = require('node-uuid');

function genUUID() {
  return uuid.v4();
}

var ConfirmationSchema = new Schema({
  user: {type: Schema.Types.ObjectId, ref: 'User'},
  token: {type: String, default: genUUID }
});

module.exports = mongoose.model('Confirmation', ConfirmationSchema);
