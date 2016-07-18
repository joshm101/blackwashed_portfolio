(function () {
  'use strict';

  angular
    .module('bw-interface')
    .service('CyclerImages', CyclerImages)
    .service('SelectedImages', SelectedImages);

  CyclerImages.$inject = ['$rootScope', '$http', 'Upload'];
  SelectedImages.$inject = ['$rootScope', '$http', 'Upload'];

  function SelectedImages ($rootScope, $http, Upload) {
    var service = {
      images: [],
      addImage: function(file) {
        console.log("addImage service function");
        var imageToPush;
        if (service.images.length === 0) {
          imageToPush = {
            file: file,
            coverImage: true
          };
        } else {
          imageToPush = {
            file: file,
            coverImage: false
          };
        }
        service.images.push(imageToPush);
        // console.log("file is: " + JSON.stringify(file));
      },

      setCoverImage: function (imgUrl) {
        console.log("setCoverImage()");
        for (var i = 0; i < service.images.length; ++i) {
          if (service.images[i].file['$ngfBlobUrl'] === imgUrl) {
            service.images[i].coverImage = true;
          } else {
            service.images[i].coverImage = false;
          }
        }
      },

      removeImage: function (imgUrl) {
        console.log("imgUrl is: " + imgUrl);
        console.log("service.images: " + JSON.stringify(service.images));

        for (var i = 0; i < service.images.length; ++i) {
          if (service.images[i].file['$ngfBlobUrl'] === imgUrl) {
            if (service.images.length > 1) {
              if (i === 0) {

                // if we are removing the first image from the
                // image array and if there is more than 1 item
                // currently in the image array, set the second
                // image (soon to be first) in the array as
                // the new cover image after removal
                service.images[1].coverImage = true;
              } else {

                // if we are not removing the first image
                // in the image array and the image array has more
                // than 1 item, set the first item in the image
                // array as the cover image.
                service.images[0].coverImage = true;
              }
            }
            service.images.splice(i, 1);
            console.log('imgUrl: ' + imgUrl);
            console.log('service.images: ' + service.images);
          }
        }
      }
    };
    return service;
  }

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
        console.log("file: " + JSON.stringify(file));
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
          if (evt.config.data.file !== null){
            console.log("progress: " + progressPercentage + '% ' + evt.config.data.file.name);
          }
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
