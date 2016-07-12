'use strict';

var validator    =  require ('validator'),
    multiparty   =  require('multiparty'),
    uuid         =  require ('uuid'),
    fs           =  require ('fs'),
    path         =  require ('path'),
    mongoose     =  require ('mongoose'),
    VideoWorks   =  mongoose.model ('videoWorks');

exports.addVideoWork = function (req, res) {
  console.log('add video work');
};

exports.deleteVideoWork = function (req, res) {
  console.log('delete video work');
};

exports.editVideoWork = function (req, res) {
  console.log('edit video work');
};

exports.getVideoWorks = function (req, res) {
  console.log('get video works');
};
