'use strict';

module.exports = function (app) {
  var aboutCtrl = require ('../controllers/about.server.controller');

  app.route ('/api/about/edit_about_page/').post (aboutCtrl.editAboutPage);
  app.route ('/api/about/get_about_page').get (aboutCtrl.getAboutPage);
};
