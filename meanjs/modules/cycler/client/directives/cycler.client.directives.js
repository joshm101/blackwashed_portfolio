(function () {
  'use strict';
  angular.module('cycler')
    .directive('imageSlider', imageSlider)
    .directive ('individualImage', individualImage);

  individualImage.$inject = ['$rootScope', '$timeout', '$interpolate', '$state', '$animate'];
  imageSlider.$inject = ['$rootScope', '$timeout', '$interpolate', '$state', '$animate'];

  function individualImage ($rootScope, $timeout, $interpolate, $state, $animate) {
    var directive = {
      restrict: 'E',
      scope: {
        image: '='
      },
      link: function (scope, elem, attrs) {

      }
    };

    return directive;
  }

  // thanks to
  // https://www.sitepoint.com/creating-slide-show-plugin-angularjs/
  function imageSlider($rootScope, $timeout, $interpolate, $state, $animate) {
    var directive = {
      restrict: 'E',
      replace: true,
      scope: {
        images: '='
      },
      link: function(scope, elem, attrs) {

        elem.on ('load', function (){

        });

        $rootScope.$on('$viewContentLoaded', function() {
          console.log ("READY view view");
          console.log("scope.images on viewContentLoaded: ", scope.images);
          $rootScope.onLoaded = true;

          scope.currentIndex = 0; // Initially the index is at the first image
          console.log ('scope.currentIndex: ', scope.currentIndex);
          scope.justLoaded = true;
        });



        scope.justLoaded = true;
        scope.next = function() {

          var listItems = elem[0].childNodes[1].children[0].children;
          console.log("scope.next");
          if (typeof scope.images !== 'undefined') {
            if(scope.images.length === 1) {
              console.log("scope.images.length: " + scope.images.length);
              console.log ("scope.images.length === 1");
              // if there's only one image to rotate through,
              // don't ever try and change the index and
              // keep the only image always visible.
              scope.currentIndex = 0;
              console.log("scope.currentIndex: ", scope.currentIndex);
              // scope.images[scope.currentIndex].visible = true;
              scope.images[0].cssClass = true;

            } else {
              console.log("scope.images.length: " + scope.images.length);
              console.log ('elem is: ', elem[0].childNodes[1].children[0].children);
              // scope.$watch is tripped when the page initially loads
              // and currentIndex is set to 0 because that is
              // technically a "change," meaning that this function,
              // scope.next, is triggered, so we get a premature
              // index increment. This means that the first image
              // is skipped on the first rotation through the images.
              // the boolean justLoaded fixes that issue.
              if (scope.justLoaded === true) {

                for (var i = scope.images.length - 1; i >= 0; --i) {
                  scope.images[i].cssClass = false;
                  console.log ('setting false');
                }
                console.log ('just loaded');
                scope.justLoaded = false;
                //scope.images[0].cssClass = true;
                scope.currentIndex = 0;
                scope.images[scope.currentIndex].cssClass = true;

                // scope.images[scope.currentIndex].visible = true;

                // $animate.addClass (scope.images[scope.currentIndex], 'slide-active');
              } else {
                console.log ("else justLodaed");
                scope.currentIndex < scope.images.length - 1 ? scope.currentIndex ++ : scope.currentIndex = 0;
              }
            }
          }


        };

        scope.prev = function() {
          scope.currentIndex > 0 ? scope.currentIndex-- : scope.currentIndex = scope.images.length - 1;
        };

        scope.defaultClass = 'slide';

        scope.$watch('currentIndex', function () {
          if (typeof scope.images !== 'undefined') {
            console.log("scope.images.length: " + scope.images.length);
            console.log("scope.images: ", scope.images);
            /*
            for (var i = 0; i < scope.images.length; ++i) {
              if (i === scope.currentIndex) {
                console.log ('slide active');
                scope.images[i].cssClass = 'slide-active';
              } else {
                console.log ('slide inactive');
                scope.images[i].cssClass = 'slide-inactive';
              }
            }*/

            for (var i = scope.images.length - 1; i >= 0; --i) {
              scope.images[i].cssClass = false;
              console.log ('setting false');
            }
            console.log("scope.currentIndex !=undefined: " + scope.currentIndex);
            // scope.images[scope.currentIndex].visible = true; // make the current image visible
            // $animate.addClass (scope.images[scope.currentIndex], 'slide-active');
            scope.images[scope.currentIndex].cssClass = true;
            console.log ("scope.currentIndex is: ", scope.currentIndex);

          }
        });

        var timer;

        var sliderFunc = function() {
          timer = $timeout(function() {
            scope.next();
            timer = $timeout(sliderFunc, 4000);
          },0);
        };

        console.log ("typeof scope.images: ", typeof scope.images);

        timer = $timeout (function () {
          sliderFunc();
        }, 200);


        scope.currentIndex = 0;


        scope.$on('$destroy', function() {
          $timeout.cancel(timer); // when the scope is getting destroyed, cancel the timer
        });
      },
      templateUrl: 'modules/cycler/client/views/image-slider.html'
    };
    return directive;
  }
}());
