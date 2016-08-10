(function() {
  'use strict';

  angular
    .module('bw-interface', ['ngFileUpload', 'ngMaterial', 'core', 'photoWorks', 'videoWorks', 'about'])
    .controller('InterfaceController', InterfaceController);
    // .controller('fabController', fabController);

  InterfaceController.$inject = ['$scope', '$rootScope', '$state', 'Upload', '$mdDialog',
                                 '$mdToast', '$http', 'CyclerImages',
                                 'SelectedImages', 'PhotoWorks', 'VideoWorks', 'AboutPageService', 'AboutImage'];
  // fabController.$inject = ['$scope', '$rootScope', '$mdDialog', '$http', '$timeout'];

  function InterfaceController ($scope, $rootScope, $state, Upload, $mdDialog,
                                $mdToast, $http, CyclerImages,
                                SelectedImages, PhotoWorks, VideoWorks, AboutPageService, AboutImage) {

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
      switch (error) {
        case ('images'):
          $mdToast.show(
            $mdToast.simple()
              .textContent('Please add at least one image.')
              .position(pinTo )
              .hideDelay(3000)
          );
          break;
        case ('title'):
          $mdToast.show (
            $mdToast.simple()
              .textContent ('Another work with that title already exists.')
              .position (pinTo)
              .hideDelay (3000)
          );
          break;
        case ('video-image'):
          $mdToast.show(
            $mdToast.simple()
              .textContent('Please add a cover image.')
              .position(pinTo )
              .hideDelay(3000)
          );
          break;
        case ('missing-title'):
          $mdToast.show(
            $mdToast.simple()
              .textContent('Please add a title.')
              .position(pinTo )
              .hideDelay(3000)
          );
          break;
        case ('video-url'):
          $mdToast.show(
            $mdToast.simple()
              .textContent('Please add a video URL.')
              .position(pinTo )
              .hideDelay(3000)
          );
          break;
      }
    };

    $scope.editedModelsFormInput = {};

    $scope.modelsFormInput = {};
    $scope.copyright = '';
    $scope.photoWorkTitle = '';

    $scope.castFormInput = {};
    $scope.videoWorkTitle = '';
    $scope.videoUrl = '';
    $scope.directedByFormInput = {};
    $scope.editedByFormInput = {};
    $scope.videoCoverImage = [];

    $scope.postText = '';

    $scope.bwUploading = {
      visibility: 'hidden'
    };

    $scope.upload = function (file) {
      console.log("file is: " + JSON.stringify(file));
      CyclerImages.uploadCyclerImage(file);
    };

    $scope.getCyclerImages = function () {
      CyclerImages.getCyclerImages();

    };

    $scope.initializePage = function () {
      console.log("initializePage()");
      CyclerImages.getCyclerImages();
      PhotoWorks.getPhotoWorks();
      VideoWorks.getVideoWorks();
      AboutPageService.getAbout();
    };

    $scope.deleteImage = function () {

    };

    $scope.signOut = function () {
      $http.get ('/api/auth/signout')
        .then (function (resp) {
          if (resp.status === 200) {
            $state.go ('home');
          }
        });
    };

    $scope.editAbout = function () {
      $mdDialog.show ({
        controller: function (scope) {
          console.log ("ok");
          console.log ('AboutPageService.about: ', AboutPageService.about);
          scope.imageUrl = '';
          scope.aboutText = '';
          if (AboutPageService.about.length === 0) {
            scope.aboutPage = {};
            console.log ('null');
            scope.imageUrl = '';
          } else {
            //console.log ('AboutPageService.about: ', AboutPageService.)
            scope.aboutPage = AboutPageService.about[0];
            scope.aboutText = scope.aboutPage.text;
            scope.imageUrl = scope.aboutPage.imageUrl;
          }

          scope.submit = function () {
            // new image was selected, we will need to upload
            if (AboutImage.newImage.length > 0) {
              Upload.upload({
                url: '/api/about/edit_about_page',
                arrayKey: '',
                data: {
                  file: AboutImage.newImage[0],
                  aboutText: scope.aboutText
                }
              }).then (function (resp) {
                console.log ('success');
                console.log ('resp: ', resp);
                AboutPageService.updateAbout (resp.data);
                $mdDialog.hide()
              }, function (resp) {
                console.log ('error: ', resp);
              }, function (evt) {
                console.log('status: ', evt);
              });
            } else {
              // no new image selected, submit text
              Upload.upload ({
                url: '/api/about/edit_about_page',
                arrayKey: '',
                data: {
                  aboutText: scope.aboutText
                }
              }).then (function (resp) {
                console.log ('success');
                console.log ('resp: ', resp);
                AboutPageService.updateAbout (resp.data);
                $mdDialog.hide()
              }, function (resp) {
                console.log ('error: ', resp);
              }, function (evt) {
                console.log ('status: ', evt);
              });
            }
          };

          $rootScope.hide = function () {
            $mdDialog.hide();
          };

          scope.cancel = function () {
            $mdDialog.cancel();
          };

          $rootScope.answer = function (answer) {
            $mdDialog.hide(answer);
          }
        },
        templateUrl: 'modules/bw-interface/client/views/edit-about.html',
        parent: angular.element (document.body),
        clickOutsideToClose: true,
        fullscreen: false
      });
    };

    $scope.submitVideoWork = function () {
      console.log("submitting video work");
      console.log ('postText: ', $scope.postText);
      console.log ('castFormInput: ', $scope.castFormInput);
      console.log ('copyright: ', $scope.copyright);
      console.log ('videoWorkTitle: ', $scope.videoWorkTitle);
      console.log ('editorFormInput: ', $scope.editedByFormInput);
      console.log ('directorFormInput: ', $scope.directedByFormInput);
      console.log ('videoUrl: ', $scope.videoUrl);

      console.log ('videoCoverImage: ', $rootScope.videoCoverImage);

      if (angular.equals([], $rootScope.videoCoverImage)){
        console.log('Must add at least one image');
        $scope.showSimpleToast('video-image');
        return;
      } else {

        if ($scope.videoWorkTitle === '') {
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

          if ($scope.videoUrl === '') {
            $scope.showSimpleToast ('video-url');
            return;
          }
        }

      }

      console.log ('typeof videoCoverImage ', typeof $rootScope.videoCoverImage);

      var castArray = [];
      for (var member in $scope.castFormInput) {
        castArray.push ($scope.castFormInput[member]);
      }

      var directorArray = [];
      for (var director in $scope.directedByFormInput) {
        directorArray.push ($scope.directedByFormInput[director]);
      }

      var editorArray = [];
      for (var editor in $scope.editedByFormInput) {
        editorArray.push ($scope.editedByFormInput[editor]);
      }

      var coverImageFile = $rootScope.videoCoverImage;


      var videoWork = {
        title: $scope.videoWorkTitle,
        cast: castArray,
        directedBy: directorArray,
        editedBy: editorArray,
        workInfo: $scope.postText,
        copyright: $scope.copyright,
        videoUrl: $scope.videoUrl
      };

      $scope.bwUploading.visibility = 'visible';
      Upload.upload({
        url: '/api/video_works/add_video_work',
        arrayKey: '',
        data: {
          file: coverImageFile,
          videoWork: JSON.stringify (videoWork)
        }
      }).then (function (resp) {
        console.log("Success: ", resp);
        VideoWorks.addVideoWork (resp.data);
        $scope.progressBarValue = 0;
        $scope.bwUploading.visibility = 'hidden';
        $mdDialog.hide();
        $scope.editedByFormInput = [];
        $scope.directedByFormInput = [];
        $scope.castFormInput = [];
        $scope.videoUrl = '';
        $scope.copyright = [];
        $scope.postText = '';
        $scope.videoWorkTitle = '';
      }, function (resp) {
        console.log ("Error: ", resp);
      }, function (evt) {
        console.log ('progress: ', evt);
        $scope.progressBarValue = (evt.loaded / evt.total) * 100;
      });

    };

    $scope.addPhotoWorkImages = [];

    $scope.getPhotoWorks = function () {
      PhotoWorks.getPhotoWorks();
      console.log("photoWorks: " + PhotoWorks.photoWorks);
    };

    $scope.submitPhotoWork = function (event) {
      console.log("submitting");
      console.log("postText: ", $scope.postText);
      console.log("modeslFormInput: " + JSON.stringify($scope.modelsFormInput));
      console.log("copyright: " + $scope.copyright);
      console.log("photoWorkTitle: " + $scope.photoWorkTitle);
      console.log("SelectedImages: " + JSON.stringify(SelectedImages.images));
      $scope.progressBarValue = 0;

      var models = $scope.modelsFormInput;


      if (angular.equals([], SelectedImages.images)){
        console.log('Must add at least one image');
        $scope.showSimpleToast('images');
        return;
      } else {
        if ($scope.photoWorkTitle === '') {
          $scope.showSimpleToast ('missing-title');
          return;
        } else {

          // check if the entered work title already exists
          // (another work with the same name already exists).
          for (var i = 0; i < PhotoWorks.photoWorks.length; ++i) {
            if (PhotoWorks.photoWorks[i].title === $scope.photoWorkTitle) {
              $scope.showSimpleToast ('title');
              return;
            }
          }
          for (var i = 0; i < VideoWorks.videoWorks.length; ++i) {
            if (VideoWorks.videoWorks[i].title === $scope.photoWorkTitle) {
              $scope.showSimpleToast ('title');
              return;
            }
          }
        }

      }

      var modelsArray = [];
      for (var model in models) {
        console.log("models: " + models[model]);
        modelsArray.push(models[model]);
      }

      $scope.bwUploading.visibility = 'visible';

      // upload inputted fields including pictures
      Upload.upload({
        url: '/api/photo_works/add_photo_work',

        // use  this option to ensure that ng-file-upload
        // does not break an array up and create JSON keys
        // for each individual array index.
        arrayKey: '',
        data: {
          file: SelectedImages.images,
          postText: $scope.postText,
          workTitle: $scope.photoWorkTitle,
          copyright: $scope.copyright,
          models: modelsArray
        }
      }).then (function (resp) {
        console.log("Success: " + resp);
        console.log(JSON.stringify(resp.data));
        PhotoWorks.addPhotoWork(resp.data);
        $scope.postText = '';
        $scope.photoWorkTitle = '';
        $scope.copyright = '';
        $scope.modelsFormInput = [];
        SelectedImages.images = [];
        $mdDialog.hide();

      }, function (resp) {
        console.log("error status: " + resp.status);
        $scope.progressBarValue = 0;
        $scope.bwUploading.visibility = 'hidden';
      }, function (evt) {
        console.log("evt: ", evt);
        $scope.progressBarValue = (evt.loaded / evt.total) * 100;
      });
    };

    $scope.$on( 'images.update', function(event) {
      var temp = CyclerImages.images;
      $scope.cyclerImages = temp;
      console.log("temp!: ", temp);

      console.log("cyclerImages: " + JSON.stringify($scope.cyclerImages));
    });

    $scope.$on ( 'photoWorks.update', function (event) {
      console.log("scope.on photoWorks.update");
      var temp = PhotoWorks.photoWorks;
      $scope.photoWorksArray = temp;
      console.log('$scope.photoWorksArray = ' + $scope.photoWorksArray);
    });

    $scope.$on ( 'videoWorks.update', function (event) {
      console.log ("scope.on videoWorks.update");
      var temp = VideoWorks.videoWorks;
      $scope.videoWorksArray = temp;
      console.log ('$scope.videoWorksArray: ', $scope.videoWorksArray);
    });

    $scope.$on ( 'SelectedImages.update', function (event) {
      $scope.addPhotoWorkImages = SelectedImages.images;
    });
  }

}());
