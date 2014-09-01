'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ChatSchema = new Schema({
  to: {
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    name: {type: String }
  },
  from: {
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    name: {type: String }
  },
  match: {type: Schema.Types.ObjectId, ref: 'Match'},
  message: {type: String, default: 'Soop Brah' },
  ts: { type: Date, default: Date.now},
  dateSeen: { type: Date }
});

module.exports = mongoose.model('Chat', ChatSchema);
