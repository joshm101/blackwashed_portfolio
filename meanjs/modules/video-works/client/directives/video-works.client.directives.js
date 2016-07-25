(function () {
  'use strict';

  angular
    .module ('videoWorks')
    .directive("videoWork", videoWork);

  videoWork.$inject = ['$rootScope', '$http', '$timeout', '$mdDialog', '$mdMedia',
                       '$mdToast', 'VideoWorks', 'VideoCoverImage', 'Upload'];


  function videoWork ($rootScope, $http, $timeout, $mdDialog, $mdMedia,
                      $mdToast, VideoWorks, VideoCoverImage, Upload) {
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

        scope.deleteVideoWork = function (work) {
          console.log ('deleteVideoWork()');
          VideoWorks.deleteVideoWork (work);
        };

        scope.editVideoWork = function () {
          console.log ('editVideoWork()');

          scope.castModel = [];
          scope.directorsModel = [];
          scope.editorsModel = [];
          scope.editors = scope.work.editedBy;
          scope.directors = scope.work.directedBy;
          scope.cast = scope.work.cast;

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
              editorsModel: scope.editorsModel,
              coverImageUrl: scope.coverImageUrl
            },
            controller: function ($scope, $rootScope, $mdDialog, $mdToast,
                                  work, cast, editors, directors,
                                  castModel, editorsModel, directorsModel, coverImageUrl) {
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
              $scope.cast = work.cast;
              $scope.editors = work.editedBy;
              $scope.directors = work.directedBy;
              $scope.castModel = castModel;
              $scope.editorsModel = editorsModel;
              $scope.directorsModel = directorsModel;


              var oldWorkTitle = work.title;
              console.log('oldWorkTitle: ', oldWorkTitle);
              var oldCast = work.cast;
              console.log("oldCast: ", oldCast);
              var oldVideoUrl = work.videoUrl;
              var oldEditors = work.editedBy;
              var oldDirectors = work.directedBy;
              var oldCopyright = work.copyright;
              var oldWorkInfo = work.workInfo;
              var oldCastModel = castModel;
              var oldEditorsModel = editorsModel;
              var oldDirectorsModel = directorsModel;

              $scope.cancelEdit = function () {
                console.log("oldWorkTitle: ", oldWorkTitle);
                console.log("oldCast: ", oldCast);
                console.log ('$scope.cast: ', $scope.cast);
                console.log ("$scope.directors: ", $scope.directors);
                console.log ("$scope.editors: ", $scope.editors);
                work.title = oldWorkTitle;
                work.cast = $scope.cast;
                work.editedBy = $scope.editors;
                work.directedBy = $scope.directors;
                work.videoUrl = oldVideoUrl;
                work.copyright = oldCopyright;
                work.workInfo = oldWorkInfo;
                $scope.castModel = oldCastModel;
                $scope.directorsModel = oldDirectorsModel;
                $scope.editorsModel = oldEditorsModel;
                $mdDialog.cancel();
              };

              $scope.selectedCoverImage = function (file) {
                VideoCoverImage.addImage (file);
              };

              $scope.submitEditedWork = function () {
                console.log ('work.title: ', work.title);
                console.log ('work.editedBy: ', work.editedBy);
                console.log ('work.directedBy: ', work.directedBy);
                console.log ('work.cast: ', work.cast);
                console.log ('work.copyright: ', work.copyright);
                console.log ('work.videoUrl: ', work.videoUrl);
                console.log ('work.workInfo: ', work.workInfo);
                console.log ('work.coverImageUrl: ', work.coverImageUrl);

                if (VideoCoverImage.image.length !== 0) {
                  // new cover image selected
                  console.log('VideoCoverImage: ', VideoCoverImage.image);
                  Upload.upload({
                    url: '/api/video_works/edit_video_work',
                    arrayKey: '',
                    data: {
                      file: VideoCoverImage.image[0],
                      work: JSON.stringify (work)
                    }
                  }).then (function (resp) {
                    console.log ("Success: ", resp);
                    var edit = resp.data;
                    console.log ('resp.data: ', edit);
                    VideoWorks.addEdit (edit);
                    work = edit;
                    coverImageUrl = edit.coverImageUrl;
                    $mdDialog.hide ();
                  }, function (resp) {
                    console.log ("resp.status: ", resp.status);
                  }, function (evt) {
                    console.log ("evt: ", evt);
                  });
                } else {

                  // no new cover image selected
                  Upload.upload ({
                    url: '/api/video_works/edit_video_work',
                    arrayKey: '',
                    data: {
                      file: {},
                      work: JSON.stringify (work)
                    }
                  }).then (function (resp) {
                    console.log ("Success: ", resp);
                    var edit = resp.data;
                    console.log ('resp.data: ', edit);
                    VideoWorks.addEdit (edit);
                    work = edit;
                    coverImageUrl = edit.coverImageUrl;
                    $mdDialog.hide ();
                  }, function (resp) {
                    console.log ("resp.status: ", resp.status);
                  }, function (evt) {
                    console.log ("evt: ", evt);
                  });
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
