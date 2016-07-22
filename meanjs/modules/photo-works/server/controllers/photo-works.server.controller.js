'use strict';

var validator    =  require ('validator'),
    multiparty   =  require('multiparty'),
    uuid         =  require ('uuid'),
    fs           =  require ('fs'),
    rmdir        =  require ('rimraf'),
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
    var theFiles = files['file[file]'];

    console.log("files: ", util.inspect(theFiles));

    console.log("fields: " + util.inspect(fields));

    console.log("coverImages: ", fields['file[coverImage]']);

    // PhotoWorks.find({}).remove().exec();

    var coverImages = fields['file[coverImage]'];
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
          syncWrites(theFiles, workImagesPath, workTitle, models, copyright, coverImages, false, res);
        }
      });
    }
  });




};

var imagesWritten = [];
var coverImageUrl;
var editImagesToSave = [];


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

function syncWrites(filesToWrite, workingPath, workTitle, models, copyright, coverImages, edit, res) {
  var currentFile = filesToWrite.pop();
  var currentCover = coverImages.pop();
  var imageObject = {
    imageUrl: '',
    coverImage: currentCover
  };

  console.log("currentFile is: ", currentFile);

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
          imageObject.imageUrl = 'modules/images/client/img/photo_works/' +
            workTitle + '/' + destFile;
          console.log("current cover is: ", currentCover);
          if (currentCover === 'true') {
            console.log('current cover true');
            coverImageUrl = imageObject.imageUrl;
            console.log("coverImageUrl: ", coverImageUrl);
          }
          imagesWritten.push(imageObject);
          if (filesToWrite.length > 0) {
            console.log('another call');

            // the array filesToWrite is not empty,
            // so continue recursion
            syncWrites(filesToWrite, workingPath, workTitle, models, copyright, coverImages, edit, res);
          } else {
            if (edit === false) {
              console.log("imagesWritten: " + imagesWritten);
              console.log("workTitle: " + workTitle);
              console.log("models: " + models);
              console.log("copyright: " + copyright);
              console.log("coverImageUrl: ", coverImageUrl);

              // file array filesToWrite is empty,
              // all files have been written, create
              // DB entry.
              var work = new PhotoWorks( {title: workTitle,
                models: models,
                copyright: copyright,
                images: imagesWritten,
                coverImageUrl: coverImageUrl} );

              work.save (function (err) {
                if (err) {
                  console.log("error saving to DB: " + err);
                } else {
                  console.log("successfully saved work to DB!");
                  imagesWritten = [];
                  return res.status(200).send(work);
                }
              });
            } else {
              console.log("imagesWritten: " + imagesWritten);
              console.log("workTitle: " + workTitle);
              console.log("models: " + models);
              console.log("copyright: " + copyright);
              console.log("coverImageUrl: ", coverImageUrl);

              for (var i = 0; i < imagesWritten.length; ++i) {
                editImagesToSave.push (imagesWritten[i]);
              }

              PhotoWorks.findById (identifier, function (err, work) {
                if (err) {
                  console.log("error finding document: ", err);
                } else {
                  work.title = workTitle;
                  work.models = models;
                  work.copyright = copyright;
                  work.coverImageUrl = coverImageUrl;
                  work.images = editImagesToSave;
                  work.coverImageUrl = chosenCoverImage;
                  work.save (function (err) {
                    if (err) {
                      console.log("error saving edit to DB: ", err);
                    } else {
                      console.log ("successfully saved edit to DB");
                      chosenCoverImage = '';
                      editImagesToSave = [];
                      coverImageUrl = '';
                      imagesWritten = [];
                    }
                  });
                }
              });

            }
          }
        }
      });
    }
  });
}

function syncDeletes (filesToDelete) {
  var currentFile = filesToDelete.pop();
  var pathOfFile = path.resolve (process.cwd(), currentFile);

  fs.unlink (pathOfFile, function (err) {
    if (err) {
      console.log("error deleting file: ", err);
    } else {
      console.log ("successfully deleted image file: ", pathOfFile);

      if (filesToDelete.length > 0) {
        syncDeletes (filesToDelete);
      } else {
        console.log ("done deleting files");
      }
    }
  })
}

exports.deletePhotoWork = function (req, res) {
  console.log('delete photo work');
  console.log(typeof req.query.data);
  //var workToDelete = JSON.stringify (eval (req.query.data));
  var workToDelete = JSON.parse(req.query.data);
  console.log("workToDelete: ", workToDelete);
  var identifier = workToDelete._id;
  console.log("identifier: ", identifier);

  // check if the photo work exists first (it should).
  PhotoWorks.find( {_id: identifier}, function (err, work) {
    if (err) {
      console.log("error finding: ", err);
    } else {
      console.log("work found: ", work);
      var title = workToDelete.title;
      var workPathToDelete = path.resolve (process.cwd(), 'modules');
      workPathToDelete = path.resolve (workPathToDelete, 'images/client/img/photo_works');
      workPathToDelete = path.resolve (workPathToDelete, title);
      console.log("workPathToDelete: ", workPathToDelete);
      rmdir(workPathToDelete, fs, function (err) {
        if (err) {
          console.log("error deleting work folder: ", err);
        } else {
          PhotoWorks.remove( {_id: identifier}, function (err, result) {
            if (err) {
              console.log("error removing from DB: ", err);
            } else {
              console.log ("successfully removed photoWork " + title + " from DB!");
              return res.status(200).send();
            }
          });
        }
      });

    }
  });
  //console.log("workToDelete: ", workToDelete);

};

var identifier;
var serverImages;
var chosenCoverImage;

exports.editPhotoWork = function (req, res) {
  console.log('edit photo work');
  var form = new multiparty.Form();

  form.parse (req, function (err, fields, files) {
    console.log (util.inspect (files));
    console.log (util.inspect (fields));
    chosenCoverImage = fields['chosenCoverImage'][0];
    console.log("chosenCoverImage: ", chosenCoverImage);
    serverImages = fields['serverImages[imageUrl]'];
    console.log("serverImages: ", util.inspect (serverImages));
    if (typeof fields['imagesToDelete[imageUrl]'] !== 'undefined') {
      console.log ('images to delete');
      var imagesToDelete = fields['imagesToDelete[imageUrl]'];
      console.log("imagesToDelete: ", util.inspect (imagesToDelete));
      syncDeletes(imagesToDelete);
    }

    var serverImageObjects = [];
    for (var i = 0; i < serverImages.length; ++i) {
      console.log (util.inspect (fields['serverImages[coverImage]'][i]));
      var coverImageBool;
      if (fields['serverImages[coverImage]'][i] === 'true') {
        coverImageBool = true;
      } else {
        coverImageBool = false;
      }
      var serverImageObject = {
        imageUrl: serverImages[i],
        coverImage: coverImageBool
      };
      console.log("serverImageObject: ", util.inspect (serverImageObject));
      serverImageObjects.push (serverImageObject);
    }
    editImagesToSave = serverImageObjects;
    console.log("editImagesToSave before writes: ", util.inspect (editImagesToSave));

    // new images to write
    if (typeof fields['newImages[imageUrl]'] !== 'undefined') {
      console.log("okay");
      var newImages = [];
      for (var i = 0; i < fields['newImages[imageUrl]'].length; ++i) {
        console.log("fields: ", fields['newImages[imageUrl]'][i]);
        var newImage = {
          coverImage: fields['newImages[coverImage]'][i],
          imageUrl: fields['newImages[imageUrl]'][i]
        };
        console.log(newImage);
        newImages.push (newImage);

        console.log (util.inspect (newImages));
      }
      var theFiles = files ['file'];
      console.log("theFiles: ", util.inspect (theFiles));

      var modulesPath = path.resolve(process.cwd(), 'modules');
      var imagesPath = path.resolve(modulesPath, 'images/client/img/photo_works');
      var workTitle = fields['workTitle'][0];
      console.log("workTitle is: ", workTitle);
      var workImagesPath = path.resolve (imagesPath, workTitle);
      var coverImages = fields['newImages[coverImage]'];
      var models = fields['models'];
      var copyright = fields['copyright'];
      var edit = true;
      identifier = fields['identifier'];
      console.log("copyright: ", copyright);
      console.log ("models: ", models);
      console.log("workImagesPath: ", workImagesPath);
      console.log("coverImages: ", coverImages);
      console.log ('serverImages: ', util.inspect (serverImages));

      syncWrites (theFiles, workImagesPath, workTitle, models, copyright, coverImages, edit, res);



    } else {
      console.log ('undefined');
    }
  });
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
