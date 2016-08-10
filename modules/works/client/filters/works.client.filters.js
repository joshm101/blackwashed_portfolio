(function () {
  angular
    .module ('works')

    // thanks to
    // http://apicatus-laboratory.rhcloud.com/2014/10/21/nice-grids-with-ng-repeat/
    .filter ('listToMatrix', function() {

      function listToMatrix (list, elementsPerSubArray) {
        console.log ('filter');
        var matrix = [], i, k;

        for (i = 0, k = -1; i < list.length; i++) {
          if (i % elementsPerSubArray === 0) {
            k++;
            matrix[k] = [];
          }
          matrix[k].push(list[i]);
        }
        return matrix;
      }
      return function (list, elementsPerSubArray) {
        return listToMatrix (list, elementsPerSubArray);
      }
  });

}());
