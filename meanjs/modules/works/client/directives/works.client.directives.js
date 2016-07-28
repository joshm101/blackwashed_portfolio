(function () {
  'use strict';

  angular
    .module ('works')
    .directive ('worksGridItem', worksGridItem);

  worksGridItem.$inject = ['$rootScope', '$state', '$http', '$window', '$mdDialog', '$mdToast'];

  function worksGridItem ($rootScope, $state, $http, $window, $mdDialog, $mdToast) {
    var directive = {
      restrict: 'E',
      scope: {
        work: '='
      },
      link: function (scope, elem, attr, $window) {
        $(elem).hoverdir({
          hoverDelay: 100,
          hoverElem: '.hover-el'

        });


        scope.mouseAction = function (event) {
          // console.log ('mouseenter mouseleave');
          // elem[0]
          //var hoverItem = event.toElement.parentElement.children[1];
          // console.log ('hoverItem: ', hoverItem);
          //var hoverItem = elem[0].
        };

        scope.enter = function (event) {
          console.log ('event is: ', event);
        };

        scope.leave = function (event) {
          console.log ('event is: ', event);
        };
        /*
        this.$el.on ('mouseenter.hoverdir, mouseleave.hoverdir', function (event) {
          var $el = $(this),
            $hoverElem = $el.find ('grid-list-item'),
            direction = self._getDir ($el, { x: event.pageX, y: event.pageY }),
            styleCSS = self._getStyle (direction);
          console.log ('mouseenter mouseleave');
        }); */
      },
      templateUrl: 'modules/works/client/views/works-grid-item.html'
    };

    return directive;
  }

}());
