(function() {
  'use strict';

  angular
    .module ('videoWorks')
    .service ('VideoWorks', VideoWorks);

  VideoWorks.$inject = ['$rootScope', '$http'];

  function VideoWorks ($rootScope, $http) {
    var service = {
      videoWorks: [],

      getVideoWorks: function () {
        $http.get ('/api/video_works/get_video_works')
          .then (function (resp) {
            console.log ('response is: ', resp);
            service.videoWorks = resp.data;
            $rootScope.$broadcast ( 'videoWorks.update' );
        });
      }

    };

    return service;
  }

}());
