(function() {
  'use strict';

  angular
    .module('bw-interface', ['ngFileUpload', 'ngMaterial', 'core'])
    .controller('InterfaceController', InterfaceController);
    // .controller('fabController', fabController);

  InterfaceController.$inject = ['$scope', '$rootScope', 'Upload', '$mdDialog', '$http', 'CyclerImages', 'SelectedImages'];
  // fabController.$inject = ['$scope', '$rootScope', '$mdDialog', '$http', '$timeout'];

  function InterfaceController ($scope, $rootScope, Upload, $mdDialog, $http, CyclerImages, SelectedImages) {
    $scope.upload = function (file) {
      console.log("file is: " + JSON.stringify(file));
      CyclerImages.uploadCyclerImage(file);
    };

    $scope.getCyclerImages = function () {
      CyclerImages.getCyclerImages();

    };

    $scope.deleteImage = function () {

    };

    $scope.$on( 'images.update', function(event) {
      var temp = CyclerImages.images;
      $scope.cyclerImages = temp;
      console.log("temp!: ", temp);

      console.log("cyclerImages: " + JSON.stringify($scope.cyclerImages));
    });
  }

}());
