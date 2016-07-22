(function () {
  'use strict';

  angular.module('photoWorks')
    .directive('photoWork', photoWork)
    .directive('viewPhotoWork', viewPhotoWork)
    .directive('workImage', workImage);

  photoWork.$inject = ['$rootScope', '$http', '$mdDialog', '$mdMedia', 'PhotoWorks', 'EditImages', 'Upload'];
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

  function photoWork ($rootScope, $http, $mdDialog, $mdMedia, PhotoWorks, EditImages, Upload) {
    var directive = {
      restrict: 'E',
      scope: {
        coverImageUrl: '=',
        work: '='
      },
      link: function (scope) {
        scope.coverImage = PhotoWorks.coverImage;
        scope.customFullscreen = $mdMedia('xs') || $mdMedia('sm');
        scope.editPhotoWork = function (work) {
          console.log("work is: ", work);

          EditImages.images = [];
          // on edit click, add images already apart
          // of the photo work to the EditImages service
          for (var i = 0; i < work.images.length; ++i) {
            console.log("work.images[i]: ", work.images[i]);
            //EditImages.addImage()
            if (work.images[i].coverImage === true) {
              EditImages.chosenCoverImage = work.images[i].imageUrl;
            }
            EditImages.addImage(work.images[i].imageUrl, true, work.images[i].coverImage);
          }
          scope.modelsModel = [];
          for (var i = 0; i < work.models.length; ++i) {
            console.log('work.models[i]: ', work.models[i]);
            scope.modelsModel.push({name: 'model_' + i});
            scope.modelNumber = i;
          }

          $mdDialog.show({
            locals: {
              work: scope.work,
              models: scope.work.models,
              modelsModel: scope.modelsModel,
              modelNumber: scope.modelNumber
            },
            controller: function ($scope, $mdDialog, work, modelsModel, modelNumber, models) {
              $scope.work = work;
              $scope.models = models;
              $scope.modelsModel = modelsModel;

              console.log("modelsModel dialog show: ", modelsModel);

              console.log("models is: ", models);

              console.log("scope.models: ", $scope.models);

              $scope.addModel = function (event) {
                $scope.modelsModel.push( {name: 'model_' + ++modelNumber} )
              };

              $scope.submitEditedWork = function (event) {
                console.log("submit edited work");
                console.log("work.models: ", work.models);
                console.log("work.title: ", work.title);
                console.log("EditImages.chosenCoverImage: ", EditImages.chosenCoverImage);
                console.log("EditImages.images: ", EditImages.images);
                console.log("EditImages.newImages: ", EditImages.newImages);
                console.log("EditImages.imagesToDelete: ", EditImages.imagesToDelete);
                Upload.upload({
                  url: '/api/photo_works/edit_photo_work',
                  arrayKey: '',
                  data: {
                    file: EditImages.newImageFiles,
                    newImages: EditImages.newImages,
                    chosenCoverImage: EditImages.chosenCoverImage,
                    identifier: work._id,
                    serverImages: EditImages.serverImages,
                    imagesToDelete: EditImages.imagesToDelete,
                    workTitle: work.title,
                    copyright: work.copyright,
                    models: work.models
                  }
                }).then (function (resp) {
                  console.log("Success: ", resp);
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
