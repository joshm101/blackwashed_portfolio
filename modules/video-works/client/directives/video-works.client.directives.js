(function () {
  'use strict';

  angular
    .module ('videoWorks')
    .directive("videoWork", videoWork)
    .directive ("viewVideoWork", viewVideoWork);

  videoWork.$inject = ['$rootScope', '$http', '$timeout', '$mdDialog', '$mdMedia',
                       '$mdToast', '$sce', 'VideoWorks', 'PhotoWorks', 'VideoCoverImage', 'Upload'];
  viewVideoWork.$inject = ['$rootScope', '$http', '$timeout', '$mdDialog',
                           '$mdMedia', '$mdToast', '$sce', 'VideoWorks', 'PhotoWorks', 'VideoCoverImage',
                           'Upload'];

  function viewVideoWork ($rootScope, $http, $timeout, $mdDialog, $mdMedia,
                          $mdToast, $sce, VideoWorks, PhotoWorks, VideoCoverImage, Upload) {
    var directive = {
      restrict: 'E',
      scope: {
        work: '='
      },
      link: function (scope) {

      },
      templateUrl: 'modules/video-works/client/views/view-video-work.html'
    };

    return directive;
  }

  function videoWork ($rootScope, $http, $timeout, $mdDialog, $mdMedia,
                      $mdToast, $sce, VideoWorks, PhotoWorks, VideoCoverImage, Upload) {
    var directive = {
      restrict: 'E',
      scope: {
        work: '='
      },
      link: function (scope, elem, attr) {

        scope.customFullscreen = $mdMedia('xs') || $mdMedia ('sm');
        scope.coverImageUrl = scope.work.coverImageUrl;
        scope.showVideoWork = function (ev) {

          var useFullScreen = ($mdMedia ('sm') || $mdMedia ('xs'))
                              && scope.customFullscreen;
          $rootScope.currentWork = scope.work;
          $mdDialog.show ({
            controller: function (scope, $mdDialog, $sce, work) {
              scope.workTitle = work.title;
              scope.workInfo = work.workInfo;
              scope.directors = work.directedBy;
              scope.editors = work.editedBy;
              scope.cast = work.cast;
              scope.copyright = work.copyright;

              // thanks to
              // http://stackoverflow.com/a/23945027
              function extractDomain(url) {
                var domain;
                //find & remove protocol (http, ftp, etc.) and get domain
                if (url.indexOf("://") > -1) {
                  domain = url.split('/')[2];
                }
                else {
                  domain = url.split('/')[0];
                }

                //find & remove port number
                domain = domain.split(':')[0];

                return domain;
              }

              var domain = extractDomain (work.videoUrl);

              if (domain === 'youtube.com' ||
                  domain === 'www.youtube.com') {

                scope.domain = 'youtube';
                var videoUrl = work.videoUrl.replace ("watch?v=", "embed/");
                scope.videoUrl = $sce.trustAsResourceUrl (videoUrl);
              }

              if (domain === 'vimeo.com' ||
                  domain === 'www.vimeo.com') {
                //player.vimeo.com/video/175738725
                var vimeoId = work.videoUrl.substring (
                                  work.videoUrl.lastIndexOf('/') + 1);
                var videoUrl = '//player.vimeo.com/video/' + vimeoId;
                scope.videoUrl = $sce.trustAsResourceUrl (videoUrl);
                scope.domain = 'vimeo';

                scope.vimeoId = vimeoId;
              }

              if (domain === 'facebook.com' ||
                  domain === 'www.facebook.com') {
                scope.videoUrl = 'https://www.facebook.com/plugins/video.php?href=' + work.videoUrl;
                scope.videoUrl = $sce.trustAsResourceUrl (scope.videoUrl);
                scope.domain = 'facebook';

              }

              $rootScope.hide = function () {
                $mdDialog.hide();
              };

              scope.cancel = function () {
                $mdDialog.cancel();
              };

              $rootScope.answer = function (answer) {
                $mdDialog.hide (answer);
              }
            },
            locals: {
              work: scope.work
            },
            templateUrl: 'modules/video-works/client/views/view-video-work.html',
            parent: angular.element (document.body),
            targetEvent: ev,
            autoWrap: false,
            clickOutsideToClose: true,
            fullscreen: useFullScreen
          });
        };

        scope.deleteVideoWork = function (work) {

          VideoWorks.deleteVideoWork (work);
        };

        scope.editVideoWork = function () {


          scope.castModel = [];
          scope.directorsModel = [];
          scope.editorsModel = [];
          scope.editors = scope.work.editedBy;
          scope.directors = scope.work.directedBy;
          scope.cast = scope.work.cast;



          // iterate through the currently set models for the photo work
          for (var i = 0; i < scope.work.cast.length; ++i) {


            // push each cast member onto the data model for              // this for loop might be unnecessary
            // cast input on video work
            scope.castModel.push({name: 'cast_' + i});
            scope.castNumber = i;
          }

          // iterate through the currently set models for the photo work
          for (var i = 0; i < scope.work.directedBy.length; ++i) {

            // push each director onto the data model for              // this for loop might be unnecessary
            // directors input on video work
            scope.directorsModel.push({name: 'director_' + i});
            scope.directorNumber = i;
          }

          // iterate through the currently set models for the photo work
          for (var i = 0; i < scope.work.editedBy.length; ++i) {

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
                if (error === 'images') {
                  $mdToast.show(
                    $mdToast.simple()
                      .textContent('Please add at least one image.')
                      .position(pinTo )
                      .hideDelay(3000)
                  );
                } else {
                  if (error === 'title') {
                    $mdToast.show (
                      $mdToast.simple()
                        .textContent ('Another work with that title already exists.')
                        .position (pinTo)
                        .hideDelay (3000)
                    );
                  } else {
                    if (error === 'video-image') {
                      $mdToast.show(
                        $mdToast.simple()
                          .textContent('Please add a cover image.')
                          .position(pinTo )
                          .hideDelay(3000)
                      );
                    } else {
                      if (error === 'missing-title') {
                        $mdToast.show(
                          $mdToast.simple()
                            .textContent('Please add a title.')
                            .position(pinTo )
                            .hideDelay(3000)
                        );
                      } else {
                        if (error === 'video-url') {
                          $mdToast.show(
                            $mdToast.simple()
                              .textContent('Please add a video URL.')
                              .position(pinTo )
                              .hideDelay(3000)
                          );
                        }
                      }
                    }
                  }
                }
              };

              $scope.work = work;
              $scope.cast = work.cast;
              $scope.editors = work.editedBy;
              $scope.directors = work.directedBy;
              $scope.castModel = castModel;
              $scope.editorsModel = editorsModel;
              $scope.directorsModel = directorsModel;
              $scope.bwUploading = {
                visibility: 'hidden'
              };


              var oldWorkTitle = work.title;
              var oldCast = work.cast;
              var oldVideoUrl = work.videoUrl;
              var oldEditors = work.editedBy;
              var oldDirectors = work.directedBy;
              var oldCopyright = work.copyright;
              var oldWorkInfo = work.workInfo;
              var oldCastModel = castModel;
              var oldEditorsModel = editorsModel;
              var oldDirectorsModel = directorsModel;

              $scope.cancelEdit = function () {
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

                for (var i = 0; i < work.directedBy.length; ++i) {
                  if (work.directedBy[i] === '' || work.directedBy[i].match(/^\s*$/)) {
                    work.directedBy.splice(i, 1);
                    i = 0;
                  }
                }

                for (var i = 0; i < work.editedBy.length; ++i) {
                  if (work.editedBy[i] === '' || work.editedBy[i].match(/^\s*$/)) {
                    work.editedBy.splice(i, 1);
                    i = 0;
                  }
                }

                for (var i = 0; i < work.cast.length; ++i) {
                  if (work.cast[i] === '' || work.cast[i].match(/^\s*$/)) {
                    work.cast.splice(i, 1);
                    i = 0;
                  }
                }


                if (angular.equals([], $rootScope.videoCoverImage)){
                  $scope.showSimpleToast('video-image');
                  return;
                } else {

                  if (work.title === '') {
                    $scope.showSimpleToast ('missing-title');
                    return;
                  } else {
                    // check if the entered work title already exists
                    // (another work with the same name already exists).
                    for (var i = 0; i < PhotoWorks.photoWorks.length; ++i) {
                      if (PhotoWorks.photoWorks[i].title === $scope.photoWorkTitle) {
                        $scope.showSimpleToast('title');
                        return;
                      }
                    }
                    for (var i = 0; i < VideoWorks.videoWorks.length; ++i) {
                      if (VideoWorks.videoWorks[i].title === $scope.photoWorkTitle) {
                        $scope.showSimpleToast('title');
                        return;
                      }
                    }

                    if (work.videoUrl === '') {
                      $scope.showSimpleToast ('video-url');
                      return;
                    }
                  }

                }

                if (VideoCoverImage.image.length !== 0) {
                  $scope.bwUploading.visibility = 'visible';
                  // new cover image selected
                  Upload.upload({
                    url: '/api/video_works/edit_video_work',
                    arrayKey: '',
                    data: {
                      file: VideoCoverImage.image[0],
                      work: JSON.stringify (work)
                    }
                  }).then (function (resp) {
                    var edit = resp.data;
                    VideoWorks.addEdit (edit);
                    work = edit;
                    coverImageUrl = edit.coverImageUrl;
                    $scope.uploadProgress = 0;
                    $scope.bwUploading.visibility = 'hidden';
                    VideoCoverImage.image = [];
                    $mdDialog.hide ();
                    (function(d, s, id) {
                      var js, fjs = d.getElementsByTagName(s)[0];
                      if (d.getElementById(id)) return;
                      js = d.createElement(s); js.id = id;
                      js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.7";
                      fjs.parentNode.insertBefore(js, fjs);
                    }(document, 'script', 'facebook-jssdk'));
                  }, function (resp) {
                  }, function (evt) {
                    $scope.uploadProgress = (evt.loaded / evt.total) * 100;
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
                    var edit = resp.data;
                    VideoWorks.addEdit (edit);
                    work = edit;
                    coverImageUrl = edit.coverImageUrl;
                    $mdDialog.hide ();
                    (function(d, s, id) {
                      var js, fjs = d.getElementsByTagName(s)[0];
                      if (d.getElementById(id)) return;
                      js = d.createElement(s); js.id = id;
                      js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.7";
                      fjs.parentNode.insertBefore(js, fjs);
                    }(document, 'script', 'facebook-jssdk'));
                  }, function (resp) {
                  }, function (evt) {
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
