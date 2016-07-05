(function () {
  'use strict';
  angular
    .module('cycler', ['ngMaterial', 'ngAnimate'])
    .controller('SliderController', SliderController);

  SliderController.$inject = ['$scope', '$rootScope', '$http'];

  function SliderController ($scope, $rootScope, $http, $ngAnimate) {
    $scope.images = [{
      the_src: 'modules/cycler/client/img/slideshow_1.jpg',
      title: 'Pic 1'},
      { the_src: 'modules/cycler/client/img/slideshow_2.jpg',
        title: 'Pic 2'},
      { the_src: 'modules/cycler/client/img/slideshow_3.jpg',
        title: 'Pic 3'},
      { the_src: 'modules/cycler/client/img/slideshow_5.jpg',
        title: 'Pic 4'}
      ];
  }
}());
