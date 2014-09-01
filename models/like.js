'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var likeTypes = ['yes', 'maybe', 'no'];

var LikeSchema = new Schema({
  liker: {
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    name: {type: String }  
  },
  likee: {
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    name: {type: String }  
  },
  dateLiked: { type: Date, default: Date.now},
  likeType: { type: String, enum: likeTypes }
});

module.exports = mongoose.model('Like', LikeSchema);