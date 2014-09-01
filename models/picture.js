var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PictureSchema = new Schema({
  url: String,
  z: { type: Number, default: 0 },
  ts: {type: Date, default: Date.now },

  user: { type: Schema.ObjectId, ref: 'User'}
});

module.exports = mongoose.model('Picture', PictureSchema);
