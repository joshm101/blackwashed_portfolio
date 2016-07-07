(function() {
  'use strict';

  angular
    .module('bw-interface', ['ngMaterial'])
    .controller('InterfaceController', InterfaceController);

  InterfaceController.$inject = ['$scope', '$rootScope', '$mdDialog', '$http'];

  function InterfaceController ($scope, $rootScope, $mdDialog, $http) {

  }
}());
