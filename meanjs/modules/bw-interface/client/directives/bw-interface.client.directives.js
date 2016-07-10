(function() {
  'use strict';

  angular
    .module('bw-interface')
    .directive('interfaceCyclerImage', interfaceCyclerImage);

  interfaceCyclerImage.$inject = ['$rootScope', '$state', 'CyclerImages'];

  function interfaceCyclerImage($rootScope, $state, CyclerImages) {
    var directive = {
      restrict: 'E',
      scope: {
        image: '='
      },
      link: function(scope) {
        scope.deleteImage = function (imagePath) {
          CyclerImages.deleteCyclerImage(imagePath);
        }
      },
      templateUrl: 'modules/bw-interface/client/views/cycler-image.html'
    };

    return directive;
  }
}());
