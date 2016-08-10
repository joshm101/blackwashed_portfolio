(function () {
  'use strict';

  angular
    .module('works')
    .service('Works', Works);

  Works.$inject = ['$rootScope', '$http'];

  function Works ($rootScope, $http) {
    var service = {

      getWorks: function () {
        $http.get ('/api/works/get_all_works')
          .then (function (resp) {
            console.log("response is: ", resp);
            service.works = resp.data;
            console.log("service.works is: ", service.works);
            console.log ("typeof service.works is: ", Object.prototype.toString.call(service.works) == '[object Array]');
            $rootScope.$broadcast ( 'works.update' );
          });
      }
    };

    return service;
  }
}());
