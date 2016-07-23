(function() {
  'use strict';

  angular
    .module('bw-interface')
    .directive('interfaceCyclerImage', interfaceCyclerImage)
    .directive('addWorkFab', addWorkFab)
    .directive('addPhotoWorkForm', addPhotoWorkForm)
    .directive('uploadPicsModule', uploadPicsModule)
    .directive('imageThumbnail', imageThumbnail)
    .directive('modelsInput', modelsInput)
    .directive('editModelsInput', editModelsInput)
    .directive('editPhotoWorkForm', editPhotoWorkForm)
    .directive('editUploadPicsModule', editUploadPicsModule)
    .directive('editImageThumbnail', editImageThumbnail);

  interfaceCyclerImage.$inject = ['$rootScope', '$state', 'CyclerImages'];
  addWorkFab.$inject = ['$rootScope', '$state', '$timeout', '$mdDialog', 'CyclerImages'];
  addPhotoWorkForm.$inject = ['$rootScope', '$state', '$timeout', '$mdDialog'];
  uploadPicsModule.$inject = ['$rootScope', '$state', '$timeout', '$mdDialog', 'SelectedImages'];
  imageThumbnail.$inject = ['$rootScope', '$state', '$timeout', '$mdDialog', 'SelectedImages'];
  modelsInput.$inject = ['$rootScope', '$state', '$timeout', '$mdDialog', 'SelectedImages'];
  editModelsInput.$inject = ['$rootScope', '$state', '$timeout', '$mdDialog', 'SelectedImages', 'EditImages'];
  editPhotoWorkForm.$inject = ['$rootScope', '$state', '$timeout', '$mdDialog', 'SelectedImages', 'EditImages'];
  editUploadPicsModule.$inject = ['$rootScope', '$state', '$timeout', '$mdDialog', 'SelectedImages', 'EditImages'];
  editImageThumbnail.$inject = ['$rootScope', '$state', '$timeout', '$mdDialog', 'SelectedImages', 'EditImages'];


  function editImageThumbnail ($rootScope, $state, $timeout, $mdDialog, SelectedImages, EditImages) {
    var directive = {
      restrict: 'E',
      scope: {
        coverImage: '=',
        imageUrl: '='
      },
      link: function (scope) {
        scope.setCoverImage = function (imageUrl) {
          EditImages.setCoverImage(imageUrl);
        };

        scope.removeImage = function (imageUrl) {
          EditImages.removeImage (imageUrl);
        }
      },
      templateUrl: 'modules/bw-interface/client/views/edit-image-thumbnail.html'
    };

    return directive;
  }

  function editUploadPicsModule ($rootScope, $state, $timeout, $mdDialog, SelectedImages, EditImages) {
    var directive = {
      restrict: 'E',
      scope: {
        work: '='
      },
      link: function (scope) {
        scope.serviceImages = EditImages.images;
        scope.editSelected = function (files, badFiles) {
          scope.files = files;
          console.log("scope.files: ", scope.files);
          for (var i = 0; i < scope.files.length; ++i) {
            console.log("url: ", scope.files[i]['$ngfBlobUrl']);
            EditImages.addNewImage(scope.files[i], scope.files[i]['$ngfBlobUrl'], false, false);
          }
        };
      },
      templateUrl: 'modules/bw-interface/client/views/edit-upload-pics-module.html'
    };

    return directive;
  }

  function editPhotoWorkForm ($rootScope, $state, $timeout, $mdDialog, SelectedImages, EditImages) {
    var directive = {
      restrict: 'E',
      scope: {
        work: '=',
        editModelsInputModel: '='
      },
      link: function (scope) {
        console.log("work is: ", scope.work);
        console.log("editModelsInputModel is: ", scope.editModelsInputModel);

      },
      templateUrl: 'modules/bw-interface/client/views/edit-photo-work-form.html'
    };

    return directive;
  }

  function editModelsInput ($rootScope, $state, $timeout, $mdDialog, SelectedImages, EditImages) {
    var directive = {
      restrict: 'E',
      scope: {
        modelsFormInput: '=',
        models: '='
      },
      link: function (scope) {
        var i = 0;
        scope.modelNumber = 0;
        console.log("scope.models: " + scope.models);
        console.log("scope.modelsFormInput: ", scope.modelsFormInput);
        for (var model in scope.modelsFormInput) {
          scope.modelsFormInput[model] = scope.models[i];
          ++i;
        }

        scope.addModel = function () {
          scope.models.push('');
        }

      },
      templateUrl: 'modules/bw-interface/client/views/edit-models-input.html'
    };

    return directive;
  }

  function modelsInput($rootScope, $state, $timeout, $mdDialog, SelectedImages){
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
        photoWorkTitle: '=',
        postText: '='
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
