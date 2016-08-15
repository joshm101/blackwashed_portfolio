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
              service.photoWorks = response.data;
              $rootScope.$broadcast ( 'photoWorks.update' );
            }
          });
      },

      deletePhotoWork: function (work) {
        $http.delete('api/photo_works/delete_photo_work', {params: {data: work}})
          .then (function (response) {
            if (response.status === 200) {
              for (var i = 0; i < service.photoWorks.length; ++i) {
                if (service.photoWorks[i]._id === work._id) {
                  service.photoWorks.splice(i, 1);
                  $rootScope.$broadcast ( 'photoWorks.update' );
                }
              }
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
