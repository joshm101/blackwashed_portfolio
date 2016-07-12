'use strict';

var validator     = require('validator'),
    multiparty    = require('multiparty'),
    uuid          = require('uuid'),
    fs            = require ('fs'),
    path          = require ('path'),
    mongoose      = require('mongoose'),
    CyclerImages  = mongoose.model('CyclerImages');

exports.getCyclerImages = function (req, res) {
  console.log("okay getCyclerImages()");
  console.log('__dirname: ' + __dirname);

  console.log(path.resolve(__dirname + '/../../client/img/cycler_images'));

  var imagesPath = path.resolve(__dirname + '/../../client/img/cycler_images');

  console.log("imagesPath: " + imagesPath);

  // res.sendFile(imagesPath);

  CyclerImages.find({ owner: 'josh' }, function (err, images) {
    if (err) {
      console.log("error: " + err);
    } else {
      console.log("images: " + images);
      res.status(200).send(images);
      // res.send(200, images);
    }
  });

};

exports.deleteCyclerImage = function (req, res) {
  console.log("okay delete server-side");
  console.log(req.query);
  var imagePath = req.query.imagePath;
  CyclerImages.remove({ path: imagePath }, function (err, result) {
    if (err) {
      console.log("error: ", err);
    } else {
      console.log("result: " + result);
      fs.unlink(path.resolve(imagePath), function (err) {
        if (err) {
          console.log("file delete error: " + err);
        } else {
          console.log("successfully deleted image at " + imagePath);
        }
      });
    }
  });
  res.status(200).send();

};

exports.uploadCyclerImage = function (req, res) {
  console.log('ok');
  // CyclerImages.find({}).remove().exec();
  var form = new multiparty.Form();
  form.parse(req, function (err, fields, files) {

    // console.log('files JSON: ' + JSON.stringify(files.file[0]));
    if (typeof files.file !== 'undefined'){
      // information about the uploaded image
      var file = files.file[0];
      var contentType = file.headers['content-type'];
      var extension = file.path.substring(file.path.lastIndexOf('.'));
      var destPath = '../../../images/server/images/cycler_images/' + uuid.v4() + extension;
      var oldPath = files.file[0].path;

      var content;

      // get the path to save the uploaded image
      var resolvedPath = path.resolve(process.cwd(), 'modules');
      resolvedPath = path.resolve(resolvedPath, 'bw-interface/client/img/cycler_images/');
      resolvedPath = 'modules/images/client/img/cycler_images/';

      var destFile = uuid.v4() + extension;
      var fileToWrite = resolvedPath + destFile;


      // create new image in the mongoose model
      var image = new CyclerImages ({ path: fileToWrite, owner: "josh" });

      console.log("image is: " + image);
      // save the image in the mongoose model DB
      image.save(function (err) {
        if (err) {
          console.log ("error: " + err);
        } else {
          console.log("successfully saved image to DB");
        }
      });
      console.log("image: ", image);
      var imageObject = {
        _id: image._id,
        owner: image.owner,
        path: image.path
      };

      console.log("imageObject: " + JSON.stringify(imageObject));
      console.log("fileToWrite: ", fileToWrite);

      // write the image to the server's file system by
      // reading the uploaded image from the temporary location
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
            res.status(200).send(imageObject);
          }
        });
      });
    }
  });

};
