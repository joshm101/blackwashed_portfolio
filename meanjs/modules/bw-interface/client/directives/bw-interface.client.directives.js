(function() {
  'use strict';

  angular
    .module('bw-interface')
    .directive ('interfaceCyclerImage', interfaceCyclerImage)
    .directive ('addWorkFab', addWorkFab)
    .directive ('addPhotoWorkForm', addPhotoWorkForm)
    .directive ('uploadPicsModule', uploadPicsModule)
    .directive ('imageThumbnail', imageThumbnail)
    .directive ('modelsInput', modelsInput)
    .directive ('editModelsInput', editModelsInput)
    .directive ('editPhotoWorkForm', editPhotoWorkForm)
    .directive ('editUploadPicsModule', editUploadPicsModule)
    .directive ('editImageThumbnail', editImageThumbnail)
    .directive ('addVideoWorkForm', addVideoWorkForm)
    .directive ('castInput', castInput)
    .directive ('directorInput', directorInput)
    .directive ('editorInput', editorInput)
    .directive ('uploadCoverImage', uploadCoverImage)
    .directive ('coverImageThumbnail', coverImageThumbnail)
    .directive ('editVideoWorkForm', editVideoWorkForm)
    .directive ('editVideoCoverImage', editVideoCoverImage)
    .directive ('editCastInput', editCastInput)
    .directive ('editDirectorsInput', editDirectorsInput)
    .directive ('editEditorsInput', editEditorsInput)
    .directive ('editCoverImageThumbnail', editCoverImageThumbnail)
    .directive ('editAboutImage', editAboutImage)
    .directive ('editAboutImageThumbnail', editAboutImageThumbnail);


  interfaceCyclerImage.$inject = ['$rootScope', '$state', 'CyclerImages'];
  addWorkFab.$inject = ['$rootScope', '$state', '$timeout', '$mdDialog',
                        'CyclerImages', 'VideoCoverImage', 'SelectedImages'];
  addPhotoWorkForm.$inject = ['$rootScope', '$state', '$timeout', '$mdDialog'];
  uploadPicsModule.$inject = ['$rootScope', '$state', '$timeout', '$mdDialog', 'SelectedImages'];
  imageThumbnail.$inject = ['$rootScope', '$state', '$timeout', '$mdDialog', 'SelectedImages'];
  modelsInput.$inject = ['$rootScope', '$state', '$timeout', '$mdDialog', 'SelectedImages'];
  editModelsInput.$inject = ['$rootScope', '$state', '$timeout', '$mdDialog', 'SelectedImages', 'EditImages'];
  editPhotoWorkForm.$inject = ['$rootScope', '$state', '$timeout', '$mdDialog', 'SelectedImages', 'EditImages'];
  editUploadPicsModule.$inject = ['$rootScope', '$state', '$timeout', '$mdDialog', 'SelectedImages', 'EditImages'];
  editImageThumbnail.$inject = ['$rootScope', '$state', '$timeout', '$mdDialog', 'SelectedImages', 'EditImages'];
  addVideoWorkForm.$inject = ['$rootScope', '$state', '$timeout', '$mdDialog'];
  castInput.$inject = ['$rootScope', '$state', '$timeout', '$mdDialog'];
  directorInput.$inject = ['$rootScope', '$state', '$timeout', '$mdDialog'];
  editorInput.$inject = ['$rootScope', '$state', '$timeout', '$mdDialog'];
  uploadCoverImage.$inject = ['$rootScope', '$state', '$timeout', '$mdDialog', 'VideoCoverImage'];
  coverImageThumbnail.$inject = ['$rootScope', '$state', '$timeout', '$mdDialog', 'VideoCoverImage'];
  editVideoWorkForm.$inject = ['$rootScope', '$state', '$timeout', '$mdDialog', 'VideoCoverImage'];
  editVideoCoverImage.$inject = ['$rootScope', '$state', '$timeout', '$mdDialog', 'VideoCoverImage'];
  editCastInput.$inject = ['$rootScope', '$state', '$timeout', '$mdDialog', 'VideoCoverImage'];
  editDirectorsInput.$inject = ['$rootScope', '$state', '$timeout', '$mdDialog', 'VideoCoverImage'];
  editEditorsInput.$inject = ['$rootScope', '$state', '$timeout', '$mdDialog', 'VideoCoverImage'];
  editCoverImageThumbnail.$inject = ['$rootScope', '$state', '$timeout', '$mdDialog', 'VideoCoverImage'];
  editAboutImage.$inject = ['$rootScope', '$state', '$timeout', '$mdDialog', 'AboutImage'];
  editAboutImageThumbnail.$inject = ['$rootScope', '$state', '$timeout', '$mdDialog', 'AboutImage'];

  function editAboutImageThumbnail ($rootScope, $state, $timeout, $mdDialog, AboutImage) {
    var directive = {
      restrict: 'E',
      scope: {
        imageUrl: '='
      },
      link: function (scope) {

      },
      templateUrl: 'modules/bw-interface/client/views/edit-about-image-thumbnail.html'
    };

    return directive;
  }

  function editAboutImage ($rootScope, $state, $timeout, $mdDialog, AboutImage) {
    var directive = {
      restrict: 'E',
      scope: {
        imageUrl: '='
      },
      link: function (scope) {
        scope.image = [];
        scope.selectedAboutImage = function (file) {
          if (file !== null) {
            scope.imageSelected = file;
            AboutImage.addImage(file);
            console.log (AboutImage.newImage);
            scope.imageUrl = AboutImage.newImage[0]['$ngfBlobUrl'];
          }
        }
      },
      templateUrl: 'modules/bw-interface/client/views/edit-about-image.html'
    };

    return directive;
  }

  function editCoverImageThumbnail ($rootScope, $state, $timeout, $mdDialog, VideoCoverImage) {
    var directive = {
      restrict: 'E',
      scope: {
        imageUrl: '='
      },
      link: function (scope) {

      },
      templateUrl: 'modules/bw-interface/client/views/edit-cover-image-thumbnail.html'
    };

    return directive;
  }

  function editVideoCoverImage ($rootScope, $state, $timeout, $mdDialog, VideoCoverImage) {
    var directive = {
      restrict: 'E',
      scope: {
        work: '='
      },
      link: function (scope) {
        scope.coverImage = [];
        scope.coverImageUrl = scope.work.coverImageUrl;
        console.log("scope.coverImageUrl: ", scope.coverImageUrl);
        scope.selectedCoverImage = function (file) {
          if (file !== null){
            console.log("file is: ", file);
            scope.imageSelected = file;
            VideoCoverImage.addImage (file);
            scope.coverImageUrl = VideoCoverImage.image[0]['$ngfBlobUrl'];
            $rootScope.videoCoverImage = VideoCoverImage.image;
          }
        };

        $rootScope.$on ( 'VideoCoverImage.update', function () {
          scope.coverImageUrl = VideoCoverImage.image[0]['$ngfBlobUrl'];
          $rootScope.videoCoverImage = VideoCoverImage.image;
        })
      },
      templateUrl: 'modules/bw-interface/client/views/edit-video-cover-image.html'
    };

    return directive;
  }

  function editVideoWorkForm ($rootScope, $state, $timeout, $mdDialog, VideoCoverImage) {
    var directive = {
      restrict: 'E',
      scope: {
        work: '=',
        editCastInputModel: '=',
        editDirectorsInputModel: '=',
        editEditorsInputModel: '='
      },
      link: function (scope) {

      },
      templateUrl: 'modules/bw-interface/client/views/edit-video-work-form.html'
    };

    return directive;
  }

  function coverImageThumbnail ($rootScope, $state, $timeout, $mdDialog, VideoCoverImage) {
    var directive = {
      restrict: 'E',
      scope: {
        imageUrl: '='
      },
      link: function (scope) {
        scope.removeImage = function (imageUrl) {
          VideoCoverImage.removeImage();
        }
      },
      templateUrl: 'modules/bw-interface/client/views/cover-image-thumbnail.html'
    };

    return directive;
  }

  function uploadCoverImage ($rootScope, $state, $timeout, $mdDialog, VideoCoverImage) {
    var directive = {
      restrict: 'E',
      scope: {},
      link: function (scope) {
        scope.coverImage = [];
        scope.selectedCoverImage = function (file) {
          console.log("file is: ", file);
          scope.imageSelected = file;
          VideoCoverImage.addImage (file);
          scope.coverImage = VideoCoverImage.image;
          $rootScope.videoCoverImage = VideoCoverImage.image;
        };

        $rootScope.$on ( 'VideoCoverImage.update', function () {
          scope.coverImage = VideoCoverImage.image;
          $rootScope.videoCoverImage = VideoCoverImage.image;
        })
      },
      templateUrl: 'modules/bw-interface/client/views/upload-cover-image.html'
    };

    return directive;
  }

  function editorInput ($rootScope, $state, $timeout, $mdDialog) {
    var directive = {
      restrict: 'E',
      scope: {
        editorFormInput: '='
      },
      link: function (scope) {
        scope.editorNumber = 0;
        scope.editors = [{name: 'editor_' + scope.editorNumber}];
        scope.addEditor = function () {
          scope.editors.push({name: 'editor_' + ++scope.editorNumber});
        }
      },
      templateUrl: 'modules/bw-interface/client/views/editor-input.html'
    };

    return directive;
  }

  function directorInput ($rootScope, $state, $timeout, $mdDialog) {
    var directive = {
      restrict: 'E',
      scope: {
        directorFormInput: '='
      },
      link: function (scope) {
        scope.directorNumber = 0;
        scope.directors = [{name: 'director_' + scope.directorNumber}];
        scope.addDirector = function () {
          scope.directors.push({name: 'director_' + ++scope.directorNumber});
        }
      },
      templateUrl: 'modules/bw-interface/client/views/director-input.html'
    };

    return directive;
  }

  function castInput ($rootScope, $state, $timeout, $mdDialog) {
    var directive = {
      restrict: 'E',
      scope: {
        castFormInput: '='
      },
      link: function (scope) {

        scope.castNumber = 0;
        scope.castMembers = [{name: 'cast_' + scope.castNumber}];
        scope.addCastMember = function () {
          scope.castMembers.push({name: 'cast_' + ++scope.castNumber});
          console.log(scope.modelsFormInput);
        }
      },
      templateUrl: 'modules/bw-interface/client/views/cast-input.html'

    };

    return directive;
  }

  function editEditorsInput ($rooTscope, $state, $timeout, $mdDialog) {
    var directive = {
      restrict: 'E',
      scope: {
        editorsFormInput: '=',
        editors: '='
      },
      link: function (scope) {
        var i = 0;
        scope.editorNumber = 0;
        for (var editor in scope.editorsFormInput) {
          scope.editorsFormInput[editor] = scope.editors[i];
          ++i;
        }

        scope.addEditor = function () {
          scope.editors.push('');
        };
      },
      templateUrl: 'modules/bw-interface/client/views/edit-editors-input.html'
    };

    return directive;
  }

  function editDirectorsInput ($rootScope, $state, $timeout, $mdDialog) {
    var directive = {
      restrict: 'E',
      scope: {
        directorsFormInput: '=',
        directors: '='
      },
      link: function (scope) {
        var i = 0;
        scope.directorNumber = 0;
        for (var director in scope.directorsFormInput) {
          scope.directorsFormInput[director] = scope.directors[i];
          ++i;
        }
        scope.addDirector = function () {
          scope.directors.push('');
        };
      },
      templateUrl: 'modules/bw-interface/client/views/edit-directors-input.html'
    };

    return directive;
  }

  function editCastInput ($rootScope, $state, $timeout, $mdDialog) {
    var directive = {
      restrict: 'E',
      scope: {
        castFormInput: '=',
        cast: '='
      },
      link: function (scope) {
        var i = 0;
        scope.castNumber = 0;
        console.log ("scope.cast: ", scope.cast);
        for (var member in scope.castFormInput) {
          scope.castFormInput[member] = scope.cast[i];
          ++i;
        }
        scope.addCastMember = function() {
          scope.cast.push('');
        };
      },
      templateUrl: 'modules/bw-interface/client/views/edit-cast-input.html'
    };

    return directive;
  }

  function addVideoWorkForm ($rootScope, $state, $timeout, $mdDialog) {
    var directive = {
      restrict: 'E',
      scope: {
        workTitle: '=',
        videoUrl: '=',
        postText: '=',
        copyright: '=',
        editorFormInput: '=',
        castFormInput: '=',
        directorFormInput: '=',
        videoCoverImage: '='
      },
      link: function (scope) {

      },
      templateUrl: 'modules/bw-interface/client/views/add-video-work-form.html'
    };

    return directive;
  }

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
      scope: {
        serviceImages: '='
      },
      link: function (scope) {
        console.log("ok");
        scope.serviceImages = SelectedImages.images;
        scope.selected = function (files, errFiles) {
          scope.files = files;
          angular.forEach (scope.files, function (file) {
            console.log("file forEach " + JSON.stringify(file));
            console.log("file blob: " + file.$ngfBlobUrl);
            SelectedImages.addImage(file);
            // scope.serviceImages = SelectedImages.images;
          });
        };
        // scope.serviceImages = SelectedImages.images;
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
        postText: '=',
        photoWorkImages: '='
      },
      link: function(scope) {
        console.log("ok");
      },
      templateUrl: 'modules/bw-interface/client/views/add-photo-work-form.html'
    };
    return directive;
  }

  function addWorkFab($rootScope, $state, $timeout, $mdDialog, CyclerImages, VideoCoverImage, SelectedImages) {
    var directive = {
      restrict: 'E',
      scope: {},
      link: function (scope, $timeout) {
        console.log("ok");


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
            clickOutsideToClose: true,
            onRemoving: function () {
              SelectedImages.reset();
            }
          });
        };

        scope.addVideoWorkDialog = function (ev) {
          $mdDialog.show({
            controller: DialogController,
            contentElement: '#addVideoWorkDialog',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            onShowing: function () {
              VideoCoverImage.removeImage();
            }
          });
        };


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
