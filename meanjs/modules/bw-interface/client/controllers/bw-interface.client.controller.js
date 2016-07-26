(function() {
  'use strict';

  angular
    .module('bw-interface', ['ngFileUpload', 'ngMaterial', 'core', 'photoWorks', 'videoWorks'])
    .controller('InterfaceController', InterfaceController);
    // .controller('fabController', fabController);

  InterfaceController.$inject = ['$scope', '$rootScope', 'Upload', '$mdDialog',
                                 '$mdToast', '$http', 'CyclerImages',
                                 'SelectedImages', 'PhotoWorks', 'VideoWorks'];
  // fabController.$inject = ['$scope', '$rootScope', '$mdDialog', '$http', '$timeout'];

  function InterfaceController ($scope, $rootScope, Upload, $mdDialog,
                                $mdToast, $http, CyclerImages,
                                SelectedImages, PhotoWorks, VideoWorks) {

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
    };

    $scope.deleteImage = function () {

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

      var models = $scope.modelsFormInput;


      if (angular.equals([], SelectedImages.images)){
        console.log('Must add at least one image');
        $scope.showSimpleToast('images');
        return;
      }

      var modelsArray = [];
      for (var model in models) {
        console.log("models: " + models[model]);
        modelsArray.push(models[model]);
      }

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
      }, function (evt) {
        console.log("evt: " + evt);
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
