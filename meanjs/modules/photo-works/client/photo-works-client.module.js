var photoWorks = (function (app) {
  'use strict';

  app.registerModule('photoWorks', ['ngMaterial', 'bw-interface', 'videoWorks', 'videoWorks.services']);
  app.registerModule('photoWorks.services');
}(ApplicationConfiguration));
