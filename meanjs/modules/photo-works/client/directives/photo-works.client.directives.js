(function () {
  'use strict';

  angular.module('photoWorks')
    .directive('photoWork', photoWork)
    .directive('viewPhotoWork', viewPhotoWork)
    .directive('workImage', workImage);

  photoWork.$inject = ['$rootScope', '$http', '$mdDialog', '$mdMedia', '$mdToast', 'PhotoWorks', 'EditImages', 'Upload'];
  viewPhotoWork.$inject = ['$rootScope', '$state', '$timeout', '$mdDialog', '$mdMedia', 'SelectedImages', 'PhotoWorks'];
  workImage.$inject = ['$rootScope', '$state', '$timeout', '$mdDialog', '$mdMedia', 'SelectedImages', 'PhotoWorks'];


  function workImage ($rootScope, $state, $timeout, $mdDialog, $mdMedia, SelectedImages, PhotoWorks) {
    var directive = {
      restrict: 'E',
      scope: {
        imageUrl: '='
      },
      link: function (scope) {

      },
      templateUrl: 'modules/photo-works/client/views/work-image.html'
    };

    return directive;
  }

  function viewPhotoWork ($rootScope, $state, $timeout, $mdDialog, $mdMedia, SelectedImages, PhotoWorks) {
    var directive = {
      restrict: 'E',
      scope: {
        photoWork: '='
      },
      link: function (scope) {

      },
      templateUrl: 'modules/photo-works/client/views/view-photo-work.html'
    };

    return directive;
  }

  function photoWork ($rootScope, $http, $mdDialog, $mdMedia, $mdToast, PhotoWorks, EditImages, Upload) {
    var directive = {
      restrict: 'E',
      scope: {
        coverImageUrl: '=',
        work: '='
      },
      link: function (scope, $mdToast) {



        scope.coverImage = PhotoWorks.coverImage;
        scope.customFullscreen = $mdMedia('xs') || $mdMedia('sm');
        scope.editPhotoWork = function (work) {
          console.log("work is: ", work);

          EditImages.images = [];

          // on edit click, add images already apart
          // of the photo work to the EditImages service
          for (var i = 0; i < work.images.length; ++i) {
            console.log("work.images[i]: ", work.images[i]);

            // if the image we are currently look at
            // is the cover image
            if (work.images[i].coverImage === true) {

              // set the chosenCoverImage field of the
              // EditImages service for the current
              // photo work to edit.
              EditImages.chosenCoverImage = work.images[i].imageUrl;
            }
                                // url of image                 // isCoverImage Boolean
            EditImages.addImage(work.images[i].imageUrl, true, work.images[i].coverImage);
          }                                     // is serverImage Boolean

          scope.modelsModel = [];

          // iterate through the currently set models for the photo work
          for (var i = 0; i < work.models.length; ++i) {
            console.log('work.models[i]: ', work.models[i]);

            // push each model onto the data model for              // this for loop might be unnecessary
            // models input on photo work
            scope.modelsModel.push({name: 'model_' + i});
            scope.modelNumber = i;
          }

          // show edit dialog
          $mdDialog.show({

            // inject scope variables to dialog controller
            locals: {

              // current photo work object
              work: scope.work,

              // photo work's models
              models: scope.work.models,

              // models input data model
              modelsModel: scope.modelsModel,
              modelNumber: scope.modelNumber
            },
            controller: function ($scope, $rootScope, $mdDialog, $mdToast, work, modelsModel, modelNumber, models) {

              var last = {
                bottom: false,
                top: true,
                left: false,
                right: true
              };
              $scope.toastPosition = angular.extend({},last);
              $scope.getToastPosition = function() {
                sanitizePosition();
                return Object.keys($scope.toastPosition)
                  .filter(function(pos) { return $scope.toastPosition[pos]; })
                  .join(' ');
              };
              function sanitizePosition() {
                var current = $scope.toastPosition;
                if ( current.bottom && last.top ) current.top = false;
                if ( current.top && last.bottom ) current.bottom = false;
                if ( current.right && last.left ) current.left = false;
                if ( current.left && last.right ) current.right = false;
                last = angular.extend({},current);
              }
              $scope.showSimpleToast = function(error) {
                var pinTo = $scope.getToastPosition();
                if (error === 'images') {
                  $mdToast.show(
                    $mdToast.simple()
                      .textContent('Please add at least one image.')
                      .position(pinTo )
                      .hideDelay(3000)
                  );
                }
              };

              // set up scope variables for controller/dialog scope.
              $scope.work = work;
              $scope.models = models;
              $scope.modelsModel = modelsModel;

              var oldModels = $scope.work.models;
              var model = modelsModel;
              var workTitle = $scope.work.title;
              var copyright = $scope.work.copyright;

              console.log("modelsModel dialog show: ", modelsModel);

              console.log("models is: ", models);

              console.log("scope.models: ", $scope.models);

              $scope.addModel = function (event) {
                $scope.modelsModel.push( {name: 'model_' + ++modelNumber} )
              };

              $scope.cancelEdit = function (event) {
                work.title = workTitle;
                work.copyright = copyright;
                work.models = oldModels;
                $scope.modelsModel = model;
                $mdDialog.cancel();
              };

              // submit edits for updating photo work on back end.
              $scope.submitEditedWork = function (event) {
                if (EditImages.images.length === 0) {
                  $scope.showSimpleToast('images');
                  return;
                }
                console.log("submit edited work");
                console.log("work.models: ", work.models);
                console.log("work.title: ", work.title);
                console.log("EditImages.chosenCoverImage: ", EditImages.chosenCoverImage);
                console.log("EditImages.images: ", EditImages.images);
                console.log("EditImages.newImages: ", EditImages.newImages);
                console.log("EditImages.imagesToDelete: ", EditImages.imagesToDelete);
                Upload.upload({
                  url: '/api/photo_works/edit_photo_work',

                  // arrayKey ensures that any submitted array fields
                  // remain arrays when they are parsed on back end.
                  arrayKey: '',
                  data: {

                    // file key needs to be set to any new image files
                    // as new image files require an upload
                    file: EditImages.newImageFiles,
                    newImages: EditImages.newImages,
                    chosenCoverImage: EditImages.chosenCoverImage,

                    // DB entry identifier for easy lookup
                    identifier: work._id,

                    // photo work images that were already on server
                    serverImages: EditImages.serverImages,

                    // any server images that need to be deleted after
                    // the edit
                    imagesToDelete: EditImages.imagesToDelete,
                    workTitle: work.title,
                    copyright: work.copyright,
                    models: work.models
                  }
                }).then (function (resp) {
                  console.log("Success: ", resp);
                  var newWork = resp.data;
                  for (var i = 0; i < PhotoWorks.photoWorks.length; ++i) {
                    if (PhotoWorks.photoWorks[i]._id === newWork._id) {
                      PhotoWorks.photoWorks[i] = newWork;
                    }
                  }
                  $mdDialog.cancel();
                  EditImages.reset();
                }, function (resp) {
                  console.log("error status: ", resp.status);
                }, function (evt) {
                  console.log("evt: ", evt);
                });

              };

              $scope.editSelected = function (files, badFiles) {

              };

              $scope.hide = function () {
                $mdDialog.hide();
              }
            },
            controllerAs: 'editCtrl',
            onRemoving: function () {
              EditImages.reset();
            },
            clickOutsideToClose: true,
            templateUrl: 'modules/bw-interface/client/views/edit-photo-work.html'
          });
        };

        scope.deletePhotoWork = function (ev) {
          console.log("scope.work: ", scope.work);
          PhotoWorks.deletePhotoWork(scope.work);
        };

        scope.showPhotoWork = function (ev) {
          console.log("showPhotoWork()");
          var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && scope.customFullscreen;
          console.log(scope.work);
          $rootScope.currentWork = scope.work;
          $mdDialog.show({
            controller: function (scope, $mdDialog, work) {
              scope.work = work;

              scope.viewImage = function(event, imageUrl) {
                console.log("viewImage");
                console.log("imageUrl: ", imageUrl);
                $mdDialog.show({
                  controllerAs: 'ViewImageController',
                  controller: function ($mdDialog, scope, work) {
                    console.log("imageUrl controller: ", imageUrl);
                    scope.imageUrl = imageUrl;

                    scope.closeDialog = function () {
                      $mdDialog.cancel();
                    }
                  },
                  preserveScope: true,
                  autoWrap: true,
                  skipHide: true,
                  clickOutsideToClose: true,
                  locals: {
                    work: scope.work
                  },
                  template: '<md-dialog class="view-image-dialog" aria-label="viewImageLabel">' +
                                '<span flex>' +
                                '<md-button ng-click="closeDialog()" layout-align="end center" class="md-warn md-hue-2 md-fab md-mini view-image-close">' +
                                  '<md-icon>close</md-icon>' +
                                '</md-button>' +
                                '</span>' +
                                '<img class="view-image-img" ng-src="{{imageUrl}}"/>' +
                            '</md-dialog>'
                });
              };

              $rootScope.hide = function () {
                $mdDialog.hide();
              };
              scope.cancel = function () {
                console.log("cancel");
                $mdDialog.cancel();
              };
              $rootScope.answer = function (answer) {
                $mdDialog.hide(answer);
              };
            },
            locals: {
              work: scope.work
            },
            templateUrl: 'modules/photo-works/client/views/view-photo-work.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            autoWrap: false,
            clickOutsideToClose: true,

            fullscreen: useFullScreen
          });


        };
      },
      templateUrl: 'modules/photo-works/client/views/photo-work.html'
    };

    return directive;
  }
}());
