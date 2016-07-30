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
      console.log('getWorks controller');
      $scope.bool = false;
      Works.getWorks();
      console.log ('bool: ', $scope.bool);
    };


    $scope.$on ( 'works.update', function (event){
      $scope.works = Works.works;
      $scope.bool = true;
      console.log ("$scope.works is: ", $scope.works);
    });
  }
}());
