'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    crypto = require('crypto'),
    _ = require('underscore');

var authTypes = ['github', 'twitter', 'facebook', 'google'];
var genders = 'male female'.split(' ');
var lookings = 'male female both'.split(' ');
var activities = 'coffee snuggle sex'.split(' ');

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

  confirmed: {type: Boolean, default: true},

  lastLogin: {type: Date, default: Date.now},
  lastActivity: {type: Date, default: Date.now },
  firstLogin: {type: Date, default: Date.now },

  hashedPassword: {type: String, selected: false},
  provider: String,
  salt: String,

  phone: { type: String, defualt: '' },
  notifications: {
    onLike: {
      email: { type: Boolean, default: false },
      sms: { type: Boolean, default: true }
    },
    onMatch: {
      email: { type: Boolean, default: false },
      sms: {type: Boolean, default: true }
    },
    onChat: {
      email: { type: Boolean, default: false },
      sms: {type: Boolean, default: true }
    }
  }
});

UserSchema.set('toJSON', {
  transform: function(doc, ret) {
    return _.pick(ret, '_id', 'name', 'email', 'role', 'gender', 'looking', 'bio', 'activity', 'lastLogin', 'lastActivity', 'firstLogin', 'dateAdded', 'phone', 'notifications', 'confirmed');
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

// Public profile information
UserSchema
  .virtual('profile')
  .get(function() {
    return {
      'name': this.name,
      'role': this.role
    };
  });

/**
 * Validations
 */

// Validate empty email
UserSchema
  .path('email')
  .validate(function(email) {
    // if you are authenticating by any of the oauth strategies, don't validate
    if (authTypes.indexOf(this.provider) !== -1) {
      return true;
    }
    return email.length;
  }, 'Email cannot be blank');

// Validate empty password
UserSchema
  .path('hashedPassword')
  .validate(function(hashedPassword) {
    // if you are authenticating by any of the oauth strategies, don't validate
    if (authTypes.indexOf(this.provider) !== -1) {
      return true;
    }

    return hashedPassword.length;
  }, 'Password cannot be blank');

// Validate email is not taken
UserSchema
  .path('email')
  .validate(function(value, respond) {
    var self = this;
    this.constructor.findOne({email: value}, function(err, user) {
      if(err) {
        throw err;
      }
      if(user) {
        if(self.id === user.id) {
          return respond(true);
        }
        return respond(false);
      }
      respond(true);
    });
}, 'The specified email address is already in use.');

var validatePresenceOf = function(value) {
  return value && value.length;
};

/**
 * Pre-save hook
 */
UserSchema
  .pre('save', function(next) {
    if (!this.isNew) {
      return next();
    }

    if (!validatePresenceOf(this.hashedPassword) && authTypes.indexOf(this.provider) === -1) {
      next(new Error('Invalid password'));
    } else {
      next();
    }
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
