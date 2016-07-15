(function () {
  'use strict';

  angular.module('photoWorks')
    .directive('photoWork', photoWork);

  photoWork.$inject = ['$rootScope', '$http', 'PhotoWorks'];

  function photoWork ($rootScope, $http, PhotoWorks) {
    var directive = {
      restrict: 'E',
      scope: {},
      link: function (scope) {

      },
      templateUrl: 'modules/photo-works/client/views/photo-work.html'
    };

    return directive;
  }
}());
