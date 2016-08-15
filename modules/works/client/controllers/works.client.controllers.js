(function () {
  angular
    .module ('works', ['ngMaterial', 'core', 'photoWorks',
                       'videoWorks', 'bw-interface'])
    .controller ('WorksController', WorksController);

  WorksController.$inject = ['$scope', '$rootScope', 'Upload',
                             '$mdDialog', '$mdToast', '$http',
                             'Works', '$filter'];

  function WorksController ($scope, $rootScope, Upload, $mdDialog,
                            $mdToast, $http, Works, $filter) {

    $scope.works = [];

    $scope.getWorks = function () {
      $scope.bool = false;
      Works.getWorks();
    };


    $scope.$on ( 'works.update', function (event){
      $scope.works = Works.works;
      $scope.bool = true;
    });
  }
}());
