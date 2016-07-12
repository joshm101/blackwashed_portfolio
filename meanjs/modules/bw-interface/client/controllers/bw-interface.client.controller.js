(function() {
  'use strict';

  angular
    .module('bw-interface', ['ngFileUpload', 'ngMaterial', 'core'])
    .controller('InterfaceController', InterfaceController)
    .controller('fabController', fabController);

  InterfaceController.$inject = ['$scope', '$rootScope', 'Upload', '$mdDialog', '$http', 'CyclerImages'];
  fabController.$inject = ['$scope', '$rootScope', '$mdDialog', '$http', '$timeout'];

  function InterfaceController ($scope, $rootScope, Upload, $mdDialog, $http, CyclerImages) {
    $scope.upload = function (file) {
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

  function fabController ($scope, $rootScope, $mdDialog, $http, $timeout) {
    var self = this;
    self.hidden = false;
    self.isOpen = false;
    self.hover = false;

    $scope.$watch('fab.isOpen', function (isOpen) {
      if (isOpen) {
        $timeout(function() {
          $scope.tooltipVisible = self.isOpen;
        }, 1000000);
      } else {
        $scope.tooltipVisible = self.isOpen;
      }
    });

    self.items = [
      { name: 'Add Photo Work', direction: 'right', icon: 'photo_camera' },
      { name: 'Add Video Work', direction: 'right', icon: 'videocam'}
    ];

    $scope.addPhotoWorkDialog = function (ev) {
      $mdDialog.show({
        controller: DialogController,
        contentElement: '#myDialog',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true
      });
    };

    function DialogController($scope, $mdDialog) {
      $scope.hide = function() {
        $mdDialog.hide();
      };
      $scope.cancel = function() {
        $mdDialog.cancel();
      };
      $scope.answer = function(answer) {
        $mdDialog.hide(answer);
      };
    }
  }
}());
