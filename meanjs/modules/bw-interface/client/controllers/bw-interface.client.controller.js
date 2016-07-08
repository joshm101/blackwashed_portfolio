(function() {
  'use strict';

  angular
    .module('bw-interface', ['ngFileUpload', 'ngMaterial'])
    .controller('InterfaceController', InterfaceController);

  InterfaceController.$inject = ['$scope', '$rootScope', 'Upload', '$mdDialog', '$http'];

  function InterfaceController ($scope, $rootScope, Upload, $mdDialog, $http) {
    $scope.upload = function (file) {
      console.log("$scope.upload");
      Upload.upload({
        url: '/api/images/upload_cycler_image',
        data: {file: file}
      }).then (function (resp) {
        console.log('Success: ' + resp.config.data.file.name + 'uploaded. Response: ' +resp.data);
      }, function (resp) {
        console.log('Error status:  ' + resp.status);
      }, function (evt) {
        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
        console.log("progress: " + progressPercentage + '% ' + evt.config.data.file.name);
      });
    };
  }
}());
