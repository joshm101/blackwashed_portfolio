'use strict';

module.exports = function (app) {
  var photoWorks = require ('../controllers/photo-works.server.controller');

  // API for photo works actions
  app.route('/api/photo_works/add_photo_work').post(photoWorks.addPhotoWork);
  app.route('/api/photo_works/delete_photo_work').delete(photoWorks.deletePhotoWork);
  app.route('/api/photo_works/edit_photo_work').post(photoWorks.editPhotoWork);
  app.route('/api/photo_works/get_photo_works').get(photoWorks.getPhotoWorks);
};
