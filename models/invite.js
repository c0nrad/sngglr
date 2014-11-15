var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var InviteSchema = new Schema({
  email: String,
  ts: {type: Date, default: Date.now},
  from: {type: Schema.Types.ObjectId, ref: 'User'}
});

module.exports = mongoose.model('Invite', InviteSchema);
