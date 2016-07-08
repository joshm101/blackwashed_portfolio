'use strict';

var validator = require('validator'),
    multiparty = require('multiparty'),
    uuid = require('uuid'),
    fs = require ('fs'),
    path = require ('path'),
    mongoose = require('mongoose'),
    CyclerImages = mongoose.model('CyclerImages');

exports.uploadCyclerImage = function (req, res) {
  console.log('ok');
  var form = new multiparty.Form();
  form.parse(req, function (err, fields, files) {

    console.log('files JSON: ' + JSON.stringify(files.file[0]));

    var file = files.file[0];
    var contentType = file.headers['content-type'];
    var extension = file.path.substring(file.path.lastIndexOf('.'));
    var destPath = '../../../images/server/images/cycler_images/' + uuid.v4() + extension;
    var oldPath = files.file[0].path;

    var content;

    var resolvedPath = path.resolve(process.cwd(), 'modules');
    resolvedPath = path.resolve(resolvedPath, 'images/server/images/cycler_images/');

    var destFile = uuid.v4() + extension;
    var fileToWrite = path.resolve(resolvedPath, destFile);
    var image = new CyclerImages ({ path: fileToWrite, owner: "josh" });
    image.save(function (err) {
      if (err) {
        console.log ("error: " + err);
      } else {
        console.log("successfully saved image to DB");
      }
    });
    console.log("image: ", image);
    console.log("fileToWrite: ", fileToWrite);
    fs.readFile(oldPath, function (err, data) {
      console.log(data);
      content = data;

      console.log(content);
      fs.writeFile(fileToWrite, data, function (err) {
        if (err) {
          console.log("error: " + err);
        } else {
          console.log("success!");
          CyclerImages.find({ path: fileToWrite}, function (err, images) {
            if (err) {
              console.log ("error: " + err);
            } else {
              console.log("result: " + images);
            }
          });
        }
      });
    });
  });

};
