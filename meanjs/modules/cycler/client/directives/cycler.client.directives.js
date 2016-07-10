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
        scope.currentIndex = 0; // Initially the index is at the first image
        scope.justLoaded = true;

        scope.next = function() {
          console.log("scope.next");
          console.log("scope.images.length: " + scope.images.length);
          if(scope.images.length === 1) {

            // if there's only one image to rotate through,
            // don't ever try and change the index and
            // keep the only image always visible.
            scope.currentIndex = 0;
            console.log("scope.currentIndex: ", scope.currentIndex);
            scope.images[scope.currentIndex].visible = true;
          } else {

            // scope.$watch is tripped when the page initially loads
            // and currentIndex is set to 0 because that is
            // technically a "change," meaning that this function,
            // scope.next, is triggered, so we get a premature
            // index increment. This means that the first image
            // is skipped on the first rotation through the images.
            // the boolean justLoaded fixes that issue.
            if (scope.justLoaded === true) {
              scope.justLoaded = false;
              scope.currentIndex = 0;
              scope.images[scope.currentIndex].visible = true;
            } else {
              scope.currentIndex < scope.images.length - 1 ? scope.currentIndex ++ : scope.currentIndex = 0;
            }
          }
        };

        scope.prev = function() {
          scope.currentIndex > 0 ? scope.currentIndex-- : scope.currentIndex = scope.images.length - 1;
        };

        scope.$watch('currentIndex', function () {
          if (typeof scope.images !== 'undefined') {
            console.log("scope.images.length: " + scope.images.length);
            console.log("scope.images: ", scope.images);
            scope.images.forEach(function(image) {
              console.log("here");
              image.visible = false; // make every image invisible
            });
            console.log("scope.currentIndex !=undefined: " + scope.currentIndex);
            scope.images[scope.currentIndex].visible = true; // make the current image visible
          }
        });

        var timer;
        var sliderFunc = function() {
          timer = $timeout(function() {
            scope.next();
            timer = $timeout(sliderFunc, 3000);
          }, 1000);
        };

        sliderFunc();

        scope.$on('$destroy', function() {
          $timeout.cancel(timer); // when the scope is getting destroyed, cancel the timer
        });
      },
      templateUrl: 'modules/cycler/client/views/image-slider.html'
    };
    return directive;
  }
}());
