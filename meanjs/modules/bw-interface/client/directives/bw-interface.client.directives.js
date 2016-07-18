(function() {
  'use strict';

  angular
    .module('bw-interface')
    .directive('interfaceCyclerImage', interfaceCyclerImage)
    .directive('addWorkFab', addWorkFab)
    .directive('addPhotoWorkForm', addPhotoWorkForm)
    .directive('uploadPicsModule', uploadPicsModule)
    .directive('imageThumbnail', imageThumbnail)
    .directive('modelsInput', modelsInput);

  interfaceCyclerImage.$inject = ['$rootScope', '$state', 'CyclerImages'];
  addWorkFab.$inject = ['$rootScope', '$state', '$timeout', '$mdDialog', 'CyclerImages'];
  addPhotoWorkForm.$inject = ['$rootScope', '$state', '$timeout', '$mdDialog'];
  uploadPicsModule.$inject = ['$rootScope', '$state', '$timeout', '$mdDialog', 'SelectedImages'];
  imageThumbnail.$inject = ['$rootScope', '$state', '$timeout', '$mdDialog', 'SelectedImages'];
  modelsInput. $inject = ['$rootScope', '$state', '$timeout', '$mdDialog', 'SelectedImages'];

  function modelsInput($rootScope, $state, $timoue, $mdDialog, SelectedImages){
    var directive = {
      restrict: 'E',
      scope: {
        modelsFormInput: '='
      },
      transclude: true,
      link: function (scope) {
        scope.modelNumber = 0;
        scope.models = [{name: 'model_' + scope.modelNumber}];
        scope.addModel = function (event) {
          scope.models.push({name: 'model ' + ++scope.modelNumber});
          console.log(scope.modelsFormInput);
        };
      },
      templateUrl: 'modules/bw-interface/client/views/models-input.html'
    };
    return directive;
  }

  function imageThumbnail ($rootScope, $state, $timeout, Upload, SelectedImages) {
    var directive = {
      restrict: 'E',
      scope: {
        imageUrl: '=',
        coverImage: '='
      },
      link: function (scope) {
        console.log("okay");

        scope.removeImage = function (imgUrl) {
          console.log("imgUrl is: " + imgUrl);

          SelectedImages.removeImage(imgUrl);
        };

        scope.setCoverImage = function (imgUrl) {
          SelectedImages.setCoverImage (imgUrl);
        }

      },
      templateUrl: 'modules/bw-interface/client/views/image-thumbnail.html'
    };

    return directive;
  }

  function uploadPicsModule ($rootScope, $state, $timeout, Upload, SelectedImages) {
    var directive = {
      restrict: 'E',
      scope: {},
      link: function (scope) {
        console.log("ok");
        scope.selected = function (files, errFiles) {
          scope.files = files;
          angular.forEach (scope.files, function (file) {
            console.log("file forEach " + JSON.stringify(file));
            console.log("file blob: " + file.$ngfBlobUrl);
            SelectedImages.addImage(file);
          });
        };
        scope.serviceImages = SelectedImages.images;
      },
      templateUrl: 'modules/bw-interface/client/views/upload-pics-module.html'
    };
    return directive;
  }

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

  function addPhotoWorkForm ($rootScope, $state) {
    var directive = {
      restrict: 'E',
      scope: {
        modelsFormInput: '=',
        copyright: '=',
        photoWorkTitle: '='
      },
      link: function(scope) {
        console.log("ok");
      },
      templateUrl: 'modules/bw-interface/client/views/add-photo-work-form.html'
    };
    return directive;
  }

  function addWorkFab($rootScope, $state, $timeout, $mdDialog, CyclerImages) {
    var directive = {
      restrict: 'E',
      scope: {},
      link: function (scope, $timeout) {
        console.log("ok");

        //scope.fabController = function ($rootScope, $mdDialog, $timeout) {
          var self = this;
          self.hidden = false;
          self.isOpen = false;
          self.hover = false;


          scope.items = [
            { name: 'Add Photo Work', direction: 'right', icon: 'photo_camera'},
            { name: 'Add Video Work', direction: 'right', icon: 'videocam' }
          ];

          scope.addPhotoWorkDialog = function (ev) {
            $mdDialog.show({
              controller: DialogController,
              contentElement: '#myDialog',
              parent: angular.element(document.body),
              targetEvent: ev,
              clickOutsideToClose: true
            });
          };
        //};

        function DialogController($rootScope, $mdDialog) {
          $rootScope.hide = function() {
            console.log("$mdDialog: " + JSON.stringify($mdDialog));
            $mdDialog.hide();
          };
          $rootScope.cancel = function() {
            $mdDialog.cancel();
          };
          $rootScope.answer = function(answer) {
            console.log("answer: " + answer);
            $mdDialog.hide(answer);
          };
        }
      },
      templateUrl: 'modules/bw-interface/client/views/add-work-fab.html'
    };
    return directive;
  }
}());
