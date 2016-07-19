(function () {
  'use strict';

  angular.module('photoWorks')
    .directive('photoWork', photoWork);

  photoWork.$inject = ['$rootScope', '$http', 'PhotoWorks'];

  function photoWork ($rootScope, $http, PhotoWorks) {
    var directive = {
      restrict: 'E',
      scope: {
        coverImageUrl: '='
      },
      link: function (scope) {
        scope.coverImage = PhotoWorks.coverImage;
      },
      templateUrl: 'modules/photo-works/client/views/photo-work.html'
    };

    return directive;
  }
}());
