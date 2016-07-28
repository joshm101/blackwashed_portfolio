'use strict';

var validator     = require('validator'),
    multiparty    = require('multiparty'),
    uuid          = require('uuid'),
    fs            = require ('fs'),
    util          = require ('util'),
    path          = require ('path'),
    mongoose      = require('mongoose'),
    ncp           =  require ('ncp').ncp,
    PhotoWorks    =  mongoose.model ('photoWorks'),
    VideoWorks    =  mongoose.model ('videoWorks'),
    Works         =  mongoose.model ('works');

ncp.limit = 16;

exports.getAllWorks = function (req, res) {
  Works.find().sort ( {created: -1}).exec(function (err, works) {
    if (err) {
      console.log ("could not find anything in Works DB ", err);
    } else {
      var finalWorks = [];
      syncGet (works, finalWorks);
    }

    function syncGet (works, finalWorks) {
      console.log ("works.length: ", works.length);
      console.log ("finalWorks: ", util.inspect (finalWorks));
      if (works.length === 0) {
        return res.status (200).send (finalWorks);
      } else {
        var currentWork = works.pop();
        var id = currentWork.work_id;
        if (currentWork.work_type === 'photo') {
          PhotoWorks.find ( {_id: id}, function (err, work) {
            console.log ("photo work found: ", work);
            work[0].work_type = 'photo';
            finalWorks.push (work[0]);
            syncGet (works, finalWorks);
          });
        } else {
          if (currentWork.work_type === 'video') {
            VideoWorks.find ( {_id:  id}, function (err, work) {
              work[0].work_type = 'video';
              finalWorks.push (work[0]);
              syncGet (works, finalWorks);
            });
          }
        }
      }
    }
  });
};
