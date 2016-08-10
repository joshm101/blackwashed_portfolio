var bw_interface = (function (app) {
  'use strict';

  app.registerModule('bw-interface', ['Upload', 'ngFileUpload', 'ngMaterial', 'ngAnimate',
                                      'core', 'core.routes', 'photoWorks', 'videoWorks', 'about']);
  app.registerModule('bw-interface.services');
}(ApplicationConfiguration));
