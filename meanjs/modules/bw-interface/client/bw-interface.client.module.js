var bw_interface = (function (app) {
  'use strict';

  app.registerModule('bw-interface', ['Upload', 'ngFileUpload', 'ngMaterial', 'core', 'photoWorks', 'videoWorks']);
  app.registerModule('bw-interface.services');
}(ApplicationConfiguration));
