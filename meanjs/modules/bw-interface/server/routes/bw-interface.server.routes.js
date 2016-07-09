'use strict';

module.exports = function (app) {

  var inter = require('../controllers/bw-interface.server.controller');

  //console.log(__dirname);

  // var imagesPath = path.resolve(__dirname + '/../../client/img/cycler_images');

  // app.use(imagesPath);

  // API for interface
  app.route('/api/images/upload_cycler_image').post(inter.uploadCyclerImage);
  app.route('/api/images/get_cycler_images').get(inter.getCyclerImages);



};
