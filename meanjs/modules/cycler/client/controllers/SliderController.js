(function () {
  'use strict';
  angular
    .module('cycler', ['ngMaterial', 'ngAnimate'])
    .controller('SliderController', SliderController);

  SliderController.$inject = ['$scope', '$rootScope', '$http'];

  function SliderController ($scope, $rootScope, $http, $ngAnimate) {
    $scope.images = [{
      the_src: 'modules/cycler/client/img/car.jpg',
      title: 'Pic 1'},
      { the_src: 'modules/cycler/client/img/blue.jpg',
        title: 'Pic 2'},
      { the_src: 'modules/cycler/client/img/grey.jpg',
        title: 'Pic 3'},
      { the_src: 'modules/cycler/client/img/red.jpg',
        title: 'Pic 4'}
      ];
  }
}());
