(function () {
  'use strict';
  angular
    .module('cycler', ['ngMaterial', 'ngAnimate'])
    .controller('SliderController', SliderController);

  SliderController.$inject = ['$scope', '$rootScope', '$http', 'CyclerImages'];

  function SliderController ($scope, $rootScope, $http, CyclerImages, $ngAnimate ) {
    $scope.onLoaded = {};
    CyclerImages.getCyclerImages();
    $scope.getCyclerImages = function() {
      console.log("service: " + CyclerImages);
      //CyclerImages.getCyclerImages();
    };
    angular.element(document).ready(function ($scope) {
      //document.getElementById('slider-id').innerHTML = 'Hello';
      //$scope.onLoaded = true;

      console.log ("READY");



    });


    $scope.$on( 'images.update', function(event) {
      var temp = CyclerImages.images;

      $scope.cyclerImages = temp;
     // console.log ("$scope.cyclerImages.length: ", $scope.cyclerImages.length);
      /*
      $scope.cyclerImages.forEach (function(image) {
        console.log ("for each");
        image.cssClass = false;
        console.log ('current image: ', image);
      });*/
     // console.log("images!: ", $scope.cyclerImages);
      //$scope.cyclerImages[0].cssClass = true;
      //console.log("cyclerImages: " + JSON.stringify($scope.cyclerImages));
    });




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
