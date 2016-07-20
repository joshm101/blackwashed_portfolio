(function() {
  'use strict';

  angular
    .module('photoWorks')
    .controller(PhotoWorksController);

  PhotoWorksController.$inject = ['$scope', '$rootScope', 'Upload', '$mdDialog',
                                  '$mdToast', '$http', 'CyclerImages',
                                  'SelectedImages', 'PhotoWorks'];

  function PhotoWorksController ($scope, $rootScope, Upload, $mdDialog, $mdToast,
                                 $http, CyclerImages, SelectedImages, PhotoWorks) {

    $scope.$on( 'photoWorks.update', function (event) {
      $scope.photoWorks = PhotoWorks.photoWorks;
    });
  }
}());
