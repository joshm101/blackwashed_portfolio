(function () {
  'use strict';

  angular
    .module('core')
    .controller('HomeController', HomeController);
  HomeController.$inject = ['$scope', '$rootScope', '$state', 'Upload',
                            '$mdDialog', '$mdToast', '$http', 'AboutPageService'];

  function HomeController($scope, $rootScope, $state, Upload, $mdDialog, $mdToast, $http, AboutPageService, $ngAnimate) {
    var vm = this;
    $scope.show = false;
    $scope.contact = function (ev) {
      console.log ("scope.contact");
      $mdDialog.show({
        controller: function (scope) {
          scope.message = '';
          scope.subject = '';
          scope.senderEmail = '';
          scope.senderName = '';
          scope.senderPhoneNumber = '';

          scope.sendEmail = function () {
            console.log ('message is: ', scope.message);
            console.log ('subject is: ', scope.subject);
            console.log ('senderEmail is: ', scope.senderEmail);
            console.log ('senderPhoneNumber is: ', scope.senderPhoneNumber);
            console.log ('senderName is: ', scope.senderName);
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
        },
        templateUrl: 'modules/core/client/views/contact-form.html',
        parent: angular.element(document.body),
        clickOutsideToClose: false,
        fullscreen: false,
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
}());
