var videoWorks = (function (app) {
  'use strict';

  app.registerModule ('videoWorks', ['ngMaterial', 'bw-interface', 'photoWorks', 'photoWorks.services']);
  app.registerModule ('videoWorks.services');
}(ApplicationConfiguration));
