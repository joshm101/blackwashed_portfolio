(function () {
  'use strict';

  angular
    .module ('about')
    .service ('AboutPageService', AboutPageService);

  AboutPageService.$inject = ['$rootScope', '$http'];

  function AboutPageService ($rootScope, $http) {
    var service = {
      about: [],
      getAbout: function () {
        $http.get ('/api/about/get_about_page')
          .then (function (res) {
            if (res.status === 200) {
              service.about = res.data;
              console.log ('service.about: ', service.about);
            }
          });
      },

      updateAbout: function (edit) {
        service.about = [];
        service.about.push (edit);
      }
    };

    return service;
  }
}());
