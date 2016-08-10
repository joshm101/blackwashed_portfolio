'use strict';

module.exports = function (app) {

  var works = require('../controllers/works.server.controller');


  app.route ('/api/works/get_all_works').get(works.getAllWorks);



};
