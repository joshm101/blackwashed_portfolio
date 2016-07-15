'use strict';

var validator    =  require ('validator'),
    multiparty   =  require('multiparty'),
    uuid         =  require ('uuid'),
    fs           =  require ('fs'),
    path         =  require ('path'),
    util         =  require ('util'),
    mongoose     =  require ('mongoose'),
    PhotoWorks   =  mongoose.model('photoWorks');


exports.addPhotoWork = function (req, res) {
  console.log('add photo work');
  console.log('ayy');

  console.log("req.body: " + JSON.stringify(req.body));
  var form = new multiparty.Form();

  // parse the request (req) which contains
  // the submitted work's title, model(s),
  // copyright information as well as the
  // pictures.
  form.parse(req, function (err, fields, files) {
    console.log("files: " + JSON.stringify(files));
    console.log("typeof files: " + typeof files);
    console.log("typeof: " + typeof files.file);
    // console.log(files.file[1]);
    var theFiles = files.file;
    console.log("the files: " + theFiles);
    if (typeof files !== 'undefined') {
      // console.log("json fields: " + JSON.stringify(fields.copyright[0]));

      var models = fields['models'];

      console.log("models is: " + models);

      var modulesPath = path.resolve(process.cwd(), 'modules');
      var imagesPath = path.resolve(modulesPath, 'images/client/img/photo_works');
      console.log("fields.title: " + JSON.stringify(fields));
      console.log("imagesPath: " + imagesPath);

      console.log(util.inspect(fields, false, 2));
      var workTitle = fields.workTitle[0];
      var copyright = fields.copyright[0];

      console.log('fields.models: ' + fields['models']);

      // console.log(util.inspect(req, false, 2));


      console.log('copyright: ' + copyright);
      console.log("workTitle: " + workTitle);

      var workImagesPath = path.resolve (imagesPath, workTitle);

      console.log('workImagesPath: ' + workImagesPath);

      var imagesWritten = [];

      // create the directory for the submitted photo work.
      // the directory is named according to the photo work's title.
      fs.mkdir (workImagesPath, function (err) {
        if (err) {
          console.log("error: " + err);
        } else {
          console.log("successfully created the images directory!");
          syncWrites(theFiles, workImagesPath, workTitle, models, copyright);
          /*
          for (var i = 0; i < theFiles.length; ++i) {
            console.log(JSON.stringify(theFiles[i]));
            var currentFile = theFiles[i];
            var oldPath = currentFile.path;
            var fileExtension = currentFile.path.substring(currentFile.path.lastIndexOf('.'));
            console.log("fileExtension is: " + fileExtension);
            var destFile = workImagesPath + '/' + uuid.v4() + fileExtension;
            fs.readFile(oldPath, function (err, data) {
              if (err) {
                console.log("error: " + err);
              } else {
                fs.writeFile(destFile, data, function (err) {
                  if (err) {
                    console.log("write error: " + err);
                  } else {
                    console.log("i is: " + i);
                    console.log("successfully wrote imagee file");
                    imagesWritten.push(destFile);
                    console.log("destFile is: " + destFile);

                    // if we are done writing images to disk
                    if (i === theFiles.length - 1) {
                      // create the photo works entry.

                      console.log('all files written b/c i is: ' + i);
                    }
                  }
                });
              }
            })

          }*/
        }
      });

      var directoryPath = 'modules/images/client/img/photo_works/' +
                          workTitle;

      // iterate through each of the images passed in
      for (var property in files) {
        console.log("property: " + property);
        if (typeof files[property] !== 'undefined') {
          console.log(files[property]);

        }
      }
    }
  });

  var imagesWritten = [];

  function syncWrites(filesToWrite, workingPath, workTitle, models, copyright) {
    var currentFile = filesToWrite.pop();
    var oldPath = currentFile.path;
    var fileExtension = currentFile.path.substring(currentFile.path.lastIndexOf('.'));
    console.log("file Extension is: " + fileExtension);
    var destFile = uuid.v4() + fileExtension;
    var fullDestFile = workingPath + '/' + destFile;
    fs.readFile(oldPath, function (err, data) {
      if (err) {
        console.log("error is: " + err);
      } else {
        fs.writeFile(fullDestFile, data, function (err) {
          if (err) {
            console.log("error writing file: " + err);
          } else {
            console.log("successfully wrote image file");
            var writtenRelativePath = 'modules/images/client/img/photo_works/' +
                                      workTitle + '/' + destFile;
            imagesWritten.push(writtenRelativePath);
            if (filesToWrite.length > 0) {
              console.log('another call');
              syncWrites(filesToWrite, workingPath, workTitle, models, copyright);
            } else {
              console.log("we are done writing files");
              console.log("imagesWritten: " + imagesWritten);
              console.log("workTitle: " + workTitle);
              console.log("models: " + models);
              console.log("copyright: " + copyright);
              var work = new PhotoWorks( {title: workTitle,
                                          models: models,
                                          copyright: copyright,
                                          images: imagesWritten} );
              // console.log('work is: ' + work);
              work.save (function (err) {
                if (err) {
                  console.log("error saving to DB: " + err);
                } else {
                  console.log("successfully saved work to DB!");
                }
              });
              console.log(work);
            }
          }
        });
      }
    });
  }
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
