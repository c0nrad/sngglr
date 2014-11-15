'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var uuid = require('node-uuid');
var moment = require('moment');

function genUUID() {
  return uuid.v4();
}

function plusHour() {
  return moment().add(1, 'hour').toDate();
}

var ResetSchema = new Schema({
  token: {type: String, default: genUUID},
  validTill: {type: Date, default: plusHour},
  user: {type: Schema.Types.ObjectId, ref: 'User'}
});

module.exports = mongoose.model('Reset', ResetSchema);
