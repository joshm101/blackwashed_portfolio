(function () {
  'use strict';

  angular
    .module('core')
    .controller('HomeController', HomeController);
  HomeController.$inject = ['$scope', '$rootScope', '$state', 'Upload',
                            '$mdDialog', '$mdToast', '$http', 'AboutPageService'];

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
        controller: function (scope) {
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
        },
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
}());
