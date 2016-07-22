'use strict';

var validator    =  require ('validator'),
    multiparty   =  require('multiparty'),
    uuid         =  require ('uuid'),
    fs           =  require ('fs'),
    rmdir        =  require ('rimraf'),
    path         =  require ('path'),
    util         =  require ('util'),
    mongoose     =  require ('mongoose'),
    ncp          =  require ('ncp').ncp,
    PhotoWorks   =  mongoose.model('photoWorks');

ncp.limit = 16;

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
            chosenCoverImage = imageObject.imageUrl;
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
        return;
      }
    }
  })
}

function syncEditWrites (filesToWrite, workingPath, workTitle, models, copyright, coverImages, res) {
  // no new images to write.
  if (filesToWrite.length === 0 || typeof filesToWrite === 'undefined') {
    PhotoWorks.findById (identifier, function (err, work) {
      if (err) {
        console.log ("error finding work: ", err);
      } else {
        for (var i = 0; i < imagesWritten.length; ++i) {
          editImagesToSave.push (imagesWritten[i]);
        }
        var oldWorkTitle = work.title;
        work.title = workTitle;
        work.models = models;
        work.copyright = copyright;
        work.images = editImagesToSave;
        work.coverImageUrl = chosenCoverImage;
        work.save (function (err) {
          if (err) {
            console.log("error saving work to DB: ", err);
          } else {
            console.log ("successfully saved edit to DB");

            // if work title was edited, remove old directory
            // of work.
            if (oldWorkTitle !== workTitle) {
              var oldWorkPath = path.resolve (process.cwd (), 'modules');
              oldWorkPath = path.resolve (oldWorkPath, 'images/client/img/photo_works');
              oldWorkPath = path.resolve (oldWorkPath, oldWorkTitle);
              rmdir (oldWorkPath, fs, function (err) {
                if (err) {
                  console.log ("error deleting old work path: ", err);
                } else {
                  console.log ("successfully removed old work directory.");
                  imagesWritten = [];
                  editImagesToSave = [];
                  coverImageUrl = '';
                  return res.status (200).send (work);
                }
              });
            } else {
              imagesWritten = [];
              editImagesToSave = [];
              coverImageUrl = '';
              return res.status (200).send (work);
            }
          }
        })
      }
    });
  } else {
    var currentFile = filesToWrite.pop();
    var currentCover = coverImages.pop();

    var imageObject = {
      imageUrl: '',
      coverImage: currentCover
    };

    var oldPath = currentFile.path;
    var fileExtension = currentFile.path.substring(currentFile.path.lastIndexOf('.'));
    var destFile = uuid.v4() + fileExtension;
    var fullDestFile = workingPath + '/' + destFile;
    fs.readFile (oldPath, function (err, data) {
      if (err) {
        console.log ("error reading file: ", err);
      } else {
        fs.writeFile (fullDestFile, data, function (err) {
          if (err) {
            console.log ("error writing file: ", err);
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
              chosenCoverImage = imageObject.imageUrl;
              console.log("coverImageUrl: ", coverImageUrl);
            }
            imagesWritten.push(imageObject);
            syncEditWrites (filesToWrite, workingPath, workTitle, models, copyright, coverImages, res);
          }
        });
      }
    });

  }
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

    // get the passed in coverImage
    chosenCoverImage = fields['chosenCoverImage'][0];
    console.log("chosenCoverImage: ", chosenCoverImage);

    // get URLs of passed in server images
    serverImages = fields['serverImages[imageUrl]'];
    console.log("serverImages: ", util.inspect (serverImages));

    // if the user specified an image/images to delete that was on the server
    // at time of editing, remove it/them
    if (typeof fields['imagesToDelete[imageUrl]'] !== 'undefined') {
      console.log ('images to delete');
      var imagesToDelete = fields['imagesToDelete[imageUrl]'];
      console.log("imagesToDelete: ", util.inspect (imagesToDelete));
      syncDeletes(imagesToDelete);
    }

    var serverImageObjects = [];

    // serverImages array only contains the URLs
    // of the server images. Need to iterate over
    // this array of URLs so that we can recreate the
    // original image objects of the server images.
    // This is necessary when we create the final
    // images array (of image objects) consisting
    // of both old server images (that were not deleted)
    // and new images that were uploaded on edit.
    for (var i = 0; i < serverImages.length; ++i) {
      console.log (util.inspect (fields['serverImages[coverImage]'][i]));
      var coverImageBool;
      if (fields['serverImages[coverImage]'][i] === 'true') {
        coverImageBool = true;
        chosenCoverImage = fields['serverImages[imageUrl]'][i];
        console.log("chosenCoverImage: ", chosenCoverImage);
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

    console.log("editImagesToSave before writes: ", util.inspect (editImagesToSave));

    // if there are newly uploaded images to write to server FS               // **********
    if (typeof fields['newImages[imageUrl]'] !== 'undefined') {
      console.log("okay");
      var newImages = [];

      // create the proper image objects of the newly passed in images
      // in the same way that we did for the passed server images above.
      for (var i = 0; i < fields['newImages[imageUrl]'].length; ++i) {          // this entire section
        console.log("fields: ", fields['newImages[imageUrl]'][i]);              // might be unnecessary
        var newImage = {                                                        // as final newImages
          coverImage: fields['newImages[coverImage]'][i],                       // array does not
          imageUrl: fields['newImages[imageUrl]'][i]                            // appear to be used
      };                                                                        // after this section
        console.log(newImage);                                                  // of code where it is
        newImages.push (newImage);                                              // populated.

        console.log (util.inspect (newImages));
    }                                                                         // ***********
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

      PhotoWorks.findById (identifier, function (err, work) {
        if (err) {
          console.log("error finding work: ", err);
        } else {

          // if the user edited the title of the photo work
          // we need to move contents of old photo work's folder
          // to new photo work folder by creating new directory.
          // after copying, rmdir -rf old folder.
          // This also means that DB references to saved images
          // will need to be updated.
          if (work.title !== workTitle) {
            var oldTitle = work.title;
            var newDirectory = workImagesPath;
            var callback = function (result) {
              if (result === 'directory exists') {
                return res.status (400).send ();
              }

              if (result === 'success') {
                syncEditWrites (theFiles, workImagesPath, workTitle, models, copyright, coverImages, res);
              }
            };

            changePhotoWorkTitle (newDirectory, workImagesPath, imagesPath,
                                  oldTitle, workTitle, serverImageObjects, callback);

          } else {
            // editImagesToSave will contain both the old server images
            // that were not deleted on edit and the new images
            // that were uploaded (if any). Newly uploaded images
            // will be pushed onto editImagesToSave array on write
            editImagesToSave = serverImageObjects;
            syncEditWrites (theFiles, workImagesPath, workTitle, models, copyright, coverImages, res);
          }
        }
      });




    } else {
      // no new images to write

      console.log("workImagesPath: ", workImagesPath);
      console.log("workTitle is: ", workTitle);
      identifier = fields['identifier'];
      console.log ("identifier: ", identifier);
      console.log ("no new images to write");
      PhotoWorks.findById (identifier, function (err, work) {
        var modulesPath = path.resolve(process.cwd(), 'modules');
        var imagesPath = path.resolve(modulesPath, 'images/client/img/photo_works');
        var workTitle = fields['workTitle'][0];
        console.log ('workTitle before constructing workImagesPath: ', workTitle);
        var workImagesPath = path.resolve (imagesPath, workTitle);
        if (err) {
          console.log ('error finding work: ', err);
        } else {
          console.log ('work: ', util.inspect (work));
          // if the user edited the title of the photo work
          // we need to move contents of old photo work's folder
          // to new photo work folder by creating new directory.
          // after copying, rmdir -rf old folder.
          // This also means that DB references to saved images
          // will need to be updated.
          console.log("workTitle is: ", workTitle);
          console.log("work.title is: ", work.title);
          var oldTitle = work.title;
          if (work.title !== workTitle) {
            var newDirectory = workImagesPath;
            console.log ('newDirectory: ', newDirectory);
            var callback = function (result) {
              if (result === 'directory exists') {
                return res.status (400).send ();
              }

              if (result === 'success') {

                console.log ('theFiles: ', util.inspect (theFiles));
                console.log ('changePhotoWorkTitle success');
                var modulesPath = path.resolve(process.cwd(), 'modules');
                var imagesPath = path.resolve(modulesPath, 'images/client/img/photo_works');
                var workTitle = fields['workTitle'][0];
                var workImagesPath = path.resolve (imagesPath, workTitle);
                var coverImages = fields['newImages[coverImage]'];
                var models = fields['models'];
                var copyright = fields['copyright'][0];
                if (typeof theFiles === 'undefined') {
                  work.title = workTitle;
                  work.models = models;
                  work.copyright = copyright;
                  work.images = serverImageObjects;
                  work.coverImageUrl = chosenCoverImage;
                  work.save (function (err) {
                    if (err) {
                      console.log ("error saving edit to DB: ", err);
                    } else {
                      console.log ("successfully saved edit to DB");
                      return res.status (200).send ();
                    }
                  });
                } else {
                  syncEditWrites (theFiles, workImagesPath, workTitle, models, copyright, coverImages, res);
                }
              }
            };
            changePhotoWorkTitle (newDirectory, workImagesPath, imagesPath,
                                  oldTitle, workTitle, serverImageObjects, callback);


            console.log ("result is: ", result);

          } else {

            // work title is still the same and no new images
            // to save. At this point, update the chosenCoverImage,
            // models, copyright, and images in case those have changed.
            // images would have changed if the user removed any images
            // during the edit, which is handled earlier on
            // in this editPhotoWork funtion.
            var models = fields['models'];
            var copyright = fields['copyright'][0];
            work.models = models;
            work.copyright = copyright;
            work.images= serverImageObjects;
            work.coverImageUrl = chosenCoverImage;
            work.save (function (err) {
              if (err) {
                console.log ("error saving edit to DB: ", err);
              } else {
                console.log ("successfully saved edit to DB");
                return res.status (200).send (work);
              }
            });
          }
        }
      });
    }
  });
};

function changePhotoWorkTitle(newDirectory, workImagesPath, imagesPath,
                              oldTitle, workTitle, serverImageObjects, callback) {
  fs.stat (newDirectory, function (err, stats) {
    if (err) {
      // the directory does not exist so it can be
      // created
      fs.mkdir (workImagesPath, function (err) {
        if (err) {
          console.log("error creating new directory: ", err);
        } else {
          console.log ('successfully created new directory: ', newDirectory);
          var oldDir = path.resolve (imagesPath, oldTitle);
          ncp (oldDir, newDirectory, function (err) {
            if (err) {
              console.log("error copying files over to new directory: ", err);
            } else {
              console.log ('successfully copied images to new directory');

              // extract image file names and update them so
              // you have a correct reference to them in the DB
              // (since we copied image files to a new specified
              // directory)
              for (var i = 0; i < serverImageObjects.length; ++i) {
                var currentPath = serverImageObjects[i].imageUrl;
                var lastSlashIndex = currentPath.lastIndexOf("/");
                var fileName = currentPath.substring(lastSlashIndex + 1);
                var newPath = 'modules/images/client/img/photo_works/' + workTitle + '/' + fileName;
                serverImageObjects[i].imageUrl = newPath;
                console.log("newPath: ", newPath);

                // update the chosen cover image URL if the chosen
                // cover image was a server image.
                if (serverImageObjects[i].coverImage === true) {
                  console.log ("if true");
                  chosenCoverImage = serverImageObjects[i].imageUrl;
                }
              }
              console.log("done for loop");
              editImagesToSave = serverImageObjects;
              console.log ('returning');
              callback ('success');

            }
          });
          console.log("returning 2");
        }
      })
    } else {
      console.log ('the directory ' + newDirectory +' already exists!');
      console.log ('stats: ', util.inspect (stats));
      callback ('directory exists');
    }
  });
}

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
