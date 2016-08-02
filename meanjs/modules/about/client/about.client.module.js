var aboutPage = (function (app) {
  app.registerModule ('about', ['ngFileUpload', 'ngMaterial', 'ngAnimate',
                                'core', 'core.routes', 'photoWorks', 'videoWorks']);
  app.registerModule ('about.services');
}(ApplicationConfiguration));
