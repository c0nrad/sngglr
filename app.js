'use strict';

console.log(__dirname);

var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multipart = require('connect-multiparty');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var session = require('express-session');
var mongoStore = require('connect-mongo')(session);

var mongoose = require('mongoose');
var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/sngglr';

mongoose.connect(mongoUri);

// Load Models
require('./models/index');
var User = mongoose.model('User');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(multipart({
  uploadDir: __dirname + '/tmp'
}));


// Persist sessions with mongoStore
app.use(session({
  secret: 'i4m41337h4x0r??',
  store: new mongoStore({
    url: mongoUri,
    collection: 'sessions'
  }, function () {
  })
}));

// Use passport session
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {
  if (req.user) {
    User.update({_id: req.user._id}, {$set: {lastActivity: new Date() }}, function(err) {
      if (err) {
        console.log(err);
      }
    });
  }
  next();
});

// Load routes
var api = require('./routes/api');


app.use('/', api);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
      console.log("ERROR HANDLE!");
        res.status(err.status || 400);
        console.error(err);
        res.send(err);
    });
}


/**
 * Passport configuration
 */
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findOne({
    _id: id
  }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
    done(err, user);
  });
});

// add other strategies for more authentication flexibility
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password' // this is the virtual field on the model
  },
  function(email, password, done) {
    User.findOne({
      email: email.toLowerCase()
    }, function(err, user) {
      if (err) {
        return done(err);
      }

      if (!user) {
        return done(null, false, {
          message: 'This email is not registered.'
        });
      }
      if (!user.authenticate(password)) {
        return done(null, false, {
          message: 'This password is not correct.'
        });
      }
      return done(null, user);
    });
  }
));


module.exports = app;
