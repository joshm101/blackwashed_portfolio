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
      Works.getWorks();
    };


    $scope.$on ( 'works.update', function (event){
      $scope.works = Works.works;
      console.log ("$scope.works is: ", $scope.works);
    });
  }
}());
