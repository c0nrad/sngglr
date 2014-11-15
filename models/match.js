'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var matchTypes = ['yes', 'maybe'];

var MatchSchema = new Schema({
  matchType: {type: String, default: 'yes', enum: matchTypes },
  ts: {type: Date, default: Date.now},

  users: [{
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    name: {type: String },
    seen: {type: Boolean, default: false}
  }]

});

module.exports = mongoose.model('Match', MatchSchema);
