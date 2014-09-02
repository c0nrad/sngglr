'use strict';

var twilio = require('twilio');
var secrets = require('../secrets');
var client = new twilio.RestClient(secrets.twilioSid, secrets.twilioAuth);
var number = secrets.twilioNumber;
var smsOn = false;

var nodemailer = require('nodemailer');
var email = secrets.gmailEmail;
var password = secrets.gmailPasswod;
var emailOn = false;

if (emailOn) {
  var transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
          user: email,
          pass: password
      }
  });
}

exports.email = function(to, subject, body, next) {
  console.log('email', to, body);

  if (emailOn) {
    var mailOptions = {
      from: email,
      to: to,
      subject: subject,
      text: body,
    };

    transporter.sendMail(mailOptions, next);
  } else {
    next();
  }
};

exports.sms = function(to, body, next) {
  console.log('sms', to, body);

  if (to === null || to.length < 7) {
    return next(null, 'Invalid phone number');
  }

  if (smsOn) {
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
  'Sngglr Team';
};

exports.onLike = {};
exports.onLike.sms = 'Someone just liked you on Sngglr';
exports.onLike.email = 'Howdy\n\n' +
'Someone on Sngglr just liked you!\n' +
'Enjoy :),\n' +
'Sngglr Team';

exports.onMatch = {};
exports.onMatch.sms = function(name) { return 'You just matched with ' + name + ' on Sngglr! Say Hai!'; };
exports.onMatch.email = function(name) {
  return 'Howdy\n\n' +
'You just matched with ' + name + '! Say hai!\n' +
'Enjoy :),\n' +
'Sngglr Team\nhttp://sngglr.com';
};

exports.inviteEmail = function(email) {
  return '' +
  'Howdy ' + email + '!\n' +
  '\n\n' +
  'You have been invited to Sngglr by an unnamed user! Who? Sorry can\'t tell you that, we value user security and safety. But they\'re probably cute.\n'
  '\n' +
  'What is Sngglr? It\'s a Michigan Tech and Finlandia only dating website (not hookup website).\n' +
  '\n' +
  'Interested? Good :). Check us out:\n' +
  '\n' +
  'http://sngglr.com\n' +
  '\n' +
  'Made by MTU/FU students for MTU/FU students,\n' +
  'Sngglr Team';
}
