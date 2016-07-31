'use strict';

/**
 * Module dependencies
 */
var passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  User = require('mongoose').model('User');

module.exports = function () {
  // Use local strategy
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function (username, password, done) {
    console.log ('local: ', username);
    console.log ('password: ', password);
    User.findOne({
      email: username.toLowerCase()
    }, function (err, user) {
      if (err) {
        return done(err);
      }
      console.log ('user: ', user);
      if (!user || !user.authenticate(password)) {
        return done(null, false, {
          message: 'Invalid username or password'
        });
      }

      return done(null, user);
    });
  }));
};
