(function () {
  'use strict';

  angular.module('photoWorks')
    .service('PhotoWorks', PhotoWorks);

  PhotoWorks.$inject = ['$rootScope', '$http'];

  function PhotoWorks ($rootScope, $http) {
    var service = {
      photoWorks: [],

      getPhotoWorks: function () {
        $http.get('api/photo_works/get_photo_works')
          .then (function (response) {
            if (response.status === 200) {
              console.log("response.data photo works: " + JSON.stringify(response.data));
              service.photoWorks = response.data;
              console.log(service.photoWorks);
              // console.log("json stringify images: ", service.photoWorks[4]);
              $rootScope.$broadcast ( 'photoWorks.update' );
            }
          });
      },

      addPhotoWork: function (work) {
        service.photoWorks.push(work);
        $rootScope.$broadcast ( 'photoWorks.update' );
      }
    };

    return service;
  }
}());
