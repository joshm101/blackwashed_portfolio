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
  var form = new multiparty.Form();

  // parse the request (req) which contains
  // the submitted work's title, model(s),
  // copyright information as well as the
  // pictures.
  form.parse(req, function (err, fields, files) {
    var theFiles = files.file;
    console.log("the files: " + theFiles);
    if (typeof files !== 'undefined') {
      var models = fields['models'];

      console.log("models is: " + models);

      // build absolute path where images
      // will be written to
      var modulesPath = path.resolve(process.cwd(), 'modules');
      var imagesPath = path.resolve(modulesPath, 'images/client/img/photo_works');
      var workTitle = fields.workTitle[0];
      var copyright = fields.copyright[0];
      var workImagesPath = path.resolve (imagesPath, workTitle);

      console.log('workImagesPath: ' + workImagesPath);

      var imagesWritten = [];

      // create the directory for the submitted photo work.
      // the directory is named according to the photo work's title.
      fs.mkdir (workImagesPath, function (err) {
        if (err) {

          // a possible error is that the directory (project)
          // already exists.
          console.log("error: " + err);
        } else {
          console.log("successfully created the images directory");
          // once the directory has been created, enter the recursive
          // function syncWrites to write the images to workImagesPath
          syncWrites(theFiles, workImagesPath, workTitle, models, copyright);
        }
      });
    }
  });

  var imagesWritten = [];

  /**
   * Recursive function used to synchronize
   * file writes. We only want to write to the DB
   * once we know that all files have been written
   * successfully.
   *
   * Each iteration of recursion, a file to write
   * is popped from the array filesToWrite.
   *
   * End of recursion: if we have popped all files
   * from the array, we are done writing files.
   *
   *
   * @param filesToWrite
   * @param workingPath
   * @param workTitle
   * @param models
   * @param copyright
   *
   **/

  function syncWrites(filesToWrite, workingPath, workTitle, models, copyright) {
    var currentFile = filesToWrite.pop();
    var oldPath = currentFile.path;
    var fileExtension = currentFile.path.substring(currentFile.path.lastIndexOf('.'));
    console.log("file Extension is: " + fileExtension);
    var destFile = uuid.v4() + fileExtension;
    var fullDestFile = workingPath + '/' + destFile;

    // read the file to get the image's data and
    // use that data to write to the destination
    // directory.
    fs.readFile(oldPath, function (err, data) {
      if (err) {
        console.log("error reading file: " + err);
      } else {
        fs.writeFile(fullDestFile, data, function (err) {
          if (err) {
            console.log("error writing file: " + err);
          } else {
            console.log("successfully wrote image file");

            // get the relative path of the written image because
            // <img src = " "> will need the relative path to display
            // the image, not absolute.
            var writtenRelativePath = 'modules/images/client/img/photo_works/' +
                                      workTitle + '/' + destFile;
            imagesWritten.push(writtenRelativePath);
            if (filesToWrite.length > 0) {
              console.log('another call');

              // the array filesToWrite is not empty,
              // so continue recursion
              syncWrites(filesToWrite, workingPath, workTitle, models, copyright);
            } else {
              console.log("imagesWritten: " + imagesWritten);
              console.log("workTitle: " + workTitle);
              console.log("models: " + models);
              console.log("copyright: " + copyright);

              // file array filesToWrite is empty,
              // all files have been written, create
              // DB entry.
              var work = new PhotoWorks( {title: workTitle,
                                          models: models,
                                          copyright: copyright,
                                          images: imagesWritten} );

              work.save (function (err) {
                if (err) {
                  console.log("error saving to DB: " + err);
                } else {
                  console.log("successfully saved work to DB!");
                  return res.status(200).send(work);
                }
              });
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

  // get and return all photo works.
  PhotoWorks.find({}, function (error, works) {
    if (error){
      console.log("error accessing photo works: " + error);
    } else {
      console.log("works: " + works);
      return res.status(200).send(works);
    }
  });
};
