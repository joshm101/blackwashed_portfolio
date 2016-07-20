(function () {
  'use strict';

  angular.module('photoWorks')
    .directive('photoWork', photoWork)
    .directive('viewPhotoWork', viewPhotoWork)
    .directive('workImage', workImage);

  photoWork.$inject = ['$rootScope', '$http', '$mdDialog', '$mdMedia', 'PhotoWorks'];
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

  function photoWork ($rootScope, $http, $mdDialog, $mdMedia, PhotoWorks) {
    var directive = {
      restrict: 'E',
      scope: {
        coverImageUrl: '=',
        work: '='
      },
      link: function (scope) {
        scope.coverImage = PhotoWorks.coverImage;
        scope.customFullscreen = $mdMedia('xs') || $mdMedia('sm');

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
