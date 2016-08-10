(function () {
  'use strict';

  angular
    .module ('core')
    .controller ('AboutController', AboutController);

  AboutController.$inject = ['$state', '$rootScope', '$scope', '$http'];

  function AboutController ($state, $rootScope, $scope, $http) {

  }
}());
