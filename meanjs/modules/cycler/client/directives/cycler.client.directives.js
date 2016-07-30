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
        scope.currentIndex = 0;
        elem.on ('load', function (){
          scope.currentIndex = -1;
          scope.currentIndex++;
          console.log ('READY LOAD');
        });

        $rootScope.$on('$viewContentLoaded', function() {
          console.log ("READY view view");
          //console.log("scope.images on viewContentLoaded: ", scope.images);
          $rootScope.onLoaded = true;

          scope.currentIndex = 0; // Initially the index is at the first image
          //console.log ('scope.currentIndex: ', scope.currentIndex);
          scope.justLoaded = true;
        });

        if (typeof scope.images !== 'undefined') {
          scope.images[0].cssClass = true;
        }
        scope.justLoaded = true;
        scope.next = function(click) {

          var listItems = elem[0].childNodes[1].children[0].children;
          //console.log("scope.next");
          if (typeof scope.images !== 'undefined') {
            if(scope.images.length === 1) {
             // console.log("scope.images.length: " + scope.images.length);
             // console.log ("scope.images.length === 1");
              // if there's only one image to rotate through,
              // don't ever try and change the index and
              // keep the only image always visible.
              scope.currentIndex = 0;
             // console.log("scope.currentIndex: ", scope.currentIndex);
              // scope.images[scope.currentIndex].visible = true;
              scope.images[0].cssClass = true;

            } else {
              scope.currentIndex < scope.images.length - 1 ? scope.currentIndex ++ : scope.currentIndex = 0;

              if (click === 'yes-click') {
                console.log ('timer is: ', timer);
                $timeout.cancel (timer);
                sliderFunc();
                //$timeout.cancel(timer);
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
           // console.log("scope.images.length: " + scope.images.length);
           // console.log("scope.images: ", scope.images);
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
              //console.log ('setting false');
            }
            //console.log("scope.currentIndex !=undefined: " + scope.currentIndex);
            // scope.images[scope.currentIndex].visible = true; // make the current image visible
            // $animate.addClass (scope.images[scope.currentIndex], 'slide-active');
            scope.images[scope.currentIndex].cssClass = true;
            console.log ('scope.images[0].cssClass: ', scope.images[0].cssClass);
            //console.log ("scope.currentIndex is: ", scope.currentIndex);

          }
        });

        var timer;



        var sliderFunc = function() {
          timer = $timeout(function() {
            scope.next('no_click');
            sliderFunc();
          }, 4000);
        };

        //console.log ("typeof scope.images: ", typeof scope.images);

        timer = $timeout (function () {
          sliderFunc();
        }, 200);


        //scope.currentIndex = 0;


        scope.$on('$destroy', function() {
          $timeout.cancel(timer); // when the scope is getting destroyed, cancel the timer
        });
      },
      templateUrl: 'modules/cycler/client/views/image-slider.html'
    };
    return directive;
  }
}());
