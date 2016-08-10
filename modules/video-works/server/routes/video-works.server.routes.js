'use strict';

module.exports = function (app) {
  var videoWorks = require ('../controllers/video-works.server.controller');

  app.route('/api/video_works/add_video_work').post(videoWorks.addVideoWork);
  app.route('/api/video_works/delete_video_work').delete(videoWorks.deleteVideoWork);
  app.route('/api/video_works/edit_video_work').post(videoWorks.editVideoWork);
  app.route('/api/video_works/get_video_works').get(videoWorks.getVideoWorks);
};
