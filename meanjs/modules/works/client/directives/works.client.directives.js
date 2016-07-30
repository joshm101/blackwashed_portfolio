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


        scope.viewWork = function (event) {
          console.log ('viewWork');
          if (scope.work.videoUrl) {
            var body =  $('section');
            console.log ('body: ', body);
            body.css ('overflow', 'hidden');
            $mdDialog.show ({
              controller: function (scope, event, $mdDialog, $sce, work) {

                console.log ('dialog controller');
                console.log ("work is: ", work);
                scope.workTitle = work.title;

                // thanks to
                // http://stackoverflow.com/a/23945027
                function extractDomain(url) {
                  var domain;
                  //find & remove protocol (http, ftp, etc.) and get domain
                  if (url.indexOf("://") > -1) {
                    domain = url.split('/')[2];
                  }
                  else {
                    domain = url.split('/')[0];
                  }

                  //find & remove port number
                  domain = domain.split(':')[0];

                  return domain;
                }

                var domain = extractDomain (work.videoUrl);

                console.log ("domain is: ", domain);

                if (domain === 'youtube.com' ||
                  domain === 'www.youtube.com') {

                  console.log ('youtube domain');
                  scope.domain = 'youtube';
                  var videoUrl = work.videoUrl.replace ("watch?v=", "embed/");
                  scope.videoUrl = $sce.trustAsResourceUrl (videoUrl);
                  console.log ("work.videoUrl: ", work.videoUrl);
                  console.log("scope.videoUrl: ", scope.videoUrl);
                }

                if (domain === 'vimeo.com' ||
                  domain === 'www.vimeo.com') {
                  //player.vimeo.com/video/175738725
                  console.log ('vimeo domain');
                  var vimeoId = work.videoUrl.substring (
                    work.videoUrl.lastIndexOf('/') + 1);
                  var videoUrl = '//player.vimeo.com/video/' + vimeoId;
                  scope.videoUrl = $sce.trustAsResourceUrl (videoUrl);
                  console.log ("vimeo id:", vimeoId);
                  scope.domain = 'vimeo';

                  scope.vimeoId = vimeoId;
                }

                $rootScope.hide = function () {
                  $mdDialog.hide();
                };

                scope.cancel = function () {
                  $mdDialog.cancel();
                };

                $rootScope.answer = function (answer) {
                  $mdDialog.hide (answer);
                }
              },
              locals: {
                work: scope.work,
                event: event
              },
              templateUrl: 'modules/works/client/views/view-video.html',
              parent: angular.element (document.body),
              targetEvent: event,
              onRemoving: function () {
                body.css('overflow', 'auto');
              },
              autoWrap: false,
              clickOutsideToClose: true,
              closeTo: elem,
              fullscreen: true
            });
          } else {
            $mdDialog.show ({
              controller: function (scope, event, $mdDialog, $sce, work) {

                scope.currentIndex = 0;
                console.log('dialog controller');
                console.log("work is: ", work);
                scope.workTitle = work.title;
                scope.images = work.images;

                scope.next = function (event) {
                  console.log ("next()");
                  scope.currentIndex + 1 === scope.images.length ? scope.currentIndex = 0 : scope.currentIndex++;
                };

                scope.prev = function (event) {
                  console.log ('prev()');
                  scope.currentIndex - 1 === -1 ? scope.currentIndex = scope.images.length - 1 : scope.currentIndex--;
                };

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
              locals: {
                work: scope.work,
                event: event,
                element: elem
              },
              templateUrl: 'modules/works/client/views/view-photos.html',
              parent: angular.element(document.body),
              targetEvent: event,
              onRemoving: function () {
              },
              autoWrap: false,
              clickOutsideToClose: true,
              closeTo: elem,
              fullscreen: false
            });
          }

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
