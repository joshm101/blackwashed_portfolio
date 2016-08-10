(function (window) {
  'use strict';


  var applicationModuleName = 'mean';

  var service = {
    applicationModuleName: applicationModuleName,
    applicationModuleVendorDependencies: ['ngResource', 'ngAnimate', 'ngMessages', 'ui.router', 'ui.bootstrap', 'angularFileUpload', 'ngMaterial', 'slick'],
    registerModule: registerModule
  };

  window.ApplicationConfiguration = service;

  // Add a new vertical module
  function registerModule(moduleName, dependencies) {
    // Create angular module
    angular.module(moduleName, dependencies || [])
      .config (function ($mdIconProvider, $mdThemingProvider) {
        $mdIconProvider
          .defaultIconSet('lib/mdi/svg/mdi.svg');
        $mdThemingProvider.theme('default')
          .primaryPalette('indigo')
          .accentPalette('green');
      });

    // Add the module to the AngularJS configuration file
    angular.module(applicationModuleName).requires.push(moduleName);
  }
}(window));
