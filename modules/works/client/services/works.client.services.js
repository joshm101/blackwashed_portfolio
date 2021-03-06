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
            service.works = resp.data;
            $rootScope.$broadcast ( 'works.update' );
          });
      }
    };

    return service;
  }
}());
