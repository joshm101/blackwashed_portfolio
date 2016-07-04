(function () {
  'use strict';
  angular.module('cycler')
    .directive('imageSlider', imageSlider);

  imageSlider.$inject = ['$rootScope', '$timeout', '$interpolate', '$state'];

  // thanks to
  // https://www.sitepoint.com/creating-slide-show-plugin-angularjs/
  function imageSlider($rootScope, $timeout, $interpolate, $state) {
    var directive = {
      restrict: 'E',
      replace: true,
      scope: {
        images: '='
      },
      link: function(scope, elem, attrs) {
        scope.currentIndex = 0; // Initially the index is at the first iamge

        scope.next = function() {
          scope.currentIndex < scope.images.length - 1 ? scope.currentIndex ++ : scope.currentIndex = 0;
        };

        scope.prev = function() {
          scope.currentIndex > 0 ? scope.currentIndex-- : scope.currentIndex = scope.images.length - 1;
        };

        scope.$watch('currentIndex', function () {
          scope.images.forEach(function(image) {
            console.log("here");
            image.visible = false; // make every image invisible
          });

          scope.images[scope.currentIndex].visible = true; // make the current image visible

        });
      },
      templateUrl: 'modules/cycler/client/views/image-slider.html'
    };
    return directive;
  }
}());
