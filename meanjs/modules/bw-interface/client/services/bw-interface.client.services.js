(function () {
  'use strict';

  angular
    .module('bw-interface')
    .service('CyclerImages', CyclerImages)
    .service('SelectedImages', SelectedImages)
    .service('ServerImages', ServerImages)
    .service('NewImages', NewImages)
    .service('EditImages', EditImages)
    .service('VideoCoverImage', VideoCoverImage);

  CyclerImages.$inject = ['$rootScope', '$http', 'Upload'];
  SelectedImages.$inject = ['$rootScope', '$http', 'Upload'];
  ServerImages.$inject = ['$rootScope', '$http', 'Upload'];
  NewImages.$inject = ['$rootScope', '$http', 'Upload'];
  EditImages.$inject = ['$rootScope', '$http', 'Upload'];
  VideoCoverImage.$inject = ['$rootScope', '$http', 'Upload'];

  function VideoCoverImage ($rootScope, $http, Upload) {
    var service = {
      image: [],
      removeImage: function () {
        service.image = [];
        console.log("removeCoverImage service function");
        console.log("service.image is: ", service.image);
        $rootScope.$broadcast ( 'VideoCoverImage.update' );
      },
      addImage: function (file) {
        service.image = [];
        service.image.push (file);
        $rootScope.$broadcast ( 'VideoCoverImage.update' );
      }
    };

    return service;
  }

  function NewImages ($rootScope, $http, Upload) {
    var service = {
      images: []
    };

    return service;
  }

  function ServerImages ($rootScope, $http, Upload) {
    var service = {
      images: []
    };

    return service;
  }

  function EditImages ($rootScope, $http, Upload) {
    var service = {
      images: [],
      serverImages: [],
      newImages: [],
      newImageFiles: [],
      imagesToDelete: [],
      addNewImage: function (file, imageUrl, serverImage, coverImage) {
        console.log ('addNewImage EditImages service function');

        // create the new image object
        var imageToPush = {
          imageUrl: imageUrl,
          serverImage: serverImage,
          coverImage: coverImage
        };

        // maintain the new image on the general
        // newImages service array
        service.newImages.push (imageToPush);

        // maintain the new image on the overall
        // service images array
        service.images.push (imageToPush);

        // maintain the file information of the new image
        // so that it is properly uploaded on edit submit
        service.newImageFiles.push (file);
      },

      // this function will reinitialize the EditImages
      // service. This reset function can either be done
      // on edit dialog close or edit dialog open.
      reset: function () {
        service.images = [];
        service.serverImages = [];
        service.newImages = [];
        service.newImageFiles =[];
        service.imagesToDelete = [];
      },

      addImage: function (imageUrl, serverImage, coverImage) {
        console.log("addImage EditImages service function");


        var imageToPush = {
          imageUrl: imageUrl,
          serverImage: serverImage,
          coverImage: coverImage
        };

        // if we have a new image that will
        // need to be uploaded
        if (serverImage === false) {
          service.newImages.push(imageToPush);
        } else {
          service.serverImages.push(imageToPush);
        }

        service.images.push(imageToPush);
      },

      // set cover image to the image
      // with passed in imgUrl
      setCoverImage: function (imgUrl) {
        console.log("setCoverImage EditImages: ", imgUrl);
        console.log("service.images.length: ", service.images.length);
        console.log("service.images: ", service.images);

        // iterate through all the images currently in the
        // edit form, both new (to be uploaded) and old (server images)
        for (var i = 0; i < service.images.length; ++i) {

          // if we have a match
          if (service.images[i].imageUrl === imgUrl) {
            console.log("match");
            // set coverImage field of current image
            // in overall images array to true.
            service.images[i].coverImage = true;

            // set the chosenCoverImage field to the matched
            // image's url.
            service.chosenCoverImage = service.images[i].imageUrl;

            // if the coverImage we are setting is a new image
            // that will need to be uploaded, set the coverImage
            // field in newImages service array. This
            // needs to be done to maintain consistency
            if (service.images[i].serverImage === false) {
              for (var j = 0; j < service.newImages.length; ++j) {
                if (service.newImages[j].imageUrl === imgUrl) {
                  service.newImages[j].coverImage = true;
                } else {
                  service.newImages[j].coverImage = false;
                }
              }
            }
          } else {
            service.images[i].coverImage = false;

          }
        }
      },

      removeImage: function (imgUrl) {
        for (var i = 0; i < service.images.length; ++i) {
          if (service.images[i].imageUrl === imgUrl) {
            if (service.images[i].coverImage === true) {
              // if we are removing a cover image

              if(service.images.length > 1) {
                if (i === 0) {
                  // if we are removing the first image from the
                  // image array and if there is more than 1 item
                  // currently in the image array, set the second
                  // image (soon to be first) in the array as
                  // the new cover image after removal
                  service.images[1].coverImage = true;
                  for (var j = 0; j < service.serverImages.length; ++j) {
                    if (service.serverImages[j].imageUrl === service.images[1].imageUrl) {
                      console.log ('server cover image true');
                      console.log ('j is: ', j);
                      console.log ('url: ', service.serverImages[j].imageUrl);
                      service.chosenCoverImage = service.serverImages[j].imageUrl;

                      service.serverImages[j].coverImage = true;

                    }
                  }
                  for (var j = 0; j < service.newImages.length; ++j) {
                    if (service.newImages[j].imageUrl === service.images[1].imageUrl) {
                      service.chosenCoverImage = service.newImages[j].imageUrl;
                      service.newImages[j].coverImage = true;
                      service.chosenCoverImage = service.newImages[j].imageUrl;
                    }
                  }
                } else {

                  // if we are not removing the first image
                  // in the image array and the image array
                  // has more than 1 item, set the first item
                  // in the image array as the cover image.
                  service.images[0].coverImage = true;
                  for (var j = 0; j < service.serverImages.length; ++j) {
                    if (service.serverImages[j].imageUrl === service.images[0].imageUrl) {
                      service.serverImages[j].coverImage = true;
                      console.log ('server cover image true');
                      console.log ('url: ', service.serverImages[j].imageUrl);
                      service.chosenCoverImage = service.serverImages[j].coverImage;
                    }
                  }
                  for (var j = 0; j < service.newImages.length; ++j) {
                    if (service.newImages[j].imageUrl === service.images[0].imageUrl) {
                      service.newImages[j].coverImage = true;
                      service.chosenCoverImage = service.newImages[j].imageUrl;
                    }
                  }
                }
              }
            }

            // if we are removing a server image that
            // was set to cover image
            if (service.images[i].serverImage === true) {
              service.imagesToDelete.push(service.images[i]);
              console.log("imagesToDelete");
              for (var j = 0; j < service.serverImages.length; ++j) {
                console.log ("checking server images");
                if (service.images[i].imageUrl === service.serverImages[j].imageUrl) {
                  service.serverImages.splice (j, 1);
                  console.log("spliced server image");
                }
              }
            }
            // if we are removing a new image
            // but the user now wants to remove
            // it, splice it from newImages service array
            if (service.images[i].serverImage === false) {
              for (var j = 0; j < service.newImages.length; ++j) {
                if (service.newImages[j].imageUrl === imgUrl) {
                  console.log ('spliced');
                  console.log ("service.newImages[j]: ", service.newImages[j]);
                  console.log ("service.images[i]: ", service.images[i]);
                  service.newImages.splice(j, 1);
                  service.newImageFiles.splice (j, 1);
                  console.log ('service.newImages after splice: ', service.newImages);
                }
              }
            }
            console.log ("image spliced: ", service.images[i]);
            service.images.splice(i, 1);
            console.log("service.imagesToDelete: ", service.imagesToDelete);
          }
        }
      }
    };

    return service;
  }

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
        $rootScope.$broadcast ( 'SelectedImages.update' );
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
        $rootScope.$broadcast ( 'SelectedImages.update' );
      },

      reset: function () {
        service.images = [];
        $rootScope.$broadcast ( 'SelectedImages.update' );
      },

      removeImage: function (imgUrl) {
        console.log("imgUrl is: " + imgUrl);
        console.log("service.images: " + JSON.stringify(service.images));

        for (var i = 0; i < service.images.length; ++i) {
          if (service.images[i].file['$ngfBlobUrl'] === imgUrl) {
            if (service.images[i].coverImage === true) {
              // if we are removing a cover image

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
            }
            service.images.splice(i, 1);
            console.log('imgUrl: ' + imgUrl);
            console.log('service.images: ' + service.images);
            $rootScope.$broadcast ( 'SelectedImages.update' );
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
              service.images.forEach (function (image) {
                image.cssClass = false;
                service.images[0].cssClass = true;
              });
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
