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

exports.onLike = {};
exports.onLike.sms = 'Someone just liked you on Sngglr';
exports.onLike.email = 'Howdy\n\n' +
'Someone on Sngglr just liked you!\n' +
'Enjoy :),\n' +
'Sngglr Team';

exports.onMatch = {};
exports.onLike.sms = function(name) { return 'You just matched with ' + name + ' on Sngglr! Say Hai!'; };
exports.onMatch.email = function(name) {
  return 'Howdy\n\n' +
'You just matched with ' + name + '! Say hai!\n' +
'Enjoy :),\n' +
'Sngglr Team\nhttp://sngglr.com';
};
