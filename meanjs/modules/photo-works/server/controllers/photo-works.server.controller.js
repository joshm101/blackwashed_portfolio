'use strict';

var validator    =  require ('validator'),
    multiparty   =  require('multiparty'),
    uuid         =  require ('uuid'),
    fs           =  require ('fs'),
    path         =  require ('path'),
    mongoose     =  require ('mongoose'),
    PhotoWorks   =  mongoose.model('photoWorks');


exports.addPhotoWork = function (req, res) {
  console.log('add photo work');
};

exports.deletePhotoWork = function (req, res) {
  console.log('delete photo work');
};

exports.editPhotoWork = function (req, res) {
  console.log('edit photo work');
};

exports.getPhotoWorks = function (req, res) {
  console.log('get photo works');
};
