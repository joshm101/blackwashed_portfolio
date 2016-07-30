(function (app) {
  'use strict';
  app.registerModule('bw-interface');
  app.registerModule('bw-interface.services');
  app.registerModule('core', ['bw-interface.services', 'works',
                              'works.services', 'ngAnimate']);
  app.registerModule('core.routes', ['ui.router']);
  app.registerModule('core.admin', ['core']);
  app.registerModule('core.admin.routes', ['ui.router']);
}(ApplicationConfiguration));
