(function () {
  'use strict';

  angular
    .module('bw-interface')
    .service('CyclerImages', CyclerImages);

  CyclerImages.$inject = ['$rootScope', '$http', 'Upload'];

  function CyclerImages ($rootScope, $http, Upload) {
    var service = {
      images: [],
      getCyclerImages: function () {
        $http.get('/api/images/get_cycler_images')
          .then (function (response) {
            console.log("response: " + response);
            if(response.status === 200) {
              service.images = response.data;
              $rootScope.$broadcast ( 'images.update' );
              console.log(images);
              console.log("JSON stringify: " + JSON.stringify(response));
            }
          });
      },

      uploadCyclerImage: function (file) {
        console.log("$scope.upload");
        Upload.upload({
          url: '/api/images/upload_cycler_image',
          data: {file: file}
        }).then (function (resp) {
          console.log('Success: ' + resp.config.data.file.name + 'uploaded. Response: ' +resp.data);
          console.log(JSON.stringify(resp.data));
          service.images.push(resp.data);
          $rootScope.$broadcast( 'images.update' );
          // file = '';
        }, function (resp) {
          console.log('Error status:  ' + resp.status);
        }, function (evt) {
          var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
          console.log("progress: " + progressPercentage + '% ' + evt.config.data.file.name);
        });
      },

      deleteCyclerImage: function (imagePath) {
        console.log("$scope.deleteImage");
        console.log("imagePath: " + imagePath);
        $http.delete('/api/images/delete_cycler_image', {params: {imagePath: imagePath}})
          .then (function (response) {
            console.log("response: " + JSON.stringify(response));

            // only delete on successful server-side deletion
            if(response.status === 200) {
              // worst case performance O(n) because we have to
              // look through at most n items to find the
              // item to delete from service image array.
              for (var i = 0; i < service.images.length; ++i) {
                if (service.images[i].path === imagePath) {
                  service.images.splice(i, 1);
                  $rootScope.$broadcast ( 'images.update' );
                }
              }
            }

          });

      }
    };

    return service;
  }
}());
