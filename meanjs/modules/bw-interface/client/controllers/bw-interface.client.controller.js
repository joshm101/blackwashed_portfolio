(function() {
  'use strict';

  angular
    .module('bw-interface', ['ngFileUpload', 'ngMaterial', 'core'])
    .controller('InterfaceController', InterfaceController);
    // .controller('fabController', fabController);

  InterfaceController.$inject = ['$scope', '$rootScope', 'Upload', '$mdDialog', '$http', 'CyclerImages', 'SelectedImages'];
  // fabController.$inject = ['$scope', '$rootScope', '$mdDialog', '$http', '$timeout'];

  function InterfaceController ($scope, $rootScope, Upload, $mdDialog, $http, CyclerImages, SelectedImages) {

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

    $scope.deleteImage = function () {

    };

    $scope.submitPhotoWork = function (event) {
      console.log("submitting");
      console.log("modeslFormInput: " + JSON.stringify($scope.modelsFormInput));
      console.log("copyright: " + $scope.copyright);
      console.log("photoWorkTitle: " + $scope.photoWorkTitle);
      console.log("SelectedImages: " + JSON.stringify(SelectedImages.images));
      $mdDialog.hide();
      Upload.upload({
        url: '/api/photo_works/add_photo_work',
        data: {
          file: SelectedImages.images,
          workTitle: $scope.photoWorkTitle,
          models: $scope.modelsFormInput,
          copyright: $scope.copyright
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
  }

}());
