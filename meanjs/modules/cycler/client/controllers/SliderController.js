(function () {
  'use strict';
  angular
    .module('cycler', ['ngMaterial', 'ngAnimate'])
    .controller('SliderController', SliderController);

  SliderController.$inject = ['$scope', '$rootScope', '$http', 'CyclerImages'];

  function SliderController ($scope, $rootScope, $http, CyclerImages, $ngAnimate ) {
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

    $scope.getCyclerImages = function() {
      console.log("service: " + CyclerImages);
      CyclerImages.getCyclerImages();
    };

    $scope.$on( 'images.update', function(event) {
      var temp = CyclerImages.images;
      $scope.cyclerImages = temp;
      console.log("temp!: ", temp);

      console.log("cyclerImages: " + JSON.stringify($scope.cyclerImages));
    });
  }
}());
