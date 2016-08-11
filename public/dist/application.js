(function (window) {
  'use strict';


  var applicationModuleName = 'mean';

  var service = {
    applicationModuleName: applicationModuleName,
    applicationModuleVendorDependencies: ['ngResource', 'ngAnimate', 'ngMessages', 'ui.router', 'ui.bootstrap', 'angularFileUpload', 'ngMaterial'],
    registerModule: registerModule
  };

  window.ApplicationConfiguration = service;

  // Add a new vertical module
  function registerModule(moduleName, dependencies) {
    // Create angular module
    angular.module(moduleName, dependencies || [])
      .config (["$mdIconProvider", "$mdThemingProvider", function ($mdIconProvider, $mdThemingProvider) {
        $mdIconProvider
          .defaultIconSet('lib/mdi/svg/mdi.svg');
        $mdThemingProvider.theme('default')
          .primaryPalette('indigo')
          .accentPalette('green');
      }]);

    // Add the module to the AngularJS configuration file
    angular.module(applicationModuleName).requires.push(moduleName);
  }
}(window));

(function (app) {
  'use strict';

  // Start by defining the main module and adding the module dependencies
  angular
    .module(app.applicationModuleName, app.applicationModuleVendorDependencies);

  // Setting HTML5 Location Mode
  angular
    .module(app.applicationModuleName)
    .config(bootstrapConfig);

  function bootstrapConfig($locationProvider, $httpProvider) {
    $locationProvider.html5Mode(true).hashPrefix('!');

    $httpProvider.interceptors.push('authInterceptor');
  }

  bootstrapConfig.$inject = ['$locationProvider', '$httpProvider'];

  // Then define the init function for starting up the application
  angular.element(document).ready(init);

  function init() {
    // Fixing facebook bug with redirect
    if (window.location.hash && window.location.hash === '#_=_') {
      if (window.history && history.pushState) {
        window.history.pushState('', document.title, window.location.pathname);
      } else {
        // Prevent scrolling by storing the page's current scroll offset
        var scroll = {
          top: document.body.scrollTop,
          left: document.body.scrollLeft
        };
        window.location.hash = '';
        // Restore the scroll offset, should be flicker free
        document.body.scrollTop = scroll.top;
        document.body.scrollLeft = scroll.left;
      }
    }

    // Then init the app
    angular.bootstrap(document, [app.applicationModuleName]);
  }
}(ApplicationConfiguration));

var aboutPage = (function (app) {
  app.registerModule ('about', ['ngFileUpload', 'ngMaterial', 'ngAnimate',
                                'core', 'core.routes', 'photoWorks', 'videoWorks']);
  app.registerModule ('about.services');
}(ApplicationConfiguration));

(function (app) {
  'use strict';

  app.registerModule('articles', ['core']);// The core module is required for special route handling; see /core/client/config/core.client.routes
  app.registerModule('articles.services');
  app.registerModule('articles.routes', ['ui.router', 'core.routes', 'articles.services']);
}(ApplicationConfiguration));

var bw_interface = (function (app) {
  'use strict';

  app.registerModule('bw-interface', ['Upload', 'ngFileUpload', 'ngMaterial', 'ngAnimate',
                                      'core', 'core.routes', 'photoWorks', 'videoWorks', 'about']);
  app.registerModule('bw-interface.services');
}(ApplicationConfiguration));

(function (app) {
  'use strict';

  app.registerModule('chat', ['core']);
  app.registerModule('chat.routes', ['ui.router', 'core.routes']);
}(ApplicationConfiguration));

(function (app) {
  'use strict';
  app.registerModule('bw-interface');
  app.registerModule('bw-interface.services');
  app.registerModule('core', ['bw-interface.services', 'works',
                              'works.services', 'ngAnimate', 'ngMaterial']);
  app.registerModule('core.routes', ['ui.router']);
  app.registerModule('core.admin', ['core']);
  app.registerModule('core.admin.routes', ['ui.router']);

}(ApplicationConfiguration));

(function (app) {
  'use strict';

  app.registerModule('cycler', ['ngMaterial', 'ngAnimate']);
}(ApplicationConfiguration));

var images = (function (app) {
  'use strict';

  app.registerModule('images');
}(ApplicationConfiguration));

var photoWorks = (function (app) {
  'use strict';

  app.registerModule('photoWorks', ['ngMaterial', 'bw-interface', 'videoWorks', 'videoWorks.services']);
  app.registerModule('photoWorks.services');
}(ApplicationConfiguration));

(function (app) {
  'use strict';

  app.registerModule('users', ['ngMaterial']);
  app.registerModule('users.admin');
  app.registerModule('users.admin.routes', ['ui.router', 'core.routes', 'users.admin.services']);
  app.registerModule('users.admin.services');
  app.registerModule('users.routes', ['ui.router', 'core.routes']);
  app.registerModule('users.services');
}(ApplicationConfiguration));

var videoWorks = (function (app) {
  'use strict';

  app.registerModule ('videoWorks', ['ngMaterial', 'bw-interface', 'photoWorks', 'photoWorks.services']);
  app.registerModule ('videoWorks.services');
}(ApplicationConfiguration));

(function (app) {
  'use strict';

  app.registerModule ('works');
  app.registerModule ('works.services');
  app.registerModule ('works.filters');
}(ApplicationConfiguration));

(function () {
  'use strict';

  angular
    .module ('about')
    .service ('AboutPageService', AboutPageService);

  AboutPageService.$inject = ['$rootScope', '$http'];

  function AboutPageService ($rootScope, $http) {
    var service = {
      about: [],
      getAbout: function () {
        $http.get ('/api/about/get_about_page')
          .then (function (res) {
            if (res.status === 200) {
              service.about = res.data;
              $rootScope.$broadcast ( 'AboutPageService.update' );
              console.log ('service.about: ', service.about);
            }
          });
      },

      updateAbout: function (edit) {
        service.about = [];
        service.about.push (edit);

        $rootScope.$broadcast ( 'AboutPageService.update' );
      }
    };

    return service;
  }
}());

(function () {
  'use strict';

  angular
    .module('articles')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addMenuItem('topbar', {
      title: 'Articles',
      state: 'articles',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'articles', {
      title: 'List Articles',
      state: 'articles.list'
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'articles', {
      title: 'Create Article',
      state: 'articles.create',
      roles: ['user']
    });
  }
}());

(function () {
  'use strict';

  angular
    .module('articles.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('articles', {
        abstract: true,
        url: '/articles',
        template: '<ui-view/>'
      })
      .state('articles.list', {
        url: '',
        templateUrl: 'modules/articles/client/views/list-articles.client.view.html',
        controller: 'ArticlesListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Articles List'
        }
      })
      .state('articles.create', {
        url: '/create',
        templateUrl: 'modules/articles/client/views/form-article.client.view.html',
        controller: 'ArticlesController',
        controllerAs: 'vm',
        resolve: {
          articleResolve: newArticle
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Articles Create'
        }
      })
      .state('articles.edit', {
        url: '/:articleId/edit',
        templateUrl: 'modules/articles/client/views/form-article.client.view.html',
        controller: 'ArticlesController',
        controllerAs: 'vm',
        resolve: {
          articleResolve: getArticle
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Article {{ articleResolve.title }}'
        }
      })
      .state('articles.view', {
        url: '/:articleId',
        templateUrl: 'modules/articles/client/views/view-article.client.view.html',
        controller: 'ArticlesController',
        controllerAs: 'vm',
        resolve: {
          articleResolve: getArticle
        },
        data: {
          pageTitle: 'Article {{ articleResolve.title }}'
        }
      });
  }

  getArticle.$inject = ['$stateParams', 'ArticlesService'];

  function getArticle($stateParams, ArticlesService) {
    return ArticlesService.get({
      articleId: $stateParams.articleId
    }).$promise;
  }

  newArticle.$inject = ['ArticlesService'];

  function newArticle(ArticlesService) {
    return new ArticlesService();
  }
}());

(function () {
  'use strict';

  angular
    .module('articles')
    .controller('ArticlesController', ArticlesController);

  ArticlesController.$inject = ['$scope', '$state', 'articleResolve', '$window', 'Authentication'];

  function ArticlesController($scope, $state, article, $window, Authentication) {
    var vm = this;

    vm.article = article;
    vm.authentication = Authentication;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Article
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.article.$remove($state.go('articles.list'));
      }
    }

    // Save Article
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.articleForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.article._id) {
        vm.article.$update(successCallback, errorCallback);
      } else {
        vm.article.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('articles.view', {
          articleId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());

(function () {
  'use strict';

  angular
    .module('articles')
    .controller('ArticlesListController', ArticlesListController);

  ArticlesListController.$inject = ['ArticlesService'];

  function ArticlesListController(ArticlesService) {
    var vm = this;

    vm.articles = ArticlesService.query();
  }
}());

(function () {
  'use strict';

  angular
    .module('articles.services')
    .factory('ArticlesService', ArticlesService);

  ArticlesService.$inject = ['$resource'];

  function ArticlesService($resource) {
    return $resource('api/articles/:articleId', {
      articleId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());

(function() {
  'use strict';

  angular
    .module('bw-interface')
    .controller('InterfaceController', InterfaceController);
    // .controller('fabController', fabController);

  InterfaceController.$inject = ['$scope', '$rootScope', '$state', 'Upload', '$mdDialog',
                                 '$mdToast', '$http', 'CyclerImages',
                                 'SelectedImages', 'PhotoWorks', 'VideoWorks', 'AboutPageService', 'AboutImage'];
  // fabController.$inject = ['$scope', '$rootScope', '$mdDialog', '$http', '$timeout'];

  function InterfaceController ($scope, $rootScope, $state, Upload, $mdDialog,
                                $mdToast, $http, CyclerImages,
                                SelectedImages, PhotoWorks, VideoWorks, AboutPageService, AboutImage) {

    var last = {
      bottom: false,
      top: true,
      left: false,
      right: true
    };
    $scope.toastPosition = angular.extend({},last);
    $scope.getToastPosition = function() {
      sanitizePosition();
      return Object.keys($scope.toastPosition)
        .filter(function(pos) { return $scope.toastPosition[pos]; })
        .join(' ');
    };
    function sanitizePosition() {
      var current = $scope.toastPosition;
      if ( current.bottom && last.top ) current.top = false;
      if ( current.top && last.bottom ) current.bottom = false;
      if ( current.right && last.left ) current.left = false;
      if ( current.left && last.right ) current.right = false;
      last = angular.extend({},current);
    }
    $scope.showSimpleToast = function(error) {
      var pinTo = $scope.getToastPosition();
      switch (error) {
        case ('images'):
          $mdToast.show(
            $mdToast.simple()
              .textContent('Please add at least one image.')
              .position(pinTo )
              .hideDelay(3000)
          );
          break;
        case ('title'):
          $mdToast.show (
            $mdToast.simple()
              .textContent ('Another work with that title already exists.')
              .position (pinTo)
              .hideDelay (3000)
          );
          break;
        case ('video-image'):
          $mdToast.show(
            $mdToast.simple()
              .textContent('Please add a cover image.')
              .position(pinTo )
              .hideDelay(3000)
          );
          break;
        case ('missing-title'):
          $mdToast.show(
            $mdToast.simple()
              .textContent('Please add a title.')
              .position(pinTo )
              .hideDelay(3000)
          );
          break;
        case ('video-url'):
          $mdToast.show(
            $mdToast.simple()
              .textContent('Please add a video URL.')
              .position(pinTo )
              .hideDelay(3000)
          );
          break;
      }
    };

    $scope.editedModelsFormInput = {};

    $scope.modelsFormInput = {};
    $scope.copyright = '';
    $scope.photoWorkTitle = '';

    $scope.castFormInput = {};
    $scope.videoWorkTitle = '';
    $scope.videoUrl = '';
    $scope.directedByFormInput = {};
    $scope.editedByFormInput = {};
    $scope.videoCoverImage = [];

    $scope.postText = '';

    $scope.bwUploading = {
      visibility: 'hidden'
    };

    $scope.upload = function (file) {
      console.log("file is: " + JSON.stringify(file));
      CyclerImages.uploadCyclerImage(file);
    };

    $scope.getCyclerImages = function () {
      CyclerImages.getCyclerImages();

    };

    $scope.initializePage = function () {
      console.log("initializePage()");
      CyclerImages.getCyclerImages();
      PhotoWorks.getPhotoWorks();
      VideoWorks.getVideoWorks();
      AboutPageService.getAbout();
    };

    $scope.deleteImage = function () {

    };

    $scope.signOut = function () {
      $http.get ('/api/auth/signout')
        .then (function (resp) {
          if (resp.status === 200) {
            $state.go ('home');
          }
        });
    };

    $scope.editAbout = function () {
      $mdDialog.show ({
        controller: ["scope", function (scope) {
          console.log ("ok");
          console.log ('AboutPageService.about: ', AboutPageService.about);
          scope.imageUrl = '';
          scope.aboutText = '';
          if (AboutPageService.about.length === 0) {
            scope.aboutPage = {};
            console.log ('null');
            scope.imageUrl = '';
          } else {
            //console.log ('AboutPageService.about: ', AboutPageService.)
            scope.aboutPage = AboutPageService.about[0];
            scope.aboutText = scope.aboutPage.text;
            scope.imageUrl = scope.aboutPage.imageUrl;
          }

          scope.submit = function () {
            // new image was selected, we will need to upload
            if (AboutImage.newImage.length > 0) {
              Upload.upload({
                url: '/api/about/edit_about_page',
                arrayKey: '',
                data: {
                  file: AboutImage.newImage[0],
                  aboutText: scope.aboutText
                }
              }).then (function (resp) {
                console.log ('success');
                console.log ('resp: ', resp);
                AboutPageService.updateAbout (resp.data);
                $mdDialog.hide()
              }, function (resp) {
                console.log ('error: ', resp);
              }, function (evt) {
                console.log('status: ', evt);
              });
            } else {
              // no new image selected, submit text
              Upload.upload ({
                url: '/api/about/edit_about_page',
                arrayKey: '',
                data: {
                  aboutText: scope.aboutText
                }
              }).then (function (resp) {
                console.log ('success');
                console.log ('resp: ', resp);
                AboutPageService.updateAbout (resp.data);
                $mdDialog.hide()
              }, function (resp) {
                console.log ('error: ', resp);
              }, function (evt) {
                console.log ('status: ', evt);
              });
            }
          };

          $rootScope.hide = function () {
            $mdDialog.hide();
          };

          scope.cancel = function () {
            $mdDialog.cancel();
          };

          $rootScope.answer = function (answer) {
            $mdDialog.hide(answer);
          }
        }],
        templateUrl: 'modules/bw-interface/client/views/edit-about.html',
        parent: angular.element (document.body),
        clickOutsideToClose: true,
        fullscreen: false
      });
    };

    $scope.submitVideoWork = function () {
      console.log("submitting video work");
      console.log ('postText: ', $scope.postText);
      console.log ('castFormInput: ', $scope.castFormInput);
      console.log ('copyright: ', $scope.copyright);
      console.log ('videoWorkTitle: ', $scope.videoWorkTitle);
      console.log ('editorFormInput: ', $scope.editedByFormInput);
      console.log ('directorFormInput: ', $scope.directedByFormInput);
      console.log ('videoUrl: ', $scope.videoUrl);

      console.log ('videoCoverImage: ', $rootScope.videoCoverImage);

      if (angular.equals([], $rootScope.videoCoverImage)){
        console.log('Must add at least one image');
        $scope.showSimpleToast('video-image');
        return;
      } else {

        if ($scope.videoWorkTitle === '') {
          $scope.showSimpleToast ('missing-title');
          return;
        } else {
          // check if the entered work title already exists
          // (another work with the same name already exists).
          for (var i = 0; i < PhotoWorks.photoWorks.length; ++i) {
            if (PhotoWorks.photoWorks[i].title === $scope.photoWorkTitle) {
              $scope.showSimpleToast('title');
              return;
            }
          }
          for (var i = 0; i < VideoWorks.videoWorks.length; ++i) {
            if (VideoWorks.videoWorks[i].title === $scope.photoWorkTitle) {
              $scope.showSimpleToast('title');
              return;
            }
          }

          if ($scope.videoUrl === '') {
            $scope.showSimpleToast ('video-url');
            return;
          }
        }

      }

      console.log ('typeof videoCoverImage ', typeof $rootScope.videoCoverImage);

      var castArray = [];
      for (var member in $scope.castFormInput) {
        castArray.push ($scope.castFormInput[member]);
      }

      var directorArray = [];
      for (var director in $scope.directedByFormInput) {
        directorArray.push ($scope.directedByFormInput[director]);
      }

      var editorArray = [];
      for (var editor in $scope.editedByFormInput) {
        editorArray.push ($scope.editedByFormInput[editor]);
      }

      var coverImageFile = $rootScope.videoCoverImage;


      var videoWork = {
        title: $scope.videoWorkTitle,
        cast: castArray,
        directedBy: directorArray,
        editedBy: editorArray,
        workInfo: $scope.postText,
        copyright: $scope.copyright,
        videoUrl: $scope.videoUrl
      };

      $scope.bwUploading.visibility = 'visible';
      Upload.upload({
        url: '/api/video_works/add_video_work',
        arrayKey: '',
        data: {
          file: coverImageFile,
          videoWork: JSON.stringify (videoWork)
        }
      }).then (function (resp) {
        console.log("Success: ", resp);
        VideoWorks.addVideoWork (resp.data);
        $scope.progressBarValue = 0;
        $scope.bwUploading.visibility = 'hidden';
        $mdDialog.hide();
        $scope.editedByFormInput = [];
        $scope.directedByFormInput = [];
        $scope.castFormInput = [];
        $scope.videoUrl = '';
        $scope.copyright = [];
        $scope.postText = '';
        $scope.videoWorkTitle = '';
      }, function (resp) {
        console.log ("Error: ", resp);
      }, function (evt) {
        console.log ('progress: ', evt);
        $scope.progressBarValue = (evt.loaded / evt.total) * 100;
      });

    };

    $scope.addPhotoWorkImages = [];

    $scope.getPhotoWorks = function () {
      PhotoWorks.getPhotoWorks();
      console.log("photoWorks: " + PhotoWorks.photoWorks);
    };

    $scope.submitPhotoWork = function (event) {
      console.log("submitting");
      console.log("postText: ", $scope.postText);
      console.log("modeslFormInput: " + JSON.stringify($scope.modelsFormInput));
      console.log("copyright: " + $scope.copyright);
      console.log("photoWorkTitle: " + $scope.photoWorkTitle);
      console.log("SelectedImages: " + JSON.stringify(SelectedImages.images));
      $scope.progressBarValue = 0;

      var models = $scope.modelsFormInput;


      if (angular.equals([], SelectedImages.images)){
        console.log('Must add at least one image');
        $scope.showSimpleToast('images');
        return;
      } else {
        if ($scope.photoWorkTitle === '') {
          $scope.showSimpleToast ('missing-title');
          return;
        } else {

          // check if the entered work title already exists
          // (another work with the same name already exists).
          for (var i = 0; i < PhotoWorks.photoWorks.length; ++i) {
            if (PhotoWorks.photoWorks[i].title === $scope.photoWorkTitle) {
              $scope.showSimpleToast ('title');
              return;
            }
          }
          for (var i = 0; i < VideoWorks.videoWorks.length; ++i) {
            if (VideoWorks.videoWorks[i].title === $scope.photoWorkTitle) {
              $scope.showSimpleToast ('title');
              return;
            }
          }
        }

      }

      var modelsArray = [];
      for (var model in models) {
        console.log("models: " + models[model]);
        modelsArray.push(models[model]);
      }

      $scope.bwUploading.visibility = 'visible';

      // upload inputted fields including pictures
      Upload.upload({
        url: '/api/photo_works/add_photo_work',

        // use  this option to ensure that ng-file-upload
        // does not break an array up and create JSON keys
        // for each individual array index.
        arrayKey: '',
        data: {
          file: SelectedImages.images,
          postText: $scope.postText,
          workTitle: $scope.photoWorkTitle,
          copyright: $scope.copyright,
          models: modelsArray
        }
      }).then (function (resp) {
        console.log("Success: " + resp);
        console.log(JSON.stringify(resp.data));
        PhotoWorks.addPhotoWork(resp.data);
        $scope.postText = '';
        $scope.photoWorkTitle = '';
        $scope.copyright = '';
        $scope.modelsFormInput = [];
        SelectedImages.images = [];
        $mdDialog.hide();

      }, function (resp) {
        console.log("error status: " + resp.status);
        $scope.progressBarValue = 0;
        $scope.bwUploading.visibility = 'hidden';
      }, function (evt) {
        console.log("evt: ", evt);
        $scope.progressBarValue = (evt.loaded / evt.total) * 100;
      });
    };

    $scope.$on( 'images.update', function(event) {
      var temp = CyclerImages.images;
      $scope.cyclerImages = temp;
      console.log("temp!: ", temp);

      console.log("cyclerImages: " + JSON.stringify($scope.cyclerImages));
    });

    $scope.$on ( 'photoWorks.update', function (event) {
      console.log("scope.on photoWorks.update");
      var temp = PhotoWorks.photoWorks;
      $scope.photoWorksArray = temp;
      console.log('$scope.photoWorksArray = ' + $scope.photoWorksArray);
    });

    $scope.$on ( 'videoWorks.update', function (event) {
      console.log ("scope.on videoWorks.update");
      var temp = VideoWorks.videoWorks;
      $scope.videoWorksArray = temp;
      console.log ('$scope.videoWorksArray: ', $scope.videoWorksArray);
    });

    $scope.$on ( 'SelectedImages.update', function (event) {
      $scope.addPhotoWorkImages = SelectedImages.images;
    });
  }

}());

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
        DialogController.$inject = ["$rootScope", "$mdDialog"];
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

(function () {
  'use strict';

  angular
    .module('bw-interface')
    .service ('CyclerImages', CyclerImages)
    .service ('SelectedImages', SelectedImages)
    .service ('ServerImages', ServerImages)
    .service ('NewImages', NewImages)
    .service ('EditImages', EditImages)
    .service ('VideoCoverImage', VideoCoverImage)
    .service ('AboutImage', AboutImage);

  CyclerImages.$inject = ['$rootScope', '$http', 'Upload'];
  SelectedImages.$inject = ['$rootScope', '$http', 'Upload'];
  ServerImages.$inject = ['$rootScope', '$http', 'Upload'];
  NewImages.$inject = ['$rootScope', '$http', 'Upload'];
  EditImages.$inject = ['$rootScope', '$http', 'Upload'];
  VideoCoverImage.$inject = ['$rootScope', '$http', 'Upload'];
  AboutImage.$inject = ['$rootScope', '$http', 'Upload'];

  function AboutImage ($rootScope, $http, Upload) {
    var service = {
      image: [],
      newImage: [],
      removeImage: function () {
        service.image = [];
        $rootScope.$broadcast ( 'AboutImage.update' );
      },
      addImage: function (file) {
        service.image = [];
        service.newImage = [];
        service.newImage.push (file);
        $rootScope.$broadcast ( 'AboutImage.update' );
      }
    };

    return service;
  }

  function VideoCoverImage ($rootScope, $http, Upload) {
    var service = {
      image: [],
      removeImage: function () {
        service.image = [];
        console.log("removeCoverImage service function");
        console.log("service.image is: ", service.image);
        $rootScope.$broadcast ( 'VideoCoverImage.update' );
      },
      addImage: function (file) {
        service.image = [];
        service.image.push (file);
        $rootScope.$broadcast ( 'VideoCoverImage.update' );
      }
    };

    return service;
  }

  function NewImages ($rootScope, $http, Upload) {
    var service = {
      images: []
    };

    return service;
  }

  function ServerImages ($rootScope, $http, Upload) {
    var service = {
      images: []
    };

    return service;
  }

  function EditImages ($rootScope, $http, Upload) {
    var service = {
      images: [],
      serverImages: [],
      newImages: [],
      newImageFiles: [],
      imagesToDelete: [],
      addNewImage: function (file, imageUrl, serverImage, coverImage) {
        console.log ('addNewImage EditImages service function');

        // create the new image object
        var imageToPush = {
          imageUrl: imageUrl,
          serverImage: serverImage,
          coverImage: coverImage
        };

        if (service.images.length === 0) imageToPush.coverImage = true;

        // maintain the new image on the general
        // newImages service array
        service.newImages.push (imageToPush);

        // maintain the new image on the overall
        // service images array
        service.images.push (imageToPush);

        // maintain the file information of the new image
        // so that it is properly uploaded on edit submit
        service.newImageFiles.push (file);
      },

      // this function will reinitialize the EditImages
      // service. This reset function can either be done
      // on edit dialog close or edit dialog open.
      reset: function () {
        service.images = [];
        service.serverImages = [];
        service.newImages = [];
        service.newImageFiles =[];
        service.imagesToDelete = [];
      },

      addImage: function (imageUrl, serverImage, coverImage) {
        console.log("addImage EditImages service function");


        var imageToPush = {
          imageUrl: imageUrl,
          serverImage: serverImage,
          coverImage: coverImage
        };

        // if we have a new image that will
        // need to be uploaded
        if (serverImage === false) {
          service.newImages.push(imageToPush);
        } else {
          service.serverImages.push(imageToPush);
        }

        service.images.push(imageToPush);
      },

      // set cover image to the image
      // with passed in imgUrl
      setCoverImage: function (imgUrl) {
        console.log("setCoverImage EditImages: ", imgUrl);
        console.log("service.images.length: ", service.images.length);
        console.log("service.images: ", service.images);

        // iterate through all the images currently in the
        // edit form, both new (to be uploaded) and old (server images)
        for (var i = 0; i < service.images.length; ++i) {

          // if we have a match
          if (service.images[i].imageUrl === imgUrl) {
            console.log("match");
            // set coverImage field of current image
            // in overall images array to true.
            service.images[i].coverImage = true;

            // set the chosenCoverImage field to the matched
            // image's url.
            service.chosenCoverImage = service.images[i].imageUrl;

            // if the coverImage we are setting is a new image
            // that will need to be uploaded, set the coverImage
            // field in newImages service array. This
            // needs to be done to maintain consistency
            if (service.images[i].serverImage === false) {
              for (var j = 0; j < service.newImages.length; ++j) {
                if (service.newImages[j].imageUrl === imgUrl) {
                  service.newImages[j].coverImage = true;
                } else {
                  service.newImages[j].coverImage = false;
                }
              }
            }
          } else {
            service.images[i].coverImage = false;

          }
        }
      },

      removeImage: function (imgUrl) {
        for (var i = 0; i < service.images.length; ++i) {
          if (service.images[i].imageUrl === imgUrl) {
            if (service.images[i].coverImage === true) {
              // if we are removing a cover image

              if(service.images.length > 1) {
                if (i === 0) {
                  // if we are removing the first image from the
                  // image array and if there is more than 1 item
                  // currently in the image array, set the second
                  // image (soon to be first) in the array as
                  // the new cover image after removal
                  service.images[1].coverImage = true;
                  for (var j = 0; j < service.serverImages.length; ++j) {
                    if (service.serverImages[j].imageUrl === service.images[1].imageUrl) {
                      console.log ('server cover image true');
                      console.log ('j is: ', j);
                      console.log ('url: ', service.serverImages[j].imageUrl);
                      service.chosenCoverImage = service.serverImages[j].imageUrl;

                      service.serverImages[j].coverImage = true;

                    }
                  }
                  for (var j = 0; j < service.newImages.length; ++j) {
                    if (service.newImages[j].imageUrl === service.images[1].imageUrl) {
                      service.chosenCoverImage = service.newImages[j].imageUrl;
                      service.newImages[j].coverImage = true;
                      service.chosenCoverImage = service.newImages[j].imageUrl;
                    }
                  }
                } else {

                  // if we are not removing the first image
                  // in the image array and the image array
                  // has more than 1 item, set the first item
                  // in the image array as the cover image.
                  service.images[0].coverImage = true;
                  for (var j = 0; j < service.serverImages.length; ++j) {
                    if (service.serverImages[j].imageUrl === service.images[0].imageUrl) {
                      service.serverImages[j].coverImage = true;
                      console.log ('server cover image true');
                      console.log ('url: ', service.serverImages[j].imageUrl);
                      service.chosenCoverImage = service.serverImages[j].coverImage;
                    }
                  }
                  for (var j = 0; j < service.newImages.length; ++j) {
                    if (service.newImages[j].imageUrl === service.images[0].imageUrl) {
                      service.newImages[j].coverImage = true;
                      service.chosenCoverImage = service.newImages[j].imageUrl;
                    }
                  }
                }
              }
            }

            // if we are removing a server image that
            // was set to cover image
            if (service.images[i].serverImage === true) {
              service.imagesToDelete.push(service.images[i]);
              console.log("imagesToDelete");
              for (var j = 0; j < service.serverImages.length; ++j) {
                console.log ("checking server images");
                if (service.images[i].imageUrl === service.serverImages[j].imageUrl) {
                  service.serverImages.splice (j, 1);
                  console.log("spliced server image");
                }
              }
            }
            // if we are removing a new image
            // but the user now wants to remove
            // it, splice it from newImages service array
            if (service.images[i].serverImage === false) {
              for (var j = 0; j < service.newImages.length; ++j) {
                if (service.newImages[j].imageUrl === imgUrl) {
                  console.log ('spliced');
                  console.log ("service.newImages[j]: ", service.newImages[j]);
                  console.log ("service.images[i]: ", service.images[i]);
                  service.newImages.splice(j, 1);
                  service.newImageFiles.splice (j, 1);
                  console.log ('service.newImages after splice: ', service.newImages);
                }
              }
            }
            console.log ("image spliced: ", service.images[i]);
            service.images.splice(i, 1);
            console.log("service.imagesToDelete: ", service.imagesToDelete);
          }
        }
      }
    };

    return service;
  }

  function SelectedImages ($rootScope, $http, Upload) {
    var service = {
      images: [],
      addImage: function(file) {
        console.log("addImage service function");
        var imageToPush;
        if (service.images.length === 0) {
          imageToPush = {
            file: file,
            coverImage: true
          };
        } else {
          imageToPush = {
            file: file,
            coverImage: false
          };
        }
        service.images.push(imageToPush);
        $rootScope.$broadcast ( 'SelectedImages.update' );
        // console.log("file is: " + JSON.stringify(file));
      },

      setCoverImage: function (imgUrl) {
        console.log("setCoverImage()");
        for (var i = 0; i < service.images.length; ++i) {
          if (service.images[i].file['$ngfBlobUrl'] === imgUrl) {
            service.images[i].coverImage = true;
          } else {
            service.images[i].coverImage = false;
          }
        }
        $rootScope.$broadcast ( 'SelectedImages.update' );
      },

      reset: function () {
        service.images = [];
        $rootScope.$broadcast ( 'SelectedImages.update' );
      },

      removeImage: function (imgUrl) {
        console.log("imgUrl is: " + imgUrl);
        console.log("service.images: " + JSON.stringify(service.images));

        for (var i = 0; i < service.images.length; ++i) {
          if (service.images[i].file['$ngfBlobUrl'] === imgUrl) {
            if (service.images[i].coverImage === true) {
              // if we are removing a cover image

              if (service.images.length > 1) {
                if (i === 0) {

                  // if we are removing the first image from the
                  // image array and if there is more than 1 item
                  // currently in the image array, set the second
                  // image (soon to be first) in the array as
                  // the new cover image after removal
                  service.images[1].coverImage = true;
                } else {

                  // if we are not removing the first image
                  // in the image array and the image array has more
                  // than 1 item, set the first item in the image
                  // array as the cover image.
                  service.images[0].coverImage = true;
                }
              }
            }
            service.images.splice(i, 1);
            console.log('imgUrl: ' + imgUrl);
            console.log('service.images: ' + service.images);
            $rootScope.$broadcast ( 'SelectedImages.update' );
          }
        }
      }
    };
    return service;
  }

  function CyclerImages ($rootScope, $http, Upload) {
    var service = {
      images: [],
      getCyclerImages: function () {
        $http.get('/api/images/get_cycler_images')
          .then (function (response) {
            console.log("response: " + response);
            if(response.status === 200) {
              service.images = response.data;
              service.images.forEach (function (image) {
                image.cssClass = false;
                service.images[0].cssClass = true;
              });
              $rootScope.$broadcast ( 'images.update' );
              console.log(images);
              console.log("JSON stringify: " + JSON.stringify(response));
            }
          });
      },

      uploadCyclerImage: function (file) {
        console.log("$scope.upload");
        console.log("file: " + JSON.stringify(file));
        Upload.upload({
          url: '/api/images/upload_cycler_image',
          data: {file: file}
        }).then (function (resp) {
          console.log('Success: ' + resp.config.data.file.name + 'uploaded. Response: ' +resp.data);
          console.log(JSON.stringify(resp.data));
          service.images.push(resp.data);
          $rootScope.$broadcast( 'images.update' );
          // file = '';
        }, function (resp) {
          console.log('Error status:  ' + resp.status);
        }, function (evt) {
          var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
          if (evt.config.data.file !== null){
            console.log("progress: " + progressPercentage + '% ' + evt.config.data.file.name);
          }
        });
      },

      deleteCyclerImage: function (imagePath) {
        console.log("$scope.deleteImage");
        console.log("imagePath: " + imagePath);
        $http.delete('/api/images/delete_cycler_image', {params: {imagePath: imagePath}})
          .then (function (response) {
            console.log("response: " + JSON.stringify(response));

            // only delete on successful server-side deletion
            if(response.status === 200) {
              // worst case performance O(n) because we have to
              // look through at most n items to find the
              // item to delete from service image array.
              for (var i = 0; i < service.images.length; ++i) {
                if (service.images[i].path === imagePath) {
                  service.images.splice(i, 1);
                  $rootScope.$broadcast ( 'images.update' );
                }
              }
            }

          });

      }
    };

    return service;
  }
}());

(function () {
  'use strict';

  angular
    .module('chat')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Chat',
      state: 'chat'
    });
  }
}());

(function () {
  'use strict';

  angular
    .module('chat.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('chat', {
        url: '/chat',
        templateUrl: 'modules/chat/client/views/chat.client.view.html',
        controller: 'ChatController',
        controllerAs: 'vm',
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Chat'
        }
      });
  }
}());

(function () {
  'use strict';

  angular
    .module('chat')
    .controller('ChatController', ChatController);

  ChatController.$inject = ['$scope', '$state', 'Authentication', 'Socket'];

  function ChatController($scope, $state, Authentication, Socket) {
    var vm = this;

    vm.messages = [];
    vm.messageText = '';
    vm.sendMessage = sendMessage;

    init();

    function init() {
      // If user is not signed in then redirect back home
      if (!Authentication.user) {
        $state.go('home');
      }

      // Make sure the Socket is connected
      if (!Socket.socket) {
        Socket.connect();
      }

      // Add an event listener to the 'chatMessage' event
      Socket.on('chatMessage', function (message) {
        vm.messages.unshift(message);
      });

      // Remove the event listener when the controller instance is destroyed
      $scope.$on('$destroy', function () {
        Socket.removeListener('chatMessage');
      });
    }

    // Create a controller method for sending messages
    function sendMessage() {
      // Create a new message object
      var message = {
        text: vm.messageText
      };

      // Emit a 'chatMessage' message event
      Socket.emit('chatMessage', message);

      // Clear the message text
      vm.messageText = '';
    }
  }
}());

(function () {
  'use strict';

  angular
    .module('core.admin')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addMenuItem('topbar', {
      title: 'Admin',
      state: 'admin',
      type: 'dropdown',
      roles: ['admin']
    });
  }
}());

(function () {
  'use strict';

  angular
    .module('core.admin.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('admin', {
        abstract: true,
        url: '/admin',
        template: '<ui-view/>',
        data: {
          roles: ['admin']
        }
      });
  }
}());

(function () {
  'use strict';

  angular
    .module('core')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addMenu('account', {
      roles: ['user']
    });

    menuService.addMenuItem('account', {
      title: '',
      state: 'settings',
      type: 'dropdown',
      roles: ['user']
    });

    menuService.addSubMenuItem('account', 'settings', {
      title: 'Edit Profile',
      state: 'settings.profile'
    });

    menuService.addSubMenuItem('account', 'settings', {
      title: 'Edit Profile Picture',
      state: 'settings.picture'
    });

    menuService.addSubMenuItem('account', 'settings', {
      title: 'Change Password',
      state: 'settings.password'
    });

    menuService.addSubMenuItem('account', 'settings', {
      title: 'Manage Social Accounts',
      state: 'settings.accounts'
    });
  }
}());

(function () {
  'use strict';

  angular
    .module('core')
    .run(routeFilter);

  routeFilter.$inject = ['$rootScope', '$state', 'Authentication'];

  function routeFilter($rootScope, $state, Authentication) {
    $rootScope.$on('$stateChangeStart', stateChangeStart);
    $rootScope.$on('$stateChangeSuccess', stateChangeSuccess);

    function stateChangeStart(event, toState, toParams, fromState, fromParams) {
      // Check authentication before changing state
      if (toState.data && toState.data.roles && toState.data.roles.length > 0) {
        var allowed = false;

        for (var i = 0, roles = toState.data.roles; i < roles.length; i++) {
          if ((roles[i] === 'guest') || (Authentication.user && Authentication.user.roles !== undefined && Authentication.user.roles.indexOf(roles[i]) !== -1)) {
            allowed = true;
            break;
          }
        }

        if (!allowed) {
          event.preventDefault();
          if (Authentication.user !== undefined && typeof Authentication.user === 'object') {
            $state.transitionTo('forbidden');
          } else {
            $state.go('authentication.signin').then(function () {
              // Record previous state
              storePreviousState(toState, toParams);
            });
          }
        }
      }
    }

    function stateChangeSuccess(event, toState, toParams, fromState, fromParams) {
      // Record previous state
      storePreviousState(fromState, fromParams);
    }

    // Store previous state
    function storePreviousState(state, params) {
      // only store this state if it shouldn't be ignored
      if (!state.data || !state.data.ignoreState) {
        $state.previous = {
          state: state,
          params: params,
          href: $state.href(state, params)
        };
      }
    }
  }
}());

(function () {
  'use strict';

  angular
    .module('core.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider', '$urlRouterProvider'];

  function routeConfig($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.rule(function ($injector, $location) {
      var path = $location.path();
      var hasTrailingSlash = path.length > 1 && path[path.length - 1] === '/';

      if (hasTrailingSlash) {
        // if last character is a slash, return the same url without the slash
        var newPath = path.substr(0, path.length - 1);
        $location.replace().path(newPath);
      }
    });

    // Redirect to 404 when route not found
    $urlRouterProvider.otherwise(function ($injector, $location) {
      $injector.get('$state').transitionTo('not-found', null, {
        location: false
      });
    });

    $stateProvider
      .state('home', {
        url: '/',
        cache: false,
        templateUrl: 'modules/core/client/views/home.client.view.html',
        controller: 'HomeController',
        controllerAs: 'vm'
      })
      .state('about', {
        url: '/about',
        templateUrl: 'modules/core/client/views/about.client.view.html',
        controller: 'AboutController'
      })
      .state('bw-interface', {
        url: '/bw/interface',
        templateUrl: 'modules/bw-interface/client/views/bw-interface.client.view.html',
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Interface'
        }
      })
      .state('not-found', {
        url: '/not-found',
        templateUrl: 'modules/core/client/views/404.client.view.html',
        data: {
          ignoreState: true,
          pageTitle: 'Not-Found'
        }
      })
      .state('bad-request', {
        url: '/bad-request',
        templateUrl: 'modules/core/client/views/400.client.view.html',
        data: {
          ignoreState: true,
          pageTitle: 'Bad-Request'
        }
      })
      .state('forbidden', {
        url: '/forbidden',
        templateUrl: 'modules/core/client/views/403.client.view.html',
        data: {
          ignoreState: true,
          pageTitle: 'Forbidden'
        }
      });
  }
}());

(function () {
  'use strict';

  angular
    .module ('core')
    .controller ('AboutController', AboutController);

  AboutController.$inject = ['$state', '$rootScope', '$scope', '$http'];

  function AboutController ($state, $rootScope, $scope, $http) {

  }
}());

(function () {
  'use strict';

  angular
    .module('core')
    .controller('HeaderController', HeaderController);

  HeaderController.$inject = ['$scope', '$state', 'Authentication', 'menuService'];

  function HeaderController($scope, $state, Authentication, menuService) {
    var vm = this;

    vm.accountMenu = menuService.getMenu('account').items[0];
    vm.authentication = Authentication;
    vm.isCollapsed = false;
    vm.menu = menuService.getMenu('topbar');

    $scope.$on('$stateChangeSuccess', stateChangeSuccess);

    function stateChangeSuccess() {
      // Collapsing the menu after navigation
      vm.isCollapsed = false;
    }
  }
}());

(function () {
  'use strict';

  angular
    .module('core')
    .controller('HomeController', HomeController);


  function HomeController($scope, $rootScope, $state, Upload, $mdDialog, $mdToast, $http, AboutPageService, $ngAnimate) {
    var last = {
      bottom: false,
      top: true,
      left: false,
      right: true
    };
    $scope.toastPosition = angular.extend({},last);
    $scope.getToastPosition = function() {
      sanitizePosition();
      return Object.keys($scope.toastPosition)
        .filter(function(pos) { return $scope.toastPosition[pos]; })
        .join(' ');
    };
    function sanitizePosition() {
      var current = $scope.toastPosition;
      if ( current.bottom && last.top ) current.top = false;
      if ( current.top && last.bottom ) current.bottom = false;
      if ( current.right && last.left ) current.left = false;
      if ( current.left && last.right ) current.right = false;
      last = angular.extend({},current);
    }

    $scope.showSimpleToast = function(msg) {
      var pinTo = $scope.getToastPosition();
      switch (msg) {
        case 'success':
          $mdToast.show(
            $mdToast.simple()
              .textContent('Message sent.')
              .position(pinTo)
              .hideDelay(2000)
          );
          return;
        case 'email':
          $mdToast.show(
            $mdToast.simple()
              .textContent('Please enter your email address.')
              .position(pinTo)
              .hideDelay(2000)
              .parent (angular.element (document.querySelector ('#contact-form-dialog')))
          );
          return;
        case 'name':
          $mdToast.show(
            $mdToast.simple()
              .textContent('Please enter your name.')
              .position(pinTo)
              .hideDelay(2000)
              .parent (angular.element (document.querySelector ('#contact-form-dialog')))
          );
          return;
        case 'message':
          $mdToast.show(
            $mdToast.simple()
              .textContent('Please enter a message.')
              .position(pinTo)
              .hideDelay(2000)
              .parent (angular.element (document.querySelector ('#contact-form-dialog')))
          );
          return;
        case 'message-length':
          $mdToast.show(
            $mdToast.simple()
              .textContent('Message must be less than 1000 characters.')
              .position(pinTo)
              .hideDelay(2000)
              .parent (angular.element (document.querySelector ('#contact-form-dialog')))
          );
          return;
      }
    };
    var vm = this;
    $scope.messageSent = false;
    $scope.show = false;
    $scope.contact = function (ev) {
      console.log ("scope.contact");
      $mdDialog.show({
        controller: ["scope", function (scope) {
          scope.messageSent = false;
          scope.message = '';
          scope.subject = '';
          scope.senderEmail = '';
          scope.senderName = '';
          scope.senderPhoneNumber = '';
          scope.isDisabled = false;
          scope.submitButtonStyle = {
            visibility: 'visible'
          };
          scope.submitProgressStyle = {
            visibility: 'hidden'
          };

          scope.sendEmail = function () {
            scope.isDisabled = true;
            scope.submitProgressStyle.visibility = 'visible';
            scope.submitButtonStyle.visibility = 'hidden';
            console.log ('message is: ', scope.message);
            console.log ('subject is: ', scope.subject);
            console.log ('senderEmail is: ', scope.senderEmail);
            console.log ('senderPhoneNumber is: ', scope.senderPhoneNumber);
            console.log ('senderName is: ', scope.senderName);
            if (scope.senderEmail === '' || typeof scope.senderEmail === 'undefined') {
              $scope.showSimpleToast('email');
              scope.submitProgressStyle.visibility = 'hidden';
              scope.submitButtonStyle.visibility = 'visible';
              scope.isDisabled = false;
              return;
            }
            if (scope.senderName === '' || typeof scope.senderName === 'undefined') {
              $scope.showSimpleToast('name');
              scope.submitProgressStyle.visibility = 'hidden';
              scope.submitButtonStyle.visibility = 'visible';
              scope.isDisabled = false;
              return;
            }
            if (scope.message === '' || typeof scope.message === 'undefined') {
              $scope.showSimpleToast('message');
              scope.submitProgressStyle.visibility = 'hidden';
              scope.submitButtonStyle.visibility = 'visible';
              scope.isDisabled = false;
              return;
            } else {
              if (scope.message.length > 1000) {
                $scope.showSimpleToast('message-length');
                scope.submitProgressStyle.visibility = 'hidden';
                scope.submitButtonStyle.visibility = 'visible';
                scope.isDisabled = false;
              }
            }

            var emailObject = {
              message: scope.message,
              subject: scope.subject,
              senderEmail: scope.senderEmail,
              senderName: scope.senderName,
              senderPhoneNumber: scope.senderPhoneNumber
            };
            $http.post ('/api/email/send_email', emailObject)
              .then (function (resp) {
                if (resp.status === 200) {
                  console.log ('successfully sent email!');
                  scope.submitProgressStyle.visibility = 'hidden';
                  scope.submitButtonStyle.visibility = 'visible';
                  scope.isDisabled = false;
                  scope.messageSent = true;
                  $mdDialog.hide();
                } else {
                  console.log ('error sending email');
                }
              });
          };

          $rootScope.hide = function () {
            $mdDialog.hide();
          };

          scope.cancel = function () {
            $mdDialog.cancel();
          };

          $rootScope.answer = function (answer) {
            $mdDialog.hide(answer);
          }
        }],
        templateUrl: 'modules/core/client/views/contact-form.html',
        parent: angular.element(document.body),
        clickOutsideToClose: false,
        fullscreen: false,
        preserveScope: true,
        scope: $scope,
        locals: {
        },
        onRemoving: function() {
          if ($scope.messageSent) {
            $scope.showSimpleToast('success');
          }
        },
        targetEvent: ev
      });
    };

    $scope.about = function () {
      $state.go ('about');
    };

    $scope.getAboutPage = function () {
      AboutPageService.getAbout();
    };

    $scope.sendEmail = function () {

    };

    $scope.goHome = function () {
      //$state.go ('home');
      /*
      $state.transitionTo('home', {}, {
        reload: true
      }).then(function() {
        $scope.hideContent = true;
        return $timeout(function () {
          return $scope.hideContent = false;
        }, 1);
      });*/

      window.location.href = '/';
    };



    $scope.$on ( 'AboutPageService.update', function () {
      $scope.aboutObject = AboutPageService.about;
      console.log ('update aboutpageservice');
      console.log ('$scope.aboutObject: ', $scope.aboutObject);
      $scope.show = true;
    });
  }

  HomeController.$inject = ['$scope', '$rootScope', '$state', 'Upload',
    '$mdDialog', '$mdToast', '$http', 'AboutPageService'];
}());

(function () {
  'use strict';

  angular.module('core')
    .directive('pageTitle', pageTitle);

  pageTitle.$inject = ['$rootScope', '$timeout', '$interpolate', '$state'];

  function pageTitle($rootScope, $timeout, $interpolate, $state) {
    var directive = {
      restrict: 'A',
      link: link
    };

    return directive;

    function link(scope, element) {
      $rootScope.$on('$stateChangeSuccess', listener);

      function listener(event, toState) {
        var title = (getTitle($state.$current));
        $timeout(function () {
          element.text(title);
        }, 0, false);
      }

      function getTitle(currentState) {
        var applicationCoreTitle = 'Blackwashed';
        var workingState = currentState;
        if (currentState.data) {
          workingState = (typeof workingState.locals !== 'undefined') ? workingState.locals.globals : workingState;
          var stateTitle = $interpolate(currentState.data.pageTitle)(workingState);
          return applicationCoreTitle + ' - ' + stateTitle;
        } else {
          return applicationCoreTitle;
        }
      }
    }
  }
}());

(function () {
  'use strict';

  // https://gist.github.com/rhutchison/c8c14946e88a1c8f9216

  angular
    .module('core')
    .directive('showErrors', showErrors);

  showErrors.$inject = ['$timeout', '$interpolate'];

  function showErrors($timeout, $interpolate) {
    var directive = {
      restrict: 'A',
      require: '^form',
      compile: compile
    };

    return directive;

    function compile(elem, attrs) {
      if (attrs.showErrors.indexOf('skipFormGroupCheck') === -1) {
        if (!(elem.hasClass('form-group') || elem.hasClass('input-group'))) {
          throw new Error('show-errors element does not have the \'form-group\' or \'input-group\' class');
        }
      }

      return linkFn;

      function linkFn(scope, el, attrs, formCtrl) {
        var inputEl,
          inputName,
          inputNgEl,
          options,
          showSuccess,
          initCheck = false,
          showValidationMessages = false;

        options = scope.$eval(attrs.showErrors) || {};
        showSuccess = options.showSuccess || false;
        inputEl = el[0].querySelector('.form-control[name]') || el[0].querySelector('[name]');
        inputNgEl = angular.element(inputEl);
        inputName = $interpolate(inputNgEl.attr('name') || '')(scope);

        if (!inputName) {
          throw new Error('show-errors element has no child input elements with a \'name\' attribute class');
        }

        scope.$watch(function () {
          return formCtrl[inputName] && formCtrl[inputName].$invalid;
        }, toggleClasses);

        scope.$on('show-errors-check-validity', checkValidity);
        scope.$on('show-errors-reset', reset);

        function checkValidity(event, name) {
          if (angular.isUndefined(name) || formCtrl.$name === name) {
            initCheck = true;
            showValidationMessages = true;

            return toggleClasses(formCtrl[inputName].$invalid);
          }
        }

        function reset(event, name) {
          if (angular.isUndefined(name) || formCtrl.$name === name) {
            return $timeout(function () {
              el.removeClass('has-error');
              el.removeClass('has-success');
              showValidationMessages = false;
            }, 0, false);
          }
        }

        function toggleClasses(invalid) {
          el.toggleClass('has-error', showValidationMessages && invalid);

          if (showSuccess) {
            return el.toggleClass('has-success', showValidationMessages && !invalid);
          }
        }
      }
    }
  }
}());

(function () {
  'use strict';

  angular
    .module('core')
    .factory('authInterceptor', authInterceptor);

  authInterceptor.$inject = ['$q', '$injector', 'Authentication'];

  function authInterceptor($q, $injector, Authentication) {
    var service = {
      responseError: responseError
    };

    return service;

    function responseError(rejection) {
      if (!rejection.config.ignoreAuthModule) {
        switch (rejection.status) {
          case 401:
            // Deauthenticate the global user
            Authentication.user = null;
            $injector.get('$state').transitionTo('authentication.signin');
            break;
          case 403:
            $injector.get('$state').transitionTo('forbidden');
            break;
        }
      }
      // otherwise, default behaviour
      return $q.reject(rejection);
    }
  }
}());

(function () {
  'use strict';

  angular
    .module('core')
    .factory('menuService', menuService);

  function menuService() {
    var shouldRender;
    var service = {
      addMenu: addMenu,
      addMenuItem: addMenuItem,
      addSubMenuItem: addSubMenuItem,
      defaultRoles: ['user', 'admin'],
      getMenu: getMenu,
      menus: {},
      removeMenu: removeMenu,
      removeMenuItem: removeMenuItem,
      removeSubMenuItem: removeSubMenuItem,
      validateMenuExistence: validateMenuExistence
    };

    init();

    return service;

    // Add new menu object by menu id
    function addMenu(menuId, options) {
      options = options || {};

      // Create the new menu
      service.menus[menuId] = {
        roles: options.roles || service.defaultRoles,
        items: options.items || [],
        shouldRender: shouldRender
      };

      // Return the menu object
      return service.menus[menuId];
    }

    // Add menu item object
    function addMenuItem(menuId, options) {
      options = options || {};

      // Validate that the menu exists
      service.validateMenuExistence(menuId);

      // Push new menu item
      service.menus[menuId].items.push({
        title: options.title || '',
        state: options.state || '',
        type: options.type || 'item',
        class: options.class,
        roles: ((options.roles === null || typeof options.roles === 'undefined') ? service.defaultRoles : options.roles),
        position: options.position || 0,
        items: [],
        shouldRender: shouldRender
      });

      // Add submenu items
      if (options.items) {
        for (var i in options.items) {
          if (options.items.hasOwnProperty(i)) {
            service.addSubMenuItem(menuId, options.state, options.items[i]);
          }
        }
      }

      // Return the menu object
      return service.menus[menuId];
    }

    // Add submenu item object
    function addSubMenuItem(menuId, parentItemState, options) {
      options = options || {};

      // Validate that the menu exists
      service.validateMenuExistence(menuId);

      // Search for menu item
      for (var itemIndex in service.menus[menuId].items) {
        if (service.menus[menuId].items[itemIndex].state === parentItemState) {
          // Push new submenu item
          service.menus[menuId].items[itemIndex].items.push({
            title: options.title || '',
            state: options.state || '',
            roles: ((options.roles === null || typeof options.roles === 'undefined') ? service.menus[menuId].items[itemIndex].roles : options.roles),
            position: options.position || 0,
            shouldRender: shouldRender
          });
        }
      }

      // Return the menu object
      return service.menus[menuId];
    }

    // Get the menu object by menu id
    function getMenu(menuId) {
      // Validate that the menu exists
      service.validateMenuExistence(menuId);

      // Return the menu object
      return service.menus[menuId];
    }

    function init() {
      // A private function for rendering decision
      shouldRender = function (user) {
        if (this.roles.indexOf('*') !== -1) {
          return true;
        } else {
          if (!user) {
            return false;
          }

          for (var userRoleIndex in user.roles) {
            if (user.roles.hasOwnProperty(userRoleIndex)) {
              for (var roleIndex in this.roles) {
                if (this.roles.hasOwnProperty(roleIndex) && this.roles[roleIndex] === user.roles[userRoleIndex]) {
                  return true;
                }
              }
            }
          }
        }

        return false;
      };

      // Adding the topbar menu
      addMenu('topbar', {
        roles: ['*']
      });
    }

    // Remove existing menu object by menu id
    function removeMenu(menuId) {
      // Validate that the menu exists
      service.validateMenuExistence(menuId);

      delete service.menus[menuId];
    }

    // Remove existing menu object by menu id
    function removeMenuItem(menuId, menuItemState) {
      // Validate that the menu exists
      service.validateMenuExistence(menuId);

      // Search for menu item to remove
      for (var itemIndex in service.menus[menuId].items) {
        if (service.menus[menuId].items.hasOwnProperty(itemIndex) && service.menus[menuId].items[itemIndex].state === menuItemState) {
          service.menus[menuId].items.splice(itemIndex, 1);
        }
      }

      // Return the menu object
      return service.menus[menuId];
    }

    // Remove existing menu object by menu id
    function removeSubMenuItem(menuId, submenuItemState) {
      // Validate that the menu exists
      service.validateMenuExistence(menuId);

      // Search for menu item to remove
      for (var itemIndex in service.menus[menuId].items) {
        if (this.menus[menuId].items.hasOwnProperty(itemIndex)) {
          for (var subitemIndex in service.menus[menuId].items[itemIndex].items) {
            if (this.menus[menuId].items[itemIndex].items.hasOwnProperty(subitemIndex) && service.menus[menuId].items[itemIndex].items[subitemIndex].state === submenuItemState) {
              service.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
            }
          }
        }
      }

      // Return the menu object
      return service.menus[menuId];
    }

    // Validate menu existance
    function validateMenuExistence(menuId) {
      if (menuId && menuId.length) {
        if (service.menus[menuId]) {
          return true;
        } else {
          throw new Error('Menu does not exist');
        }
      } else {
        throw new Error('MenuId was not provided');
      }
    }
  }
}());

(function () {
  'use strict';

  // Create the Socket.io wrapper service
  angular
    .module('core')
    .factory('Socket', Socket);

  Socket.$inject = ['Authentication', '$state', '$timeout'];

  function Socket(Authentication, $state, $timeout) {
    var service = {
      connect: connect,
      emit: emit,
      on: on,
      removeListener: removeListener,
      socket: null
    };

    connect();

    return service;

    // Connect to Socket.io server
    function connect() {
      // Connect only when authenticated
      if (Authentication.user) {
        service.socket = io();
      }
    }

    // Wrap the Socket.io 'emit' method
    function emit(eventName, data) {
      if (service.socket) {
        service.socket.emit(eventName, data);
      }
    }

    // Wrap the Socket.io 'on' method
    function on(eventName, callback) {
      if (service.socket) {
        service.socket.on(eventName, function (data) {
          $timeout(function () {
            callback(data);
          });
        });
      }
    }

    // Wrap the Socket.io 'removeListener' method
    function removeListener(eventName) {
      if (service.socket) {
        service.socket.removeListener(eventName);
      }
    }
  }
}());

(function () {
  'use strict';
  angular
    .module('cycler')
    .controller('SliderController', SliderController);

  SliderController.$inject = ['$scope', '$rootScope', '$http', 'CyclerImages'];

  function SliderController ($scope, $rootScope, $http, CyclerImages, $ngAnimate ) {
    $scope.loadedBool = false;
    $scope.onLoaded = {};
    CyclerImages.getCyclerImages();
    $scope.getCyclerImages = function() {
      console.log("service: " + CyclerImages);
      //angular.element (document.querySelector('body')).removeClass('preload');
      //CyclerImages.getCyclerImages();
    };
    angular.element(document).ready(function ($scope) {
      //document.getElementById('slider-id').innerHTML = 'Hello';
      //$scope.onLoaded = true;

      console.log ("READY");



    });


    $scope.$on( 'images.update', function(event) {
      var temp = CyclerImages.images;
      $scope.loadedBool = true;


      $scope.cyclerImages = temp;
     // console.log ("$scope.cyclerImages.length: ", $scope.cyclerImages.length);
      /*
      $scope.cyclerImages.forEach (function(image) {
        console.log ("for each");
        image.cssClass = false;
        console.log ('current image: ', image);
      });*/
     // console.log("images!: ", $scope.cyclerImages);
      //$scope.cyclerImages[0].cssClass = true;
      //console.log("cyclerImages: " + JSON.stringify($scope.cyclerImages));
    });




    $scope.images = [{
      the_src: 'modules/cycler/client/img/slideshow_1.jpg',
      title: 'Pic 1'},
      { the_src: 'modules/cycler/client/img/slideshow_2.jpg',
        title: 'Pic 2'},
      { the_src: 'modules/cycler/client/img/slideshow_3.jpg',
        title: 'Pic 3'},
      { the_src: 'modules/cycler/client/img/slideshow_5.jpg',
        title: 'Pic 4'}
      ];


  }
}());

(function () {
  'use strict';
  angular.module('cycler')
    .directive('imageSlider', imageSlider)
    .directive ('individualImage', individualImage);

  individualImage.$inject = ['$rootScope', '$timeout', '$interpolate', '$state', '$animate'];
  imageSlider.$inject = ['$rootScope', '$timeout', '$interpolate', '$state', '$animate'];

  function individualImage ($rootScope, $timeout, $interpolate, $state, $animate) {
    var directive = {
      restrict: 'E',
      scope: {
        image: '='
      },
      link: function (scope, elem, attrs) {

      }
    };

    return directive;
  }

  // thanks to
  // https://www.sitepoint.com/creating-slide-show-plugin-angularjs/
  function imageSlider($rootScope, $timeout, $interpolate, $state, $animate) {
    var directive = {
      restrict: 'E',
      replace: true,
      scope: {
        images: '='
      },
      link: function(scope, elem, attrs) {
        scope.currentIndex = 0;
        elem.on ('load', function (){
          scope.currentIndex = -1;
          scope.currentIndex++;
          console.log ('READY LOAD');
        });

        $rootScope.$on('$viewContentLoaded', function() {
          console.log ("READY view view");
          //console.log("scope.images on viewContentLoaded: ", scope.images);
          $rootScope.onLoaded = true;

          scope.currentIndex = 0; // Initially the index is at the first image
          //console.log ('scope.currentIndex: ', scope.currentIndex);
          scope.justLoaded = true;
        });

        if (typeof scope.images !== 'undefined') {
          scope.images[0].cssClass = true;
        }
        scope.justLoaded = true;
        scope.next = function(click) {

          var listItems = elem[0].childNodes[1].children[0].children;
          //console.log("scope.next");
          if (typeof scope.images !== 'undefined') {
            if(scope.images.length === 1) {
             // console.log("scope.images.length: " + scope.images.length);
             // console.log ("scope.images.length === 1");
              // if there's only one image to rotate through,
              // don't ever try and change the index and
              // keep the only image always visible.
              scope.currentIndex = 0;
             // console.log("scope.currentIndex: ", scope.currentIndex);
              // scope.images[scope.currentIndex].visible = true;
              scope.images[0].cssClass = true;

            } else {
              scope.currentIndex < scope.images.length - 1 ? scope.currentIndex ++ : scope.currentIndex = 0;

              if (click === 'yes-click') {
                console.log ('timer is: ', timer);
                $timeout.cancel (timer);
                sliderFunc();
                //$timeout.cancel(timer);
              }
            }
          }


        };

        scope.prev = function() {
          scope.currentIndex > 0 ? scope.currentIndex-- : scope.currentIndex = scope.images.length - 1;
          $timeout.cancel (timer);
          sliderFunc();
        };

        scope.defaultClass = 'slide';

        scope.$watch('currentIndex', function () {
          if (typeof scope.images !== 'undefined') {
           // console.log("scope.images.length: " + scope.images.length);
           // console.log("scope.images: ", scope.images);
            /*
            for (var i = 0; i < scope.images.length; ++i) {
              if (i === scope.currentIndex) {
                console.log ('slide active');
                scope.images[i].cssClass = 'slide-active';
              } else {
                console.log ('slide inactive');
                scope.images[i].cssClass = 'slide-inactive';
              }
            }*/

            for (var i = scope.images.length - 1; i >= 0; --i) {
              scope.images[i].cssClass = false;
              //console.log ('setting false');
            }
            //console.log("scope.currentIndex !=undefined: " + scope.currentIndex);
            // scope.images[scope.currentIndex].visible = true; // make the current image visible
            // $animate.addClass (scope.images[scope.currentIndex], 'slide-active');
            scope.images[scope.currentIndex].cssClass = true;
            console.log ('scope.images[0].cssClass: ', scope.images[0].cssClass);
            //console.log ("scope.currentIndex is: ", scope.currentIndex);

          }
        });

        var timer;



        var sliderFunc = function() {
          timer = $timeout(function() {
            scope.next('no_click');
            sliderFunc();
          }, 5000);
        };

        //console.log ("typeof scope.images: ", typeof scope.images);

        timer = $timeout (function () {
          sliderFunc();
        }, 500);


        //scope.currentIndex = 0;


        scope.$on('$destroy', function() {
          console.log ('destroy');
          $timeout.cancel(timer); // when the scope is getting destroyed, cancel the timer
        });
      },
      templateUrl: 'modules/cycler/client/views/image-slider.html'
    };
    return directive;
  }
}());

(function() {
  'use strict';

  angular
    .module('photoWorks')
    .controller(PhotoWorksController);

  PhotoWorksController.$inject = ['$scope', '$rootScope', 'Upload', '$mdDialog',
                                  '$mdToast', '$http', 'CyclerImages',
                                  'SelectedImages', 'PhotoWorks'];

  function PhotoWorksController ($scope, $rootScope, Upload, $mdDialog, $mdToast,
                                 $http, CyclerImages, SelectedImages, PhotoWorks) {

    $scope.$on('photoWorks.update', function (event) {
      $scope.photoWorks = PhotoWorks.photoWorks;
    });


  }
}());

(function () {
  'use strict';

  angular.module('photoWorks')
    .directive('photoWork', photoWork)
    .directive('viewPhotoWork', viewPhotoWork)
    .directive('workImage', workImage);

  photoWork.$inject = ['$rootScope', '$http', '$mdDialog', '$mdMedia', '$mdToast', 'PhotoWorks', 'VideoWorks', 'EditImages', 'Upload'];
  viewPhotoWork.$inject = ['$rootScope', '$state', '$timeout', '$mdDialog', '$mdMedia', 'SelectedImages', 'PhotoWorks'];
  workImage.$inject = ['$rootScope', '$state', '$timeout', '$mdDialog', '$mdMedia', 'SelectedImages', 'PhotoWorks'];


  function workImage ($rootScope, $state, $timeout, $mdDialog, $mdMedia, SelectedImages, PhotoWorks) {
    var directive = {
      restrict: 'E',
      scope: {
        imageUrl: '='
      },
      link: function (scope) {

      },
      templateUrl: 'modules/photo-works/client/views/work-image.html'
    };

    return directive;
  }

  function viewPhotoWork ($rootScope, $state, $timeout, $mdDialog, $mdMedia, SelectedImages, PhotoWorks) {
    var directive = {
      restrict: 'E',
      scope: {
        photoWork: '='
      },
      link: function (scope) {

      },
      templateUrl: 'modules/photo-works/client/views/view-photo-work.html'
    };

    return directive;
  }

  function photoWork ($rootScope, $http, $mdDialog, $mdMedia, $mdToast, PhotoWorks, VideoWorks, EditImages, Upload) {
    var directive = {
      restrict: 'E',
      scope: {
        coverImageUrl: '=',
        work: '='
      },
      link: function (scope, elem, attr) {



        scope.coverImage = PhotoWorks.coverImage;
        scope.customFullscreen = $mdMedia('xs') || $mdMedia('sm');
        scope.editPhotoWork = function (work) {
          console.log("work is: ", work);

          EditImages.images = [];
          EditImages.newImages = [];
          EditImages.imagesToDelete = [];
          EditImages.newImageFiles = [];
          EditImages.serverImages = [];
          EditImages.chosenCoverImage = '';


          // on edit click, add images already apart
          // of the photo work to the EditImages service
          for (var i = 0; i < work.images.length; ++i) {
            console.log("work.images[i]: ", work.images[i]);

            // if the image we are currently look at
            // is the cover image
            if (work.images[i].coverImage === true) {

              // set the chosenCoverImage field of the
              // EditImages service for the current
              // photo work to edit.
              EditImages.chosenCoverImage = work.images[i].imageUrl;
            }
                                // url of image                 // isCoverImage Boolean
            EditImages.addImage(work.images[i].imageUrl, true, work.images[i].coverImage);
          }                                     // is serverImage Boolean

          scope.modelsModel = [];

          // iterate through the currently set models for the photo work
          for (var i = 0; i < work.models.length; ++i) {
            console.log('work.models[i]: ', work.models[i]);

            // push each model onto the data model for              // this for loop might be unnecessary
            // models input on photo work
            scope.modelsModel.push({name: 'model_' + i});
            scope.modelNumber = i;
          }

          // show edit dialog
          $mdDialog.show({

            // inject scope variables to dialog controller
            locals: {

              // current photo work object
              work: scope.work,

              // photo work's models
              models: scope.work.models,

              // models input data model
              modelsModel: scope.modelsModel,
              modelNumber: scope.modelNumber
            },
            controller: ["$scope", "$rootScope", "$mdDialog", "$mdToast", "work", "modelsModel", "modelNumber", "models", function ($scope, $rootScope, $mdDialog, $mdToast, work, modelsModel, modelNumber, models) {

              var last = {
                bottom: false,
                top: true,
                left: false,
                right: true
              };
              $scope.toastPosition = angular.extend({},last);
              $scope.bwUploadingEdit = {
                visibility: 'hidden'
              };
              $scope.getToastPosition = function() {
                sanitizePosition();
                return Object.keys($scope.toastPosition)
                  .filter(function(pos) { return $scope.toastPosition[pos]; })
                  .join(' ');
              };
              function sanitizePosition() {
                var current = $scope.toastPosition;
                if ( current.bottom && last.top ) current.top = false;
                if ( current.top && last.bottom ) current.bottom = false;
                if ( current.right && last.left ) current.left = false;
                if ( current.left && last.right ) current.right = false;
                last = angular.extend({},current);
              }
              $scope.showSimpleToast = function(error) {
                var pinTo = $scope.getToastPosition();
                if (error === 'images') {
                  $mdToast.show(
                    $mdToast.simple()
                      .textContent('Please add at least one image.')
                      .position(pinTo )
                      .hideDelay(3000)
                      .parent ($mdDialog)
                  );
                } else {
                  if (error === 'title') {
                    $mdToast.show (
                      $mdToast.simple()
                        .textContent ('Another work with that title already exists.')
                        .position (pinTo)
                        .hideDelay (3000)
                    );
                  } else {
                    if (error === 'video-image') {
                      $mdToast.show(
                        $mdToast.simple()
                          .textContent('Please add a cover image.')
                          .position(pinTo )
                          .hideDelay(3000)
                      );
                    } else {
                      if (error === 'missing-title') {
                        $mdToast.show(
                          $mdToast.simple()
                            .textContent('Please add a title.')
                            .position(pinTo )
                            .hideDelay(3000)
                        );
                      } else {
                        if (error === 'video-url') {
                          $mdToast.show(
                            $mdToast.simple()
                              .textContent('Please add a video URL.')
                              .position(pinTo )
                              .hideDelay(3000)
                          );
                        }
                      }
                    }
                  }
                }
              };

              // set up scope variables for controller/dialog scope.
              $scope.work = work;
              $scope.models = models;
              $scope.modelsModel = modelsModel;


              // set up variables to hold data before
              // any edits to restore in case of a
              // cancelled edit.
              var oldModels = $scope.work.models;
              var model = modelsModel;
              var workTitle = $scope.work.title;
              var postText = $scope.work.postText;
              var copyright = $scope.work.copyright;

              $scope.addModel = function (event) {
                $scope.modelsModel.push( {name: 'model_' + ++modelNumber} )
              };

              $scope.cancelEdit = function (event) {
                work.title = workTitle;
                work.copyright = copyright;
                work.models = oldModels;
                work.postText = postText;
                $scope.modelsModel = model;
                for (var model in work.models) {
                  if (work.models[model] === '') {
                    work.models.splice (model, 1);
                  }
                }
                for (model in modelsModel) {
                  if (modelsModel[model] === '') modelsModel.splice (i, 1);
                }
                $mdDialog.hide();
              };

              // submit edits for updating photo work on back end.
              $scope.submitEditedWork = function (event) {
                if (EditImages.images.length === 0) {
                  $scope.showSimpleToast('images');
                  return;
                } else {

                  if (work.title === '') {
                    $scope.showSimpleToast ('missing-title');
                    return;
                  }

                  // check if the entered work title already exists
                  // (another work with the same name already exists).
                  for (var i = 0; i < PhotoWorks.photoWorks.length; ++i) {
                    if (PhotoWorks.photoWorks[i].title === $scope.photoWorkTitle) {
                      $scope.showSimpleToast ('title');
                      return;
                    }
                  }
                  for (var i = 0; i < VideoWorks.videoWorks.length; ++i) {
                    if (VideoWorks.videoWorks[i].title === $scope.photoWorkTitle) {
                      $scope.showSimpleToast ('title');
                      return;
                    }
                  }

                  for (var i = 0; i < work.models.length; ++i) {
                    if (work.models[i] === '' || work.models[i].match(/^\s*$/)) {
                      work.models.splice(i, 1);
                      i = 0;
                    }
                  }
                }
                console.log("submit edited work");
                console.log("work.models: ", work.models);
                console.log("work.title: ", work.title);
                console.log("work.postText: ", work.postText);
                console.log("EditImages.chosenCoverImage: ", EditImages.chosenCoverImage);
                console.log("EditImages.images: ", EditImages.images);
                console.log("EditImages.newImages: ", EditImages.newImages);
                console.log("EditImages.imagesToDelete: ", EditImages.imagesToDelete);

                var editObject = {
                  newImages: EditImages.newImages,
                  chosenCoverImage: EditImages.chosenCoverImage,

                  // DB entry identifier for easy lookup
                  identifier: work._id,

                  // photo work images that were already on server
                  serverImages: EditImages.serverImages,

                  // any server images that need to be deleted after
                  // the edit
                  imagesToDelete: EditImages.imagesToDelete,
                  workTitle: work.title,
                  postText: work.postText,
                  copyright: work.copyright,
                  models: work.models
                };

                if (EditImages.newImageFiles.length > 0) {
                  $scope.bwUploadingEdit = {
                    visibility: 'visible'
                  };
                }

                Upload.upload({
                  url: '/api/photo_works/edit_photo_work',

                  // arrayKey ensures that any submitted array fields
                  // remain arrays when they are parsed on back end.
                  arrayKey: '',
                  data: {

                    // file key needs to be set to any new image files
                    // as new image files require an upload
                    file: EditImages.newImageFiles,
                    editObject: JSON.stringify (editObject)
                  }
                }).then (function (resp) {
                  console.log("Success: ", resp);
                  var newWork = resp.data;
                  for (var i = 0; i < PhotoWorks.photoWorks.length; ++i) {
                    if (PhotoWorks.photoWorks[i]._id === newWork._id) {
                      PhotoWorks.photoWorks[i] = newWork;
                    }
                  }
                  $mdDialog.cancel();
                  EditImages.reset();
                }, function (resp) {
                  console.log("error status: ", resp.status);
                }, function (evt) {
                  console.log("evt: ", evt);
                  $scope.uploadProgress = (evt.loaded / evt.total) * 100;
                });

              };

              $scope.editSelected = function (files, badFiles) {

              };

              $scope.hide = function () {
                $mdDialog.hide();
              }
            }],
            controllerAs: 'editCtrl',
            onRemoving: function () {
              EditImages.reset();
            },
            clickOutsideToClose: true,
            templateUrl: 'modules/bw-interface/client/views/edit-photo-work.html'
          });
        };

        scope.deletePhotoWork = function (ev) {
          console.log("scope.work: ", scope.work);
          PhotoWorks.deletePhotoWork(scope.work);
        };

        scope.showPhotoWork = function (ev) {
          console.log("showPhotoWork()");
          var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && scope.customFullscreen;
          console.log(scope.work);
          $rootScope.currentWork = scope.work;
          $mdDialog.show({
            controller: ["scope", "$mdDialog", "work", function (scope, $mdDialog, work) {
              scope.work = work;

              scope.viewImage = function(event, imageUrl) {
                console.log("viewImage");
                console.log("imageUrl: ", imageUrl);
                $mdDialog.show({
                  controllerAs: 'ViewImageController',
                  controller: ["$mdDialog", "scope", "work", function ($mdDialog, scope, work) {
                    console.log("imageUrl controller: ", imageUrl);
                    scope.imageUrl = imageUrl;

                    scope.closeDialog = function () {
                      $mdDialog.cancel();
                    }
                  }],
                  preserveScope: true,
                  autoWrap: true,
                  skipHide: true,
                  clickOutsideToClose: true,
                  locals: {
                    work: scope.work
                  },
                  template: '<md-dialog class="view-image-dialog" aria-label="viewImageLabel">' +
                                '<span flex>' +
                                '<md-button ng-click="closeDialog()" layout-align="end center" class="md-warn md-hue-2 md-fab md-mini view-image-close">' +
                                  '<md-icon>close</md-icon>' +
                                '</md-button>' +
                                '</span>' +
                                '<img class="view-image-img" ng-src="{{imageUrl}}"/>' +
                            '</md-dialog>'
                });
              };

              $rootScope.hide = function () {
                $mdDialog.hide();
              };
              scope.cancel = function () {
                console.log("cancel");
                $mdDialog.cancel();
              };
              $rootScope.answer = function (answer) {
                $mdDialog.hide(answer);
              };
            }],
            locals: {
              work: scope.work
            },
            templateUrl: 'modules/photo-works/client/views/view-photo-work.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            autoWrap: false,
            clickOutsideToClose: true,

            fullscreen: useFullScreen
          });


        };
      },
      templateUrl: 'modules/photo-works/client/views/photo-work.html'
    };

    return directive;
  }
}());

(function () {
  'use strict';

  angular.module('photoWorks')
    .service('PhotoWorks', PhotoWorks);

  PhotoWorks.$inject = ['$rootScope', '$http'];

  function PhotoWorks ($rootScope, $http) {
    var service = {
      photoWorks: [],

      getPhotoWorks: function () {
        $http.get('api/photo_works/get_photo_works')
          .then (function (response) {
            if (response.status === 200) {
              console.log("response.data photo works: " + JSON.stringify(response.data));
              service.photoWorks = response.data;
              console.log(service.photoWorks);
              // console.log("json stringify images: ", service.photoWorks[4]);
              $rootScope.$broadcast ( 'photoWorks.update' );
            }
          });
      },

      deletePhotoWork: function (work) {
        console.log('work is: ', work);
        $http.delete('api/photo_works/delete_photo_work', {params: {data: work}})
          .then (function (response) {
            if (response.status === 200) {
              for (var i = 0; i < service.photoWorks.length; ++i) {
                if (service.photoWorks[i]._id === work._id) {
                  service.photoWorks.splice(i, 1);
                  $rootScope.$broadcast ( 'photoWorks.update' );
                }
              }
            }
          });
      },

      addPhotoWork: function (work) {
        service.photoWorks.push(work);
        $rootScope.$broadcast ( 'photoWorks.update' );
      }
    };

    return service;
  }
}());

(function () {
  'use strict';

  angular
    .module('users.admin')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  // Configuring the Users module
  function menuConfig(menuService) {
    menuService.addSubMenuItem('topbar', 'admin', {
      title: 'Manage Users',
      state: 'admin.users'
    });
  }
}());

(function () {
  'use strict';

  // Setting up route
  angular
    .module('users.admin.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('admin.users', {
        url: '/users',
        templateUrl: 'modules/users/client/views/admin/list-users.client.view.html',
        controller: 'UserListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Users List'
        }
      })
      .state('admin.user', {
        url: '/users/:userId',
        templateUrl: 'modules/users/client/views/admin/view-user.client.view.html',
        controller: 'UserController',
        controllerAs: 'vm',
        resolve: {
          userResolve: getUser
        },
        data: {
          pageTitle: 'Edit {{ userResolve.displayName }}'
        }
      })
      .state('admin.user-edit', {
        url: '/users/:userId/edit',
        templateUrl: 'modules/users/client/views/admin/edit-user.client.view.html',
        controller: 'UserController',
        controllerAs: 'vm',
        resolve: {
          userResolve: getUser
        },
        data: {
          pageTitle: 'Edit User {{ userResolve.displayName }}'
        }
      });

    getUser.$inject = ['$stateParams', 'AdminService'];

    function getUser($stateParams, AdminService) {
      return AdminService.get({
        userId: $stateParams.userId
      }).$promise;
    }
  }
}());

(function () {
  'use strict';

  // Setting up route
  angular
    .module('users.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    // Users state routing
    $stateProvider
      .state('settings', {
        abstract: true,
        url: '/settings',
        templateUrl: 'modules/users/client/views/settings/settings.client.view.html',
        controller: 'SettingsController',
        controllerAs: 'vm',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('settings.profile', {
        url: '/profile',
        templateUrl: 'modules/users/client/views/settings/edit-profile.client.view.html',
        controller: 'EditProfileController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Settings'
        }
      })
      .state('settings.password', {
        url: '/password',
        templateUrl: 'modules/users/client/views/settings/change-password.client.view.html',
        controller: 'ChangePasswordController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Settings password'
        }
      })
      .state('settings.accounts', {
        url: '/accounts',
        templateUrl: 'modules/users/client/views/settings/manage-social-accounts.client.view.html',
        controller: 'SocialAccountsController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Settings accounts'
        }
      })
      .state('settings.picture', {
        url: '/picture',
        templateUrl: 'modules/users/client/views/settings/change-profile-picture.client.view.html',
        controller: 'ChangeProfilePictureController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Settings picture'
        }
      })
      .state('authentication', {
        abstract: true,
        url: '/authentication',
        templateUrl: 'modules/users/client/views/authentication/authentication.client.view.html',
        controller: 'AuthenticationController',
        controllerAs: 'vm'
      })
      .state('authentication.signup', {
        url: '/signup',
        templateUrl: 'modules/users/client/views/authentication/signup.client.view.html',
        controller: 'AuthenticationController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Signup'
        }
      })
      .state('authentication.signin', {
        url: '/signin?err',
        templateUrl: 'modules/users/client/views/authentication/signin.client.view.html',
        controller: 'AuthenticationController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Signin'
        }
      })
      .state('password', {
        abstract: true,
        url: '/password',
        template: '<ui-view/>'
      })
      .state('password.forgot', {
        url: '/forgot',
        templateUrl: 'modules/users/client/views/password/forgot-password.client.view.html',
        controller: 'PasswordController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Password forgot'
        }
      })
      .state('password.reset', {
        abstract: true,
        url: '/reset',
        template: '<ui-view/>'
      })
      .state('password.reset.invalid', {
        url: '/invalid',
        templateUrl: 'modules/users/client/views/password/reset-password-invalid.client.view.html',
        data: {
          pageTitle: 'Password reset invalid'
        }
      })
      .state('password.reset.success', {
        url: '/success',
        templateUrl: 'modules/users/client/views/password/reset-password-success.client.view.html',
        data: {
          pageTitle: 'Password reset success'
        }
      })
      .state('password.reset.form', {
        url: '/:token',
        templateUrl: 'modules/users/client/views/password/reset-password.client.view.html',
        controller: 'PasswordController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Password reset form'
        }
      });
  }
}());

(function () {
  'use strict';

  angular
    .module('users.admin')
    .controller('UserListController', UserListController);

  UserListController.$inject = ['$scope', '$filter', 'AdminService'];

  function UserListController($scope, $filter, AdminService) {
    var vm = this;
    vm.buildPager = buildPager;
    vm.figureOutItemsToDisplay = figureOutItemsToDisplay;
    vm.pageChanged = pageChanged;

    AdminService.query(function (data) {
      vm.users = data;
      vm.buildPager();
    });

    function buildPager() {
      vm.pagedItems = [];
      vm.itemsPerPage = 15;
      vm.currentPage = 1;
      vm.figureOutItemsToDisplay();
    }

    function figureOutItemsToDisplay() {
      vm.filteredItems = $filter('filter')(vm.users, {
        $: vm.search
      });
      vm.filterLength = vm.filteredItems.length;
      var begin = ((vm.currentPage - 1) * vm.itemsPerPage);
      var end = begin + vm.itemsPerPage;
      vm.pagedItems = vm.filteredItems.slice(begin, end);
    }

    function pageChanged() {
      vm.figureOutItemsToDisplay();
    }
  }
}());

(function () {
  'use strict';

  angular
    .module('users.admin')
    .controller('UserController', UserController);

  UserController.$inject = ['$scope', '$state', '$window', 'Authentication', 'userResolve'];

  function UserController($scope, $state, $window, Authentication, user) {
    var vm = this;

    vm.authentication = Authentication;
    vm.user = user;
    vm.remove = remove;
    vm.update = update;

    function remove(user) {
      if ($window.confirm('Are you sure you want to delete this user?')) {
        if (user) {
          user.$remove();

          vm.users.splice(vm.users.indexOf(user), 1);
        } else {
          vm.user.$remove(function () {
            $state.go('admin.users');
          });
        }
      }
    }

    function update(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.userForm');

        return false;
      }

      var user = vm.user;

      user.$update(function () {
        $state.go('admin.user', {
          userId: user._id
        });
      }, function (errorResponse) {
        vm.error = errorResponse.data.message;
      });
    }
  }
}());

(function () {
  'use strict';

  angular
    .module('users')
    .controller('AuthenticationController', AuthenticationController);

  AuthenticationController.$inject = ['$scope', '$state', '$http', '$location', '$window', '$mdToast', 'Authentication', 'PasswordValidator'];

  function AuthenticationController($scope, $state, $http, $location, $window, $mdToast, Authentication, PasswordValidator) {
    var vm = this;

    vm.authentication = Authentication;
    vm.getPopoverMsg = PasswordValidator.getPopoverMsg;
    vm.signup = signup;
    vm.signin = signin;
    vm.callOauthProvider = callOauthProvider;

    vm.showTip = false;

    vm.passwordTooltip = {
      showToolTip: vm.showTip,
      tipDirection: 'bottom',
      delayTooltip: 300
    };

    var last = {
      bottom: false,
      top: true,
      left: false,
      right: true
    };
    $scope.toastPosition = angular.extend({},last);
    $scope.getToastPosition = function() {
      sanitizePosition();
      return Object.keys($scope.toastPosition)
        .filter(function(pos) { return $scope.toastPosition[pos]; })
        .join(' ');
    };
    function sanitizePosition() {
      var current = $scope.toastPosition;
      if ( current.bottom && last.top ) current.top = false;
      if ( current.top && last.bottom ) current.bottom = false;
      if ( current.right && last.left ) current.left = false;
      if ( current.left && last.right ) current.right = false;
      last = angular.extend({},current);
    }
    $scope.showSimpleToast = function(error) {
      var pinTo = $scope.getToastPosition();
      if (error === 'mismatch') {
        $mdToast.show(
          $mdToast.simple()
            .textContent('Passwords do not match.')
            .position(pinTo )
            .hideDelay(3000)
        );
      }
    };




    // Get an eventual error defined in the URL query string:
    vm.error = $location.search().err;

    // If user is signed in then redirect back home
    if (vm.authentication.user) {
      $location.path('/');
    }

    function signup(isValid) {

      if (vm.credentials.password != vm.credentials.confirmPassword) {
        $scope.showSimpleToast('mismatch');
        return;
      }
      vm.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.userForm');

        return false;
      }

      vm.credentials.roles = 'admin';

      $http.post('/api/auth/signup', vm.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        vm.authentication.user = response;

        // And redirect to the previous or home page
        $state.go('bw-interface');
      }).error(function (response) {
        vm.error = response.message;
      });
    }

    function signin(isValid) {
      vm.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.userForm');

        return false;
      }


      $http.post('/api/auth/signin', vm.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        vm.authentication.user = response;

        // And redirect to the previous or home page
        $state.go('bw-interface');
      }).error(function (response) {
        vm.error = response.message;
      });
    }

    // OAuth provider request
    function callOauthProvider(url) {
      if ($state.previous && $state.previous.href) {
        url += '?redirect_to=' + encodeURIComponent($state.previous.href);
      }

      // Effectively call OAuth authentication route:
      $window.location.href = url;
    }
  }
}());

(function () {
  'use strict';

  angular
    .module('users')
    .controller('PasswordController', PasswordController);

  PasswordController.$inject = ['$scope', '$stateParams', '$http', '$location', 'Authentication', 'PasswordValidator'];

  function PasswordController($scope, $stateParams, $http, $location, Authentication, PasswordValidator) {
    var vm = this;

    vm.resetUserPassword = resetUserPassword;
    vm.askForPasswordReset = askForPasswordReset;
    vm.authentication = Authentication;
    vm.getPopoverMsg = PasswordValidator.getPopoverMsg;

    // If user is signed in then redirect back home
    if (vm.authentication.user) {
      $location.path('/');
    }

    // Submit forgotten password account id
    function askForPasswordReset(isValid) {
      vm.success = vm.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.forgotPasswordForm');

        return false;
      }

      $http.post('/api/auth/forgot', vm.credentials).success(function (response) {
        // Show user success message and clear form
        vm.credentials = null;
        vm.success = response.message;

      }).error(function (response) {
        // Show user error message and clear form
        vm.credentials = null;
        vm.error = response.message;
      });
    }

    // Change user password
    function resetUserPassword(isValid) {
      vm.success = vm.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.resetPasswordForm');

        return false;
      }

      $http.post('/api/auth/reset/' + $stateParams.token, vm.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        vm.passwordDetails = null;

        // Attach user profile
        Authentication.user = response;

        // And redirect to the index page
        $location.path('/password/reset/success');
      }).error(function (response) {
        vm.error = response.message;
      });
    }
  }
}());

(function () {
  'use strict';

  angular
    .module('users')
    .controller('ChangePasswordController', ChangePasswordController);

  ChangePasswordController.$inject = ['$scope', '$http', 'Authentication', 'PasswordValidator'];

  function ChangePasswordController($scope, $http, Authentication, PasswordValidator) {
    var vm = this;

    vm.user = Authentication.user;
    vm.changeUserPassword = changeUserPassword;
    vm.getPopoverMsg = PasswordValidator.getPopoverMsg;

    // Change user password
    function changeUserPassword(isValid) {
      vm.success = vm.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.passwordForm');

        return false;
      }

      $http.post('/api/users/password', vm.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.$broadcast('show-errors-reset', 'vm.passwordForm');
        vm.success = true;
        vm.passwordDetails = null;
      }).error(function (response) {
        vm.error = response.message;
      });
    }
  }
}());

(function () {
  'use strict';

  angular
    .module('users')
    .controller('ChangeProfilePictureController', ChangeProfilePictureController);

  ChangeProfilePictureController.$inject = ['$scope', '$timeout', '$window', 'Authentication', 'FileUploader'];

  function ChangeProfilePictureController($scope, $timeout, $window, Authentication, FileUploader) {
    var vm = this;

    vm.user = Authentication.user;
    vm.imageURL = vm.user.profileImageURL;
    vm.uploadProfilePicture = uploadProfilePicture;

    vm.cancelUpload = cancelUpload;
    // Create file uploader instance
    vm.uploader = new FileUploader({
      url: 'api/users/picture',
      alias: 'newProfilePicture',
      onAfterAddingFile: onAfterAddingFile,
      onSuccessItem: onSuccessItem,
      onErrorItem: onErrorItem
    });

    // Set file uploader image filter
    vm.uploader.filters.push({
      name: 'imageFilter',
      fn: function (item, options) {
        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
      }
    });

    // Called after the user selected a new picture file
    function onAfterAddingFile(fileItem) {
      if ($window.FileReader) {
        var fileReader = new FileReader();
        fileReader.readAsDataURL(fileItem._file);

        fileReader.onload = function (fileReaderEvent) {
          $timeout(function () {
            vm.imageURL = fileReaderEvent.target.result;
          }, 0);
        };
      }
    }

    // Called after the user has successfully uploaded a new picture
    function onSuccessItem(fileItem, response, status, headers) {
      // Show success message
      vm.success = true;

      // Populate user object
      vm.user = Authentication.user = response;

      // Clear upload buttons
      cancelUpload();
    }

    // Called after the user has failed to uploaded a new picture
    function onErrorItem(fileItem, response, status, headers) {
      // Clear upload buttons
      cancelUpload();

      // Show error message
      vm.error = response.message;
    }

    // Change user profile picture
    function uploadProfilePicture() {
      // Clear messages
      vm.success = vm.error = null;

      // Start upload
      vm.uploader.uploadAll();
    }

    // Cancel the upload process
    function cancelUpload() {
      vm.uploader.clearQueue();
      vm.imageURL = vm.user.profileImageURL;
    }
  }
}());

(function () {
  'use strict';

  angular
    .module('users')
    .controller('EditProfileController', EditProfileController);

  EditProfileController.$inject = ['$scope', '$http', '$location', 'UsersService', 'Authentication'];

  function EditProfileController($scope, $http, $location, UsersService, Authentication) {
    var vm = this;

    vm.user = Authentication.user;
    vm.updateUserProfile = updateUserProfile;

    // Update a user profile
    function updateUserProfile(isValid) {
      vm.success = vm.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.userForm');

        return false;
      }

      var user = new UsersService(vm.user);

      user.$update(function (response) {
        $scope.$broadcast('show-errors-reset', 'vm.userForm');

        vm.success = true;
        Authentication.user = response;
      }, function (response) {
        vm.error = response.data.message;
      });
    }
  }
}());

(function () {
  'use strict';

  angular
    .module('users')
    .controller('SocialAccountsController', SocialAccountsController);

  SocialAccountsController.$inject = ['$scope', '$http', 'Authentication'];

  function SocialAccountsController($scope, $http, Authentication) {
    var vm = this;

    vm.user = Authentication.user;
    vm.hasConnectedAdditionalSocialAccounts = hasConnectedAdditionalSocialAccounts;
    vm.isConnectedSocialAccount = isConnectedSocialAccount;
    vm.removeUserSocialAccount = removeUserSocialAccount;

    // Check if there are additional accounts
    function hasConnectedAdditionalSocialAccounts() {
      return ($scope.user.additionalProvidersData && Object.keys($scope.user.additionalProvidersData).length);
    }

    // Check if provider is already in use with current user
    function isConnectedSocialAccount(provider) {
      return vm.user.provider === provider || (vm.user.additionalProvidersData && vm.user.additionalProvidersData[provider]);
    }

    // Remove a user social account
    function removeUserSocialAccount(provider) {
      vm.success = vm.error = null;

      $http.delete('/api/users/accounts', {
        params: {
          provider: provider
        }
      }).success(function (response) {
        // If successful show success message and clear form
        vm.success = true;
        vm.user = Authentication.user = response;
      }).error(function (response) {
        vm.error = response.message;
      });
    }
  }
}());

(function () {
  'use strict';

  angular
    .module('users')
    .controller('SettingsController', SettingsController);

  SettingsController.$inject = ['$scope', 'Authentication'];

  function SettingsController($scope, Authentication) {
    var vm = this;

    vm.user = Authentication.user;
  }
}());

(function () {
  'use strict';

  angular
    .module('users')
    .directive('passwordValidator', passwordValidator);

  passwordValidator.$inject = ['PasswordValidator'];

  function passwordValidator(PasswordValidator) {
    var directive = {
      require: 'ngModel',
      link: link
    };

    return directive;

    function link(scope, element, attrs, ngModel) {
      ngModel.$validators.requirements = function (password) {
        var status = true;
        if (password) {
          var result = PasswordValidator.getResult(password);
          var requirementsIdx = 0;

          // Requirements Meter - visual indicator for users
          var requirementsMeter = [{
            color: 'danger',
            progress: '20'
          }, {
            color: 'warning',
            progress: '40'
          }, {
            color: 'info',
            progress: '60'
          }, {
            color: 'primary',
            progress: '80'
          }, {
            color: 'success',
            progress: '100'
          }];

          if (result.errors.length < requirementsMeter.length) {
            requirementsIdx = requirementsMeter.length - result.errors.length - 1;
          }

          scope.requirementsColor = requirementsMeter[requirementsIdx].color;
          scope.requirementsProgress = requirementsMeter[requirementsIdx].progress;

          if (result.errors.length) {
            scope.getPopoverMsg = PasswordValidator.getPopoverMsg();
            scope.passwordErrors = result.errors;
            status = false;
          } else {
            scope.getPopoverMsg = '';
            scope.passwordErrors = [];
            status = true;
          }
        }
        return status;
      };
    }
  }
}());

(function () {
  'use strict';

  angular
    .module('users')
    .directive('passwordVerify', passwordVerify);

  function passwordVerify() {
    var directive = {
      require: 'ngModel',
      scope: {
        passwordVerify: '='
      },
      link: link
    };

    return directive;

    function link(scope, element, attrs, ngModel) {
      var status = true;
      scope.$watch(function () {
        var combined;
        if (scope.passwordVerify || ngModel) {
          combined = scope.passwordVerify + '_' + ngModel;
        }
        return combined;
      }, function (value) {
        if (value) {
          ngModel.$validators.passwordVerify = function (password) {
            var origin = scope.passwordVerify;
            return (origin === password);
          };
        }
      });
    }
  }
}());

(function () {
  'use strict';

  // Users directive used to force lowercase input
  angular
    .module('users')
    .directive('lowercase', lowercase);

  function lowercase() {
    var directive = {
      require: 'ngModel',
      link: link
    };

    return directive;

    function link(scope, element, attrs, modelCtrl) {
      modelCtrl.$parsers.push(function (input) {
        return input ? input.toLowerCase() : '';
      });
      element.css('text-transform', 'lowercase');
    }
  }
}());

(function () {
  'use strict';

  // Authentication service for user variables

  angular
    .module('users.services')
    .factory('Authentication', Authentication);

  Authentication.$inject = ['$window'];

  function Authentication($window) {
    var auth = {
      user: $window.user
    };

    return auth;
  }
}());

(function () {
  'use strict';

  // PasswordValidator service used for testing the password strength
  angular
    .module('users.services')
    .factory('PasswordValidator', PasswordValidator);

  PasswordValidator.$inject = ['$window'];

  function PasswordValidator($window) {
    var owaspPasswordStrengthTest = $window.owaspPasswordStrengthTest;

    var service = {
      getResult: getResult,
      getPopoverMsg: getPopoverMsg
    };

    return service;

    function getResult(password) {
      var result = owaspPasswordStrengthTest.test(password);
      return result;
    }

    function getPopoverMsg() {
      var popoverMsg = 'Six or more characters.';

      return popoverMsg;
    }
  }

}());

(function () {
  'use strict';

  // Users service used for communicating with the users REST endpoint
  angular
    .module('users.services')
    .factory('UsersService', UsersService);

  UsersService.$inject = ['$resource'];

  function UsersService($resource) {
    return $resource('api/users', {}, {
      update: {
        method: 'PUT'
      }
    });
  }

  // TODO this should be Users service
  angular
    .module('users.admin.services')
    .factory('AdminService', AdminService);

  AdminService.$inject = ['$resource'];

  function AdminService($resource) {
    return $resource('api/users/:userId', {
      userId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());

(function () {
  'use strict';

  angular
    .module ('videoWorks')
    .directive("videoWork", videoWork)
    .directive ("viewVideoWork", viewVideoWork);

  videoWork.$inject = ['$rootScope', '$http', '$timeout', '$mdDialog', '$mdMedia',
                       '$mdToast', '$sce', 'VideoWorks', 'PhotoWorks', 'VideoCoverImage', 'Upload'];
  viewVideoWork.$inject = ['$rootScope', '$http', '$timeout', '$mdDialog',
                           '$mdMedia', '$mdToast', '$sce', 'VideoWorks', 'PhotoWorks', 'VideoCoverImage',
                           'Upload'];

  function viewVideoWork ($rootScope, $http, $timeout, $mdDialog, $mdMedia,
                          $mdToast, $sce, VideoWorks, PhotoWorks, VideoCoverImage, Upload) {
    var directive = {
      restrict: 'E',
      scope: {
        work: '='
      },
      link: function (scope) {

      },
      templateUrl: 'modules/video-works/client/views/view-video-work.html'
    };

    return directive;
  }

  function videoWork ($rootScope, $http, $timeout, $mdDialog, $mdMedia,
                      $mdToast, $sce, VideoWorks, PhotoWorks, VideoCoverImage, Upload) {
    var directive = {
      restrict: 'E',
      scope: {
        work: '='
      },
      link: function (scope, elem, attr) {

        scope.customFullscreen = $mdMedia('xs') || $mdMedia ('sm');
        scope.coverImageUrl = scope.work.coverImageUrl;
        scope.showVideoWork = function (ev) {
          console.log ('showVideoWork()');

          var useFullScreen = ($mdMedia ('sm') || $mdMedia ('xs'))
                              && scope.customFullscreen;
          $rootScope.currentWork = scope.work;
          $mdDialog.show ({
            controller: ["scope", "$mdDialog", "$sce", "work", function (scope, $mdDialog, $sce, work) {

              console.log ('dialog controller');

              console.log ('work is: ', work);
              scope.workTitle = work.title;
              scope.workInfo = work.workInfo;
              scope.directors = work.directedBy;
              scope.editors = work.editedBy;
              scope.cast = work.cast;
              scope.copyright = work.copyright;

              // thanks to
              // http://stackoverflow.com/a/23945027
              function extractDomain(url) {
                var domain;
                //find & remove protocol (http, ftp, etc.) and get domain
                if (url.indexOf("://") > -1) {
                  domain = url.split('/')[2];
                }
                else {
                  domain = url.split('/')[0];
                }

                //find & remove port number
                domain = domain.split(':')[0];

                return domain;
              }

              var domain = extractDomain (work.videoUrl);

              console.log ("domain is: ", domain);

              if (domain === 'youtube.com' ||
                  domain === 'www.youtube.com') {

                console.log ('youtube domain');
                scope.domain = 'youtube';
                var videoUrl = work.videoUrl.replace ("watch?v=", "embed/");
                scope.videoUrl = $sce.trustAsResourceUrl (videoUrl);
                console.log ("work.videoUrl: ", work.videoUrl);
                console.log("scope.videoUrl: ", scope.videoUrl);
              }

              if (domain === 'vimeo.com' ||
                  domain === 'www.vimeo.com') {
                //player.vimeo.com/video/175738725
                console.log ('vimeo domain');
                var vimeoId = work.videoUrl.substring (
                                  work.videoUrl.lastIndexOf('/') + 1);
                var videoUrl = '//player.vimeo.com/video/' + vimeoId;
                scope.videoUrl = $sce.trustAsResourceUrl (videoUrl);
                console.log ("vimeo id:", vimeoId);
                scope.domain = 'vimeo';

                scope.vimeoId = vimeoId;
              }

              if (domain === 'facebook.com' ||
                  domain === 'www.facebook.com') {
                scope.videoUrl = 'https://www.facebook.com/plugins/video.php?href=' + work.videoUrl;
                scope.videoUrl = $sce.trustAsResourceUrl (scope.videoUrl);
                scope.domain = 'facebook';
                console.log ('work.videoUrl: ', work.videoUrl);
                console.log ('scope.videoUrl: ', scope.videoUrl);

              }

              $rootScope.hide = function () {
                $mdDialog.hide();
              };

              scope.cancel = function () {
                $mdDialog.cancel();
              };

              $rootScope.answer = function (answer) {
                $mdDialog.hide (answer);
              }
            }],
            locals: {
              work: scope.work
            },
            templateUrl: 'modules/video-works/client/views/view-video-work.html',
            parent: angular.element (document.body),
            targetEvent: ev,
            autoWrap: false,
            clickOutsideToClose: true,
            fullscreen: useFullScreen
          });
        };

        scope.deleteVideoWork = function (work) {
          console.log ('deleteVideoWork()');
          VideoWorks.deleteVideoWork (work);
        };

        scope.editVideoWork = function () {
          console.log ('editVideoWork()');

          scope.castModel = [];
          scope.directorsModel = [];
          scope.editorsModel = [];
          scope.editors = scope.work.editedBy;
          scope.directors = scope.work.directedBy;
          scope.cast = scope.work.cast;

          console.log("scope.work is: ", scope.work);

          // iterate through the currently set models for the photo work
          for (var i = 0; i < scope.work.cast.length; ++i) {
            console.log('work.cast[i]: ', scope.work.cast[i]);

            // push each cast member onto the data model for              // this for loop might be unnecessary
            // cast input on video work
            scope.castModel.push({name: 'cast_' + i});
            scope.castNumber = i;
          }

          // iterate through the currently set models for the photo work
          for (var i = 0; i < scope.work.directedBy.length; ++i) {
            console.log('work.directors[i]: ', scope.work.directedBy[i]);

            // push each director onto the data model for              // this for loop might be unnecessary
            // directors input on video work
            scope.directorsModel.push({name: 'director_' + i});
            scope.directorNumber = i;
          }

          // iterate through the currently set models for the photo work
          for (var i = 0; i < scope.work.editedBy.length; ++i) {
            console.log('work.editors[i]: ', scope.work.editedBy[i]);

            // push each editor onto the data model for              // this for loop might be unnecessary
            // editors input on vide work
            scope.editorsModel.push({name: 'editor_' + i});
            scope.editorNumber = i;
          }

          $mdDialog.show ({
            locals: {
              work: scope.work,
              cast: scope.castMembers,
              editors: scope.editors,
              directors: scope.directors,
              castModel: scope.castModel,
              directorsModel: scope.directorsModel,
              editorsModel: scope.editorsModel,
              coverImageUrl: scope.coverImageUrl
            },
            controller: ["$scope", "$rootScope", "$mdDialog", "$mdToast", "work", "cast", "editors", "directors", "castModel", "editorsModel", "directorsModel", "coverImageUrl", function ($scope, $rootScope, $mdDialog, $mdToast,
                                  work, cast, editors, directors,
                                  castModel, editorsModel, directorsModel, coverImageUrl) {
              var last = {
                bottom: false,
                top: true,
                left: false,
                right: true
              };
              $scope.toastPosition = angular.extend({},last);
              $scope.getToastPosition = function() {
                sanitizePosition();
                return Object.keys($scope.toastPosition)
                  .filter(function(pos) { return $scope.toastPosition[pos]; })
                  .join(' ');
              };
              function sanitizePosition() {
                var current = $scope.toastPosition;
                if ( current.bottom && last.top ) current.top = false;
                if ( current.top && last.bottom ) current.bottom = false;
                if ( current.right && last.left ) current.left = false;
                if ( current.left && last.right ) current.right = false;
                last = angular.extend({},current);
              }
              $scope.showSimpleToast = function(error) {
                var pinTo = $scope.getToastPosition();
                if (error === 'images') {
                  $mdToast.show(
                    $mdToast.simple()
                      .textContent('Please add at least one image.')
                      .position(pinTo )
                      .hideDelay(3000)
                  );
                } else {
                  if (error === 'title') {
                    $mdToast.show (
                      $mdToast.simple()
                        .textContent ('Another work with that title already exists.')
                        .position (pinTo)
                        .hideDelay (3000)
                    );
                  } else {
                    if (error === 'video-image') {
                      $mdToast.show(
                        $mdToast.simple()
                          .textContent('Please add a cover image.')
                          .position(pinTo )
                          .hideDelay(3000)
                      );
                    } else {
                      if (error === 'missing-title') {
                        $mdToast.show(
                          $mdToast.simple()
                            .textContent('Please add a title.')
                            .position(pinTo )
                            .hideDelay(3000)
                        );
                      } else {
                        if (error === 'video-url') {
                          $mdToast.show(
                            $mdToast.simple()
                              .textContent('Please add a video URL.')
                              .position(pinTo )
                              .hideDelay(3000)
                          );
                        }
                      }
                    }
                  }
                }
              };

              $scope.work = work;
              $scope.cast = work.cast;
              $scope.editors = work.editedBy;
              $scope.directors = work.directedBy;
              $scope.castModel = castModel;
              $scope.editorsModel = editorsModel;
              $scope.directorsModel = directorsModel;
              $scope.bwUploading = {
                visibility: 'hidden'
              };


              var oldWorkTitle = work.title;
              console.log('oldWorkTitle: ', oldWorkTitle);
              var oldCast = work.cast;
              console.log("oldCast: ", oldCast);
              var oldVideoUrl = work.videoUrl;
              var oldEditors = work.editedBy;
              var oldDirectors = work.directedBy;
              var oldCopyright = work.copyright;
              var oldWorkInfo = work.workInfo;
              var oldCastModel = castModel;
              var oldEditorsModel = editorsModel;
              var oldDirectorsModel = directorsModel;

              $scope.cancelEdit = function () {
                console.log("oldWorkTitle: ", oldWorkTitle);
                console.log("oldCast: ", oldCast);
                console.log ('$scope.cast: ', $scope.cast);
                console.log ("$scope.directors: ", $scope.directors);
                console.log ("$scope.editors: ", $scope.editors);
                work.title = oldWorkTitle;
                work.cast = $scope.cast;
                work.editedBy = $scope.editors;
                work.directedBy = $scope.directors;
                work.videoUrl = oldVideoUrl;
                work.copyright = oldCopyright;
                work.workInfo = oldWorkInfo;
                $scope.castModel = oldCastModel;
                $scope.directorsModel = oldDirectorsModel;
                $scope.editorsModel = oldEditorsModel;
                $mdDialog.cancel();
              };

              $scope.selectedCoverImage = function (file) {
                VideoCoverImage.addImage (file);
              };

              $scope.submitEditedWork = function () {
                console.log ('work.title: ', work.title);
                console.log ('work.editedBy: ', work.editedBy);
                console.log ('work.directedBy: ', work.directedBy);
                console.log ('work.cast: ', work.cast);
                console.log ('work.copyright: ', work.copyright);
                console.log ('work.videoUrl: ', work.videoUrl);
                console.log ('work.workInfo: ', work.workInfo);
                console.log ('work.coverImageUrl: ', work.coverImageUrl);

                for (var i = 0; i < work.directedBy.length; ++i) {
                  if (work.directedBy[i] === '' || work.directedBy[i].match(/^\s*$/)) {
                    work.directedBy.splice(i, 1);
                    i = 0;
                  }
                }

                for (var i = 0; i < work.editedBy.length; ++i) {
                  if (work.editedBy[i] === '' || work.editedBy[i].match(/^\s*$/)) {
                    work.editedBy.splice(i, 1);
                    i = 0;
                  }
                }

                for (var i = 0; i < work.cast.length; ++i) {
                  if (work.cast[i] === '' || work.cast[i].match(/^\s*$/)) {
                    work.cast.splice(i, 1);
                    i = 0;
                  }
                }


                if (angular.equals([], $rootScope.videoCoverImage)){
                  console.log('Must add at least one image');
                  $scope.showSimpleToast('video-image');
                  return;
                } else {

                  if (work.title === '') {
                    $scope.showSimpleToast ('missing-title');
                    return;
                  } else {
                    // check if the entered work title already exists
                    // (another work with the same name already exists).
                    for (var i = 0; i < PhotoWorks.photoWorks.length; ++i) {
                      if (PhotoWorks.photoWorks[i].title === $scope.photoWorkTitle) {
                        $scope.showSimpleToast('title');
                        return;
                      }
                    }
                    for (var i = 0; i < VideoWorks.videoWorks.length; ++i) {
                      if (VideoWorks.videoWorks[i].title === $scope.photoWorkTitle) {
                        $scope.showSimpleToast('title');
                        return;
                      }
                    }

                    if (work.videoUrl === '') {
                      $scope.showSimpleToast ('video-url');
                      return;
                    }
                  }

                }

                if (VideoCoverImage.image.length !== 0) {
                  $scope.bwUploading.visibility = 'visible';
                  // new cover image selected
                  console.log('VideoCoverImage: ', VideoCoverImage.image);
                  Upload.upload({
                    url: '/api/video_works/edit_video_work',
                    arrayKey: '',
                    data: {
                      file: VideoCoverImage.image[0],
                      work: JSON.stringify (work)
                    }
                  }).then (function (resp) {
                    console.log ("Success: ", resp);
                    var edit = resp.data;
                    console.log ('resp.data: ', edit);
                    VideoWorks.addEdit (edit);
                    work = edit;
                    coverImageUrl = edit.coverImageUrl;
                    $scope.uploadProgress = 0;
                    $scope.bwUploading.visibility = 'hidden';
                    VideoCoverImage.image = [];
                    $mdDialog.hide ();
                    (function(d, s, id) {
                      var js, fjs = d.getElementsByTagName(s)[0];
                      if (d.getElementById(id)) return;
                      js = d.createElement(s); js.id = id;
                      js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.7";
                      fjs.parentNode.insertBefore(js, fjs);
                    }(document, 'script', 'facebook-jssdk'));
                  }, function (resp) {
                    console.log ("resp.status: ", resp.status);
                  }, function (evt) {
                    console.log ("evt: ", evt);
                    $scope.uploadProgress = (evt.loaded / evt.total) * 100;
                  });
                } else {

                  // no new cover image selected
                  Upload.upload ({
                    url: '/api/video_works/edit_video_work',
                    arrayKey: '',
                    data: {
                      file: {},
                      work: JSON.stringify (work)
                    }
                  }).then (function (resp) {
                    console.log ("Success: ", resp);
                    var edit = resp.data;
                    console.log ('resp.data: ', edit);
                    VideoWorks.addEdit (edit);
                    work = edit;
                    coverImageUrl = edit.coverImageUrl;
                    $mdDialog.hide ();
                    (function(d, s, id) {
                      var js, fjs = d.getElementsByTagName(s)[0];
                      if (d.getElementById(id)) return;
                      js = d.createElement(s); js.id = id;
                      js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.7";
                      fjs.parentNode.insertBefore(js, fjs);
                    }(document, 'script', 'facebook-jssdk'));
                  }, function (resp) {
                    console.log ("resp.status: ", resp.status);
                  }, function (evt) {
                    console.log ("evt: ", evt);
                  });
                }

              };

            }],
            clickOutsideToClose: true,
            templateUrl: 'modules/bw-interface/client/views/edit-video-work.html'
          });
        };
      },
      templateUrl: 'modules/video-works/client/views/video-work.html'
    };

    return directive;
  }

}());

(function() {
  'use strict';

  angular
    .module ('videoWorks')
    .service ('VideoWorks', VideoWorks);

  VideoWorks.$inject = ['$rootScope', '$http'];

  function VideoWorks ($rootScope, $http) {
    var service = {
      videoWorks: [],

      addVideoWork: function (work) {
        service.videoWorks.push (work);
        $rootScope.$broadcast ( 'videoWorks.update' );
      },

      deleteVideoWork: function (work) {
        $http.delete ('/api/video_works/delete_video_work', {params: {data: work}})
          .then (function (resp) {
            if (resp.status === 200) {
              for (var i = 0; i < service.videoWorks.length; ++i) {
                if (service.videoWorks[i]._id === work._id) {
                  service.videoWorks.splice (i, 1);
                }
              }
              $rootScope.$broadcast ( 'videoWorks.update' )
            }
          });
      },

      getVideoWorks: function () {
        $http.get ('/api/video_works/get_video_works')
          .then (function (resp) {
            console.log ('response is: ', resp);
            service.videoWorks = resp.data;
            $rootScope.$broadcast ( 'videoWorks.update' );
        });
      },

      addEdit: function (edit) {
        for (var i = 0; i < service.videoWorks.length; ++i) {
          if (edit._id === service.videoWorks[i]._id) {
            service.videoWorks[i] = edit;
            $rootScope.$broadcast ( 'videoWorks.update' );
          }
        }
      }

    };

    return service;
  }

}());

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

(function () {
  'use strict';

  angular
    .module ('works')
    .directive ('worksGridItem', worksGridItem);

  worksGridItem.$inject = ['$rootScope', '$state', '$http', '$window', '$mdDialog', '$mdToast'];

  function worksGridItem ($rootScope, $state, $http, $window, $mdDialog, $mdToast) {
    var directive = {
      restrict: 'E',
      scope: {
        work: '='
      },
      link: function (scope, elem, attr, $window) {
        $(elem).hoverdir({
          hoverDelay: 100,
          hoverElem: '.hover-el'

        });


        scope.mouseAction = function (event) {
          // console.log ('mouseenter mouseleave');
          // elem[0]
          //var hoverItem = event.toElement.parentElement.children[1];
          // console.log ('hoverItem: ', hoverItem);
          //var hoverItem = elem[0].
        };

        scope.enter = function (event) {
          console.log ('event is: ', event);
        };

        scope.leave = function (event) {
          console.log ('event is: ', event);
        };


        scope.viewWork = function (event) {
          console.log ('viewWork');
          if (scope.work.videoUrl) {
            var body =  $('section');

            console.log ('body: ', body);
            body.css ('overflow', 'hidden');
            $mdDialog.show ({
              controller: ["scope", "event", "$mdDialog", "$sce", "work", function (scope, event, $mdDialog, $sce, work) {

                console.log ('dialog controller');
                console.log ("work is: ", work);
                scope.workTitle = work.title;
                scope.cast = work.cast;
                scope.joinedCast = scope.cast.join (', ');
                scope.directors = work.directedBy;
                scope.postInfo = work.workInfo;
                scope.editors = work.editedBy;
                scope.copyright = work.copyright;

                // thanks to
                // http://stackoverflow.com/a/23945027
                function extractDomain(url) {
                  var domain;
                  //find & remove protocol (http, ftp, etc.) and get domain
                  if (url.indexOf("://") > -1) {
                    domain = url.split('/')[2];
                  }
                  else {
                    domain = url.split('/')[0];
                  }

                  //find & remove port number
                  domain = domain.split(':')[0];

                  return domain;
                }

                var domain = extractDomain (work.videoUrl);

                console.log ("domain is: ", domain);

                if (domain === 'youtube.com' ||
                  domain === 'www.youtube.com') {

                  console.log ('youtube domain');
                  scope.domain = 'youtube';
                  var videoUrl = work.videoUrl.replace ("watch?v=", "embed/");
                  scope.videoUrl = $sce.trustAsResourceUrl (videoUrl);
                  console.log ("work.videoUrl: ", work.videoUrl);
                  console.log("scope.videoUrl: ", scope.videoUrl);
                }

                if (domain === 'vimeo.com' ||
                  domain === 'www.vimeo.com') {
                  //player.vimeo.com/video/175738725
                  console.log ('vimeo domain');
                  var vimeoId = work.videoUrl.substring (
                    work.videoUrl.lastIndexOf('/') + 1);
                  var videoUrl = '//player.vimeo.com/video/' + vimeoId;
                  scope.videoUrl = $sce.trustAsResourceUrl (videoUrl);
                  console.log ("vimeo id:", vimeoId);
                  scope.domain = 'vimeo';

                  scope.vimeoId = vimeoId;
                }

                if (domain === 'facebook.com' ||
                    domain === 'www.facebook.com') {
                  scope.videoUrl = 'https://www.facebook.com/plugins/video.php?href=' + work.videoUrl;
                  scope.videoUrl = $sce.trustAsResourceUrl (scope.videoUrl);
                  scope.domain = 'facebook';
                }

                $rootScope.hide = function () {
                  $mdDialog.hide();
                };

                scope.cancel = function () {
                  $mdDialog.cancel();
                };

                $rootScope.answer = function (answer) {
                  $mdDialog.hide (answer);
                }
              }],
              locals: {
                work: scope.work,
                event: event
              },
              templateUrl: 'modules/works/client/views/view-video.html',
              parent: angular.element (document.body),
              targetEvent: event,
              onRemoving: function () {
                body.css('overflow', 'auto');
              },
              autoWrap: false,
              clickOutsideToClose: true,
              closeTo: elem,
              fullscreen: false
            });
          } else {
            $mdDialog.show ({
              controller: ["scope", "event", "$mdDialog", "$sce", "work", function (scope, event, $mdDialog, $sce, work) {

                scope.currentIndex = 0;
                console.log('dialog controller');
                console.log("work is: ", work);
                scope.workTitle = work.title;
                scope.images = work.images;


                scope.next = function (event) {
                  console.log ("next()");
                  scope.currentIndex + 1 === scope.images.length ? scope.currentIndex = 0 : scope.currentIndex++;
                };

                scope.prev = function (event) {
                  console.log ('prev()');
                  scope.currentIndex - 1 === -1 ? scope.currentIndex = scope.images.length - 1 : scope.currentIndex--;
                };

                $rootScope.hide = function () {
                  $mdDialog.hide();
                };

                scope.cancel = function () {
                  $mdDialog.cancel();
                };

                $rootScope.answer = function (answer) {
                  $mdDialog.hide(answer);
                }
              }],
              locals: {
                work: scope.work,
                event: event,
                element: elem
              },
              templateUrl: 'modules/works/client/views/view-photos.html',
              parent: angular.element(document.body),
              targetEvent: event,
              onRemoving: function () {
              },
              autoWrap: false,
              clickOutsideToClose: true,
              closeTo: elem,
              fullscreen: false
            });
          }

        };
        /*
        this.$el.on ('mouseenter.hoverdir, mouseleave.hoverdir', function (event) {
          var $el = $(this),
            $hoverElem = $el.find ('grid-list-item'),
            direction = self._getDir ($el, { x: event.pageX, y: event.pageY }),
            styleCSS = self._getStyle (direction);
          console.log ('mouseenter mouseleave');
        }); */
      },
      templateUrl: 'modules/works/client/views/works-grid-item.html'
    };

    return directive;
  }

}());

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

(function () {
  'use strict';

  angular
    .module('works')
    .service('Works', Works);

  Works.$inject = ['$rootScope', '$http'];

  function Works ($rootScope, $http) {
    var service = {

      getWorks: function () {
        $http.get ('/api/works/get_all_works')
          .then (function (resp) {
            console.log("response is: ", resp);
            service.works = resp.data;
            console.log("service.works is: ", service.works);
            console.log ("typeof service.works is: ", Object.prototype.toString.call(service.works) == '[object Array]');
            $rootScope.$broadcast ( 'works.update' );
          });
      }
    };

    return service;
  }
}());
