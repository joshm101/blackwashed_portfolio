'use strict';

var validator = require('validator'),
    nodemailer = require ('nodemailer'),
    util = require ('util');

// create reusable transporter object using the default SMTP transport
var transportString = 'smtps://' + process.env.BLACKWASHED_EMAIL_PREFIX + '@gmail.com:'
                                 + process.env.BLACKWASHED_EMAIL_PW + '@smtp.gmail.com';
var transporter = nodemailer.createTransport(transportString);

exports.sendEmail = function (req, res) {
  console.log ('sending email');
  console.log (util.inspect (req.body));
  console.log ('process.env.BLACKWASHED_EMAIL_PREFIX: ', process.env.BLACKWASHED_EMAIL_PREFIX);
  console.log ('process.env.BLACKWASHED_EMAIL_PW: ', process.env.BLACKWASHED_EMAIL_PW);
  var emailObject = req.body;
  var messageHtml = '<div><b>Name: </b>' + emailObject.senderName + '</div>'
                    + '<div><b>Phone Number: </b>' + emailObject.senderPhoneNumber + '</div>'
                    + '<div style="margin-bottom: 20px;"><b>Email: </b>' + emailObject.senderEmail + '</div>'
                    + '<div style="white-space: pre-line; line-height: 1.3em; width: 100%; max-width: 600px;">' + emailObject.message + '</div>';
  var mailOptions = {
    from: emailObject.senderEmail, // sender address
    to: process.env.BLACKWASHED_TO, // list of receivers
    subject: emailObject.subject, // Subject line
    text: '', // plaintext body
    html: messageHtml // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, function(error, info){
    if(error){
      console.log ("error sending email: ", util.inspect (error));
      return res.status (400).send (error);
    } else {
      console.log('Message sent: ' + info.response);
      return res.status (200).send ();
    }

  });
};

/**
 * Render the main application page
 */
exports.renderIndex = function (req, res) {

  var safeUserObject = null;
  if (req.user) {
    safeUserObject = {
      provider: validator.escape(req.user.provider),
      created: req.user.created.toString(),
      roles: req.user.roles,
      profileImageURL: req.user.profileImageURL,
    email: validator.escape(req.user.email),
      additionalProvidersData: req.user.additionalProvidersData
    };
  }

  res.render('modules/core/server/views/index', {
    user: safeUserObject
  });
};

/**
 * Render the server error page
 */
exports.renderServerError = function (req, res) {
  res.status(500).render('modules/core/server/views/500', {
    error: 'Oops! Something went wrong...'
  });
};

/**
 * Render the server not found responses
 * Performs content-negotiation on the Accept HTTP header
 */
exports.renderNotFound = function (req, res) {

  res.status(404).format({
    'text/html': function () {
      res.render('modules/core/server/views/404', {
        url: req.originalUrl
      });
    },
    'application/json': function () {
      res.json({
        error: 'Path not found'
      });
    },
    'default': function () {
      res.send('Path not found');
    }
  });
};
