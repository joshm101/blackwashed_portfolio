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


        scope.viewWork = function (event) {
          if (scope.work.videoUrl) {
            var body =  $('section');
            body.css ('overflow', 'hidden');
            $mdDialog.show ({
              controller: function (scope, event, $mdDialog, $sce, work) {
                scope.workTitle = work.title;
                scope.cast = work.cast;
                scope.joinedCast = scope.cast.join (', ');
                scope.directors = work.directedBy;
                scope.postInfo = work.workInfo;
                scope.editors = work.editedBy;
                scope.copyright = work.copyright;

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

                if (domain === 'youtube.com' ||
                  domain === 'www.youtube.com') {

                  scope.domain = 'youtube';
                  var videoUrl = work.videoUrl.replace ("watch?v=", "embed/");
                  scope.videoUrl = $sce.trustAsResourceUrl (videoUrl);
                }

                if (domain === 'vimeo.com' ||
                  domain === 'www.vimeo.com') {
                  var vimeoId = work.videoUrl.substring (
                    work.videoUrl.lastIndexOf('/') + 1);
                  var videoUrl = '//player.vimeo.com/video/' + vimeoId;
                  scope.videoUrl = $sce.trustAsResourceUrl (videoUrl);
                  scope.domain = 'vimeo';

                  scope.vimeoId = vimeoId;
                }

                if (domain === 'facebook.com' ||
                    domain === 'www.facebook.com') {
                  scope.videoUrl = 'https://www.facebook.com/plugins/video.php?href=' + work.videoUrl;
                  scope.videoUrl = $sce.trustAsResourceUrl (scope.videoUrl);
                  scope.domain = 'facebook';
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
              fullscreen: false
            });
          } else {
            $mdDialog.show ({
              controller: function (scope, event, $mdDialog, $sce, work) {

                scope.currentIndex = 0;
                scope.workTitle = work.title;
                scope.images = work.images;


                scope.next = function (event) {
                  scope.currentIndex + 1 === scope.images.length ? scope.currentIndex = 0 : scope.currentIndex++;
                };

                scope.prev = function (event) {
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
      },
      templateUrl: 'modules/works/client/views/works-grid-item.html'
    };

    return directive;
  }

}());
