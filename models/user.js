'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    crypto = require('crypto'),
    _ = require('underscore');

var authTypes = ['github', 'twitter', 'facebook', 'google'];
var genders = 'male female'.split(' ');
var lookings = 'male female both'.split(' ');
var activities = 'coffee snuggle sex'.split(' ');
var standings = 'freshman sophomore junior senior senior+'.split(' ');

/**
 * User Schema
 */
var UserSchema = new Schema({
  name: { type: String, default: 'Anon' },
  email: { type: String, lowercase: true },
  role: { type: String, default: 'user' },
  gender: { type: String, default: 'female', enum: genders },
  looking: { type: String, default: 'both', enum: lookings },
  bio: { type: String, trim: true, default: 'I\'m awesome!' },
  activity: {type: String, default: 'snuggle', enum: activities},
  standing: {type: String, default: 'freshman', enum: standings},

  confirmed: {type: Boolean, default: false},

  lastLogin: {type: Date, default: Date.now},
  lastActivity: {type: Date, default: Date.now },
  firstLogin: {type: Date, default: Date.now },

  hashedPassword: {type: String, selected: false},
  provider: String,
  salt: String,

  phone: { type: String, defualt: '' },
  notifications: {
    onMatch: {
      email: { type: Boolean, default: false },
      sms: {type: Boolean, default: true }
    },
    onChat: {
      email: { type: Boolean, default: false },
      sms: {type: Boolean, default: false }
    }
  }
});

UserSchema.set('toJSON', {
  transform: function(doc, ret) {
    return _.pick(ret, '_id', 'name', 'email', 'role', 'gender', 'looking', 'standing', 'bio', 'activity', 'lastLogin', 'lastActivity', 'firstLogin', 'dateAdded', 'phone', 'notifications', 'confirmed');
  }
});

/**
 * Virtuals
 */
UserSchema
  .virtual('password')
  .set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function() {
    return this._password;
  });

// Basic info to identify the current authenticated user in the app
UserSchema
  .virtual('userInfo')
  .get(function() {
    return {
      'name': this.name,
      'role': this.role,
      'provider': this.provider
    };
  });

/**
 * Methods
 */
UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate: function(plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */
  makeSalt: function() {
    return crypto.randomBytes(16).toString('base64');
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  encryptPassword: function(password) {
    if (!password || !this.salt) {
      return '';
    }
    var salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
  }
};

module.exports = mongoose.model('User', UserSchema);
