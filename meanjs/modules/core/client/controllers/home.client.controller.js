(function () {
  'use strict';

  angular
    .module('core')
    .controller('HomeController', HomeController);
  HomeController.$inject = ['$scope', '$rootScope', '$state', 'Upload',
                            '$mdDialog', '$mdToast', '$http', 'AboutPageService'];

  function HomeController($scope, $rootScope, $state, Upload, $mdDialog, $mdToast, $http, AboutPageService, $ngAnimate) {
    var vm = this;
    $scope.show = false;
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

    $scope.getAboutPage = function () {
      AboutPageService.getAbout();
    };

    $scope.goHome = function () {
      //$state.go ('home');
      /*
      $state.transitionTo('home', {}, {
        reload: true
      }).then(function() {
        $scope.hideContent = true;
        return $timeout(function () {
          return $scope.hideContent = false;
        }, 1);
      });*/

      window.location.href = '/';
    };



    $scope.$on ( 'AboutPageService.update', function () {
      $scope.aboutObject = AboutPageService.about;
      console.log ('update aboutpageservice');
      console.log ('$scope.aboutObject: ', $scope.aboutObject);
      $scope.show = true;
    });
  }
}());
