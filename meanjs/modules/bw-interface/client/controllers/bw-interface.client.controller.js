(function() {
  'use strict';

  angular
    .module('bw-interface', ['ngFileUpload', 'ngMaterial', 'core', 'photoWorks'])
    .controller('InterfaceController', InterfaceController);
    // .controller('fabController', fabController);

  InterfaceController.$inject = ['$scope', '$rootScope', 'Upload', '$mdDialog',
                                 '$mdToast', '$http', 'CyclerImages',
                                 'SelectedImages', 'PhotoWorks'];
  // fabController.$inject = ['$scope', '$rootScope', '$mdDialog', '$http', '$timeout'];

  function InterfaceController ($scope, $rootScope, Upload, $mdDialog,
                                $mdToast, $http, CyclerImages,
                                SelectedImages, PhotoWorks) {

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

    $scope.modelsFormInput = {};
    $scope.copyright = '';
    $scope.photoWorkTitle = '';


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
    };

    $scope.deleteImage = function () {

    };


    $scope.getPhotoWorks = function () {
      PhotoWorks.getPhotoWorks();
      console.log("photoWorks: " + PhotoWorks.photoWorks);
    };

    $scope.submitPhotoWork = function (event) {
      console.log("submitting");
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

      $mdDialog.hide();

      // upload inputted fields including pictures
      Upload.upload({
        url: '/api/photo_works/add_photo_work',

        // use  this option to ensure that ng-file-upload
        // does not break an array up and create JSON keys
        // for each individual array index.
        arrayKey: '',
        data: {
          file: SelectedImages.images,
          workTitle: $scope.photoWorkTitle,
          copyright: $scope.copyright,
          models: modelsArray
        }
      }).then (function (resp) {
        console.log("Success: " + resp);
        console.log(JSON.stringify(resp.data));

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
  }

}());
