'use strict';

module.exports = function (app) {

  var inter = require('../controllers/bw-interface.server.controller');

  // API for interface
  app.route('/api/images/upload_cycler_image').post(inter.uploadCyclerImage);

};
