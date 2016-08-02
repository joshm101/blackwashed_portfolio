(function () {
  'use strict';

  angular
    .module('core')
    .controller('HomeController', HomeController);
  HomeController.$inject = ['$scope', '$rootScope', '$state', 'Upload',
                            '$mdDialog', '$mdToast', '$http'];

  function HomeController($scope, $rootScope, $state, Upload, $mdDialog, $mdToast, $http) {
    var vm = this;

    $scope.contact = function (ev) {
      console.log ("scope.contact");
      $mdDialog.show({
        controller: function (scope) {
          scope.message = '';

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
        templateUrl: 'modules/core/client/views/contact-form.html',
        parent: angular.element(document.body),
        clickOutsideToClose: false,
        fullscreen: false,
        targetEvent: ev
      });
    };

    $scope.about = function () {
      $state.go ('about');
    };
  }
}());
