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
