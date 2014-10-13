'use strict';

var twilio = require('twilio');

var secrets = {
  twilioSid: process.env.twilioSid,
  twilioAuth: process.env.twilioAuth,
  twilioNumber: process.env.twilioNumber,

  gmailEmail: process.env.gmailEmail,
  gmailPassword: process.env.gmailPassword,

  smsOn: process.env.smsOn,
  emailOn: process.env.emailOn
};

var client = new twilio.RestClient(secrets.twilioSid, secrets.twilioAuth);
var number = secrets.twilioNumber;

var sendgrid  = require('sendgrid')(process.env.SENDGRID_USERNAME, process.env.SENDGRID_PASSWORD);

exports.email = function(to, subject, body, next) {
  console.log(to, subject, body);
  sendgrid.send({
    to:       to,
    from:     'admin@sngglr.com',
    subject:  subject,
    text:     body
  }, function(err, json) {
    if (err) { return console.error(err); }
    console.log(json);
    next(err, json);
  });

};



exports.sms = function(to, body, next) {
  console.log('sms', to, body);

  if (to === undefined || to === null || typeof to !== 'string' || to.length < 7) {
    return next(null, 'Invalid phone number');
  }

  if (secrets.smsOn) {
    client.sms.messages.create({
      to: to,
      from: number,
      body: body
    }, next);
  } else {
    next(null, 'twilio off');
  }
};

exports.resetEmail = function(token) {
  return '' +
  'Howdy!\n\n' +
  'To reset your password, please visit:\n' +
  'http://sngglr.com/#/reset/' + token + '\n' +
  '\n' +
  'Enjoy :),\n' +
  'Sngglr';
};
exports.onMatch = {};
exports.onMatch.sms = function(name) { return 'You just matched with ' + name + ' on Sngglr! Go say Hai!'; };
exports.onMatch.email = function(name) {
  return 'Howdy\n\n' +
'You just matched with ' + name + '! Go say hai!\n\n' +
'Enjoy :),\n' +
'Sngglr\nhttp://sngglr.com';
};

exports.onChat = {};
exports.onChat.sms = function(name) { return name + ' just sent you a message on Sngglr!'; };
exports.onChat.email = function(name) { return 'Howdy\n\n' +
name + ' just sent you a message on Sngglr!\n\n' +
'Enjoy :),\n' +
'Sngglr';
};

exports.inviteEmail = function(email) {
  return '' +
  'Howdy ' + email + '!\n' +
  '\n' +
  'You have been invited to Sngglr by an unnamed user! Can\'t tell you who, but they\'re probably cute.\n' +
  '\n' +
  'What is Sngglr? It\'s a Michigan Tech and Finlandia only dating website (not hookup website).\n' +
  '\n' +
  'Interested? Good :). Check us out:\n' +
  '\n' +
  'http://sngglr.com\n' +
  '\n' +
  'Made by MTU/FU students for MTU/FU students,\n' +
  'Sngglr';
};
