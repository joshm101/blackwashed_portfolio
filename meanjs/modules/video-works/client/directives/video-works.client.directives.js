(function () {
  'use strict';

  angular
    .module ('videoWorks')
    .directive("videoWork", videoWork);

  videoWork.$inject = ['$rootScope', '$http', '$timeout', '$mdDialog', '$mdMedia', '$mdToast', 'VideoWorks', 'VideoCoverImage'];


  function videoWork ($rootScope, $http, $timeout, $mdDialog, $mdMedia, $mdToast, VideoWorks, VideoCoverImage) {
    var directive = {
      restrict: 'E',
      scope: {
        work: '='
      },
      link: function (scope) {
        scope.customFullscreen = $mdMedia('xs') || $mdMedia ('sm');
        scope.coverImageUrl = scope.work.coverImageUrl;
        scope.showVideoWork = function () {
          console.log ('showVideoWork()');
        };

        scope.deleteVideoWork = function () {
          console.log ('deleteVideoWork()');
        };

        scope.editVideoWork = function () {
          console.log ('editVideoWork()');

          scope.castModel = [];
          scope.directorsModel = [];
          scope.editorsModel = [];

          console.log("scope.work is: ", scope.work);

          // iterate through the currently set models for the photo work
          for (var i = 0; i < scope.work.cast.length; ++i) {
            console.log('work.cast[i]: ', scope.work.cast[i]);

            // push each cast member onto the data model for              // this for loop might be unnecessary
            // cast input on video work
            scope.castModel.push({name: 'cast_' + i});
            scope.castNumber = i;
          }

          // iterate through the currently set models for the photo work
          for (var i = 0; i < scope.work.directedBy.length; ++i) {
            console.log('work.directors[i]: ', scope.work.directedBy[i]);

            // push each director onto the data model for              // this for loop might be unnecessary
            // directors input on video work
            scope.directorsModel.push({name: 'director_' + i});
            scope.directorNumber = i;
          }

          // iterate through the currently set models for the photo work
          for (var i = 0; i < scope.work.editedBy.length; ++i) {
            console.log('work.editors[i]: ', scope.work.editedBy[i]);

            // push each editor onto the data model for              // this for loop might be unnecessary
            // editors input on vide work
            scope.editorsModel.push({name: 'editor_' + i});
            scope.editorNumber = i;
          }

          $mdDialog.show ({
            locals: {
              work: scope.work,
              cast: scope.castMembers,
              editors: scope.editors,
              directors: scope.directors,
              castModel: scope.castModel,
              directorsModel: scope.directorsModel,
              editorsModel: scope.editorsModel
            },
            controller: function ($scope, $rootScope, $mdDialog, $mdToast,
                                  work, cast, editors, directors,
                                  castModel, editorsModel, directorsModel) {
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
                if (error === 'coverImage') {
                  $mdToast.show(
                    $mdToast.simple()
                      .textContent('Please add a cover image.')
                      .position(pinTo )
                      .hideDelay(3000)
                  );
                }
              };

              $scope.work = work;
              $scope.cast = cast;
              $scope.editors = editors;
              $scope.directors = directors;
              $scope.castModel = castModel;
              $scope.editorsModel = editorsModel;
              $scope.directorsModel = directorsModel;

              var oldWorkTitle = work.title;
              var oldCast = cast;
              var oldEditors = editors;
              var oldDirectors = directors;

              $scope.cancelEdit = function () {
                work.title = oldWorkTitle;
                work.cast = oldCast;
                work.editedBy = oldEditors;
                work.directedBy = oldDirectors;
                $mdDialog.cancel();
              };

              $scope.selectedCoverImage = function (file) {

              };

              $scope.submitEditedWork = function () {
                if (VideoCoverImage.image.length === 0) {
                  $mdToast.show ('coverImage');
                  return;
                }

              };

            },
            clickOutsideToClose: true,
            templateUrl: 'modules/bw-interface/client/views/edit-video-work.html'
          });
        };
      },
      templateUrl: 'modules/video-works/client/views/video-work.html'
    };

    return directive;
  }

}());
