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
    PhotoWorks   =  mongoose.model ('photoWorks'),
    Works        =  mongoose.model ('works');

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
      var postText = fields.postText[0];
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
          syncWrites(theFiles, workImagesPath, workTitle, postText, models, copyright, coverImages, false, res);
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
 **/

function syncWrites(filesToWrite, workingPath, workTitle, postText, models, copyright, coverImages, edit, res) {
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
            syncWrites(filesToWrite, workingPath, workTitle, postText, models, copyright, coverImages, edit, res);
          } else {
            if (edit === false) {
              console.log("imagesWritten: " + imagesWritten);
              console.log("workTitle: " + workTitle);
              console.log("models: " + models);
              console.log("copyright: " + copyright);
              console.log("coverImageUrl: ", coverImageUrl);

              for (var i = 0; i < imagesWritten.length; ++i) {
                if (coverImageUrl === imagesWritten[i].imageUrl) {
                  var temp = imagesWritten[0];
                  var imageObj = {
                    imageUrl: coverImageUrl,
                    coverImage: true
                  };
                  imagesWritten[0] = imageObj;
                  imagesWritten[i] = temp;
                }
              }

              // file array filesToWrite is empty,
              // all files have been written, create
              // DB entry.
              var work = new PhotoWorks( {title: workTitle,
                models: models,
                copyright: copyright,
                images: imagesWritten,
                postText: postText,
                coverImageUrl: coverImageUrl} );

              work.save (function (err) {
                if (err) {
                  console.log("error saving to DB: " + err);
                } else {
                  console.log("successfully saved work to DB!");
                  imagesWritten = [];
                  var generalWorkObject = {
                    work_id: work._id,
                    work_type: 'photo',
                    created: work.created
                  };
                  var generalWorkCreated = new Works (generalWorkObject);
                  generalWorkCreated.save (function (err) {
                    if (err) {
                      console.log ("error creating general work for: ", work);
                    } else {
                      console.log ("successfully saved general work to DB");
                      return res.status(200).send(work);
                    }
                  });
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



function syncEditWrites (filesToWrite, workingPath, editObject, coverImages, callback) {
  // no new images to write.
  if (filesToWrite.length === 0 || typeof filesToWrite === 'undefined') {
    callback();
  } else {
    console.log("filesToWrite.length: ", filesToWrite.length);
    console.log("coverImages.length: ", coverImages.length);
    var currentFile = filesToWrite.pop();
    var currentCover = coverImages.shift();

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
        callback (err);
      } else {
        // uploaded image is opened from its
        // temporary location and we are given
        // it's data in data variable, now write
        // that data to final, real destination
        fs.writeFile (fullDestFile, data, function (err) {
          if (err) {
            console.log ("error writing file: ", err);
            callback (err);
          } else {
            console.log("successfully wrote image file");

            // get the relative path of the written image because
            // <img src = " "> will need the relative path to display
            // the image, not absolute.
            imageObject.imageUrl = 'modules/images/client/img/photo_works/' +
              editObject.workTitle + '/' + destFile;
            console.log("current cover is: ", currentCover);
            if (currentCover === true) {
              console.log('current cover true');
              coverImageUrl = imageObject.imageUrl;
              chosenCoverImage = imageObject.imageUrl;
              console.log("coverImageUrl: ", coverImageUrl);
            }
            imagesWritten.push (imageObject);
            editImagesToSave.push (imageObject);
            syncEditWrites (filesToWrite, workingPath, editObject, coverImages, callback);
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
          Works.remove ( {work_id: identifier}, function (err, result) {
            if (err) {
              console.log ("error removing general work from DB for",
                            workToDelete);
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

    }
  });
  //console.log("workToDelete: ", workToDelete);

};

var identifier;
var serverImages;
var chosenCoverImage;
var editImagesToSaveTitleChange = [];

function syncDeletes (filesToDelete, callback) {
  var currentFile = filesToDelete.pop();
  var pathOfFile = path.resolve (process.cwd(), currentFile.imageUrl);

  fs.unlink (pathOfFile, function (err) {
    if (err) {
      console.log("error deleting file: ", err);
      callback (err);
    } else {
      console.log ("successfully deleted image file: ", pathOfFile);

      if (filesToDelete.length > 0) {
        syncDeletes (filesToDelete, callback);
      } else {
        console.log ("done deleting files");
        callback ();
      }
    }
  })
}

/**
 *
 * given an array of identical objects, this
 * function will remove the passed in key
 * from each of the objets in the array.
 *
 */
function removeKeyFromObjectsInArray(key, objectArray, callback) {
  for (var i = 0; i < objectArray.length; ++i) {
    delete objectArray[i][key];
    if (i === objectArray.length - 1) {
      callback();
    }
  }
}

/**
 * given a list of images that were already on the server
 * when edit was submitted, push those images
 * onto our final image array (editImagesToSave).
 *
 * It is possible that the user deleted all the server images
 * and submitted the edit, in which case we immediately return
 * from recursion.
 *
 * @param serverImages
 * @param callback
 */

function pushInitialServerImages (serverImagesCopy, callback) {
  if (serverImagesCopy.length === 0) {
    callback();
  } else {
    var imageToPush = serverImagesCopy.pop();
    /*
    if (imageToPush.coverImage === true) {
      chosenCoverImage = imageToPush.imageUrl;
    }*/
    editImagesToSave.push (imageToPush);
    pushInitialServerImages (serverImagesCopy, callback);
  }
}

/**
 * In our function, syncEditWrites(), in order to keep track of
 * whether or not an image being written is indeed a chosen cover
 * image, we create an array of boolean values that correspond
 * to the image files array.
 *
 * @param newImagesArray
 * @param coverImagesArray
 * @param callback
 */

function createCoverImageArray (newImagesArray, coverImagesArray, callback) {
  if (newImagesArray.length === 0) {
    callback (coverImagesArray);
  } else {
    var currentImage = newImagesArray.pop ();
    var currentCover = currentImage.coverImage;
    coverImagesArray.push (currentCover);
    createCoverImageArray (newImagesArray, coverImagesArray, callback);
  }
}

function getPhotoWorkCall (identifier, callback) {
  console.log ('identifier is: ', identifier);
  PhotoWorks.findById (identifier, function (err, work) {
    if (err) {
      callback (err);
    } else {
      callback ('', work);
    }
  });
}


/**
 * move images for a photo work
 * to new directory specified by
 * new title.
 * @param newTitle
 */
function moveImages (oldLoc, newLoc, callback) {
  console.log ('oldLoc: ', oldLoc);
  console.log ('newLoc: ', newLoc);
  console.log ("____________MOVE IMAGES");
  fs.mkdir (newLoc, function (err) {
    if (err) {
      callback (err);
    } else {
      console.log ("successfully created directory: ", newLoc);

      // ncp is a module that is equivalen to
      // cp -r in unix based terminals.
      ncp (oldLoc, newLoc, function (err) {
        if (err) {
          callback (err);
        } else {
          console.log ('ncp successssssss');
          callback ('', true);
        }
      });
    }
  });
}

/**
 * editImagesToSave contains the relative paths
 * of all images to save after an edit.
 *
 * However, if the user changed the title
 * of the photo work, we must create new
 * relative paths to the images.
 *
 * This function will take editImagesToSave
 * and push to editImagesToSaveTitleChange
 * each updated relative path
 * @param newTitle
 * @param callback
 */
function renameImagesToSave (newTitle, callback) {
  if (editImagesToSave.length > 0) {
    var homeRelative = 'modules/images/client/img/photo_works/' + newTitle;
    var currentImage = editImagesToSave.pop ();
    var fileName = currentImage.imageUrl.substring (currentImage.imageUrl.lastIndexOf ('/'));
    var updatedRelative = homeRelative + fileName;
    if (currentImage.coverImage === true) {
      chosenCoverImage = updatedRelative;
    }
    var newImageObject = {
      imageUrl: updatedRelative,
      coverImage: currentImage.coverImage
    };
    editImagesToSaveTitleChange.push (newImageObject);
    console.log ('editImagesToSaveTitleChange: ', editImagesToSaveTitleChange);
    renameImagesToSave (newTitle, callback);
  } else {
    console.log ('editImagesToSaveTitleChange: ', editImagesToSaveTitleChange);
    callback ();
  }
}

/**
 * Constructs absolute path of old title's
 * location for images and removes that constructed
 * directory.
 * @param oldTitle
 */
function removeOldDir (oldTitle, work, callback) {
  var oldAbsolute = path.resolve (process.cwd (), 'modules/images/client/img/photo_works');
  oldAbsolute = path.resolve (oldAbsolute, oldTitle);
  rmdir (oldAbsolute, function (err) {
    if (err) {
      console.log ('error deleting old directory: ', err);
    } else {
      work.save (function (err) {
        if (err) {
          console.log ('error saving work edit: ', err);
          callback (err);
        } else {
          callback();
        }
      });
    }
  });
}

/**
 * iterate over work.images array to find
 * the cover image. Set work.coverImageUrl
 * to the cover image.
 * @param work
 * @param callback
 */
function setCoverImage (work, callback) {
  for (var i = 0; i < work.images.length; ++i) {
    if (work.images[i].coverImage === true) {
      chosenCoverImage = work.images[i].imageUrl;
      console.log ('chosenCoverImage: ', chosenCoverImage);
      var temp = work.images[0];
      work.images[0] = work.images[i];
      work.images[i] = temp;
      work.coverImageUrl = chosenCoverImage;
      callback();
    }
  }
}

/**
 * given editObject with fields to update
 * the DB with, call DB entry by
 * identifier passed as key in editObject
 * and save the changes
 *
 * @param editObject
 * @param callback
 */
function updateEntry (editObject, callback) {
  PhotoWorks.findById (editObject.identifier, function (err, work) {
    if (err) {
      console.log ("error looking for work in DB: ", err);
      callback (err);
    } else {
      var oldTitle = work.title;
      work.title = editObject.workTitle;
      work.models = editObject.models;
      work.copyright = editObject.copyright;
      if (editObject.workTitle !== oldTitle) {
        work.images = editImagesToSaveTitleChange;
      } else {
        work.images = editImagesToSave;
      }
      work.postText = editObject.postText;

      setCoverImage (work, function () {
        if (editObject.workTitle !== oldTitle) {
          removeOldDir (oldTitle, work, function (err) {
            if (err) {
              console.log ("error removing old directory: ", err);
              callback (err);
            } else {
              work.save (function (err) {
                if (err) {
                  console.log ("error saving work to DB: ", err);
                  callback (err);
                } else {
                  callback('', work);
                }
              });
            }
          });
        } else {
          // no new title, no need to remove a directory
          work.save (function (err) {
            if (err) {
              console.log ("error saving work to DB: ", err);
              callback (err);
            } else {
              callback('', work);
            }
          });
        }
      });
    }
  });
}

exports.editPhotoWork = function (req, res) {
  console.log('edit photo work');
  editImagesToSave = [];
  imagesWritten = [];
  editImagesToSaveTitleChange = [];
  chosenCoverImage = '';
  var form = new multiparty.Form();

  form.parse (req, function (err, fields, files) {
    console.log ('editImagesToSaveTitleChange: ', editImagesToSaveTitleChange);
    editImagesToSaveTitleChange = [];
    editImagesToSave = [];
    console.log (util.inspect (files));
    console.log ("editObject: ", util.inspect (fields.editObject[0]));

    var editObject = JSON.parse (fields.editObject[0]);

    var afterRenameImagesToSave = function (err) {
      updateEntry (editObject, function (err, work) {
        if (err) {
          console.log ('error updating entry in DB: ', err);
        } else {
          return res.status (200).send (work);
        }
      });
    };

    var afterImagesMoved = function (err, titleChanged) {
      if (err) {
        console.log ("error afterImagesMoved: ", err);
        return res.status (400).send ();
      } else {
        if (titleChanged) {
          console.log ("TITLE CHANGED____________");
          // editImagesToSave is an array of image objects that are used to set
          // the images field in the DB model. Since we renamed the photo work
          // in the edit, we must update each of the relative paths of the images
          // in that array to match the new title (since the images were moved
          // to a different folder that is named after the new title).
          renameImagesToSave (editObject.workTitle, afterRenameImagesToSave);
        } else {
          // no title change, can save work now.
          updateEntry (editObject, function (err, work) {
            if (err) {
              console.log ('error updating entry in DB: ', err);
            } else {
              return res.status (200).send (work);
            }
          });
        }
      }
    };

    var afterPhotoWorkRetrieval = function (err, work) {
      if (err) {
        return res.status (400).send ();
      } else {

        if (editObject.workTitle !== work.title) {
          // title of photo work was edited,
          // need to move images to new directory
          // of new name and delete directory of
          // old name.
          var oldAbsolute = path.resolve (process.cwd (), 'modules/images/client/img/photo_works');
          oldAbsolute = path.resolve (oldAbsolute, work.title);
          var newAbsolute = path.resolve (process.cwd (), 'modules/images/client/img/photo_works');
          newAbsolute = path.resolve (newAbsolute, editObject.workTitle);
          moveImages (oldAbsolute, newAbsolute, afterImagesMoved);
        } else {
          // no title change, go to callback
          // that comes after moving images
          // and pass false to specify that no images
          // were moved because the title was never changed
          afterImagesMoved (false);
        }
      }
    };

    var afterImageWriteCallback = function (err) {
      if (err) {
        console.log ('cannot continue afterImageWriteCallbac: ', err);
        return res.status (400).send ();
      } else {
        getPhotoWorkCall (editObject.identifier, afterPhotoWorkRetrieval);
      }
    };

    var afterCoverImageArrayCreated = function (coverImages, err) {
      if (err) {
        console.log ('cannot continue afterCoverImageArrayCreated(): ', err);
        return res.status (400).send ();
      } else {
        var theFiles = files ['file'];
        console.log ('editObject: ', util.inspect (editObject));
        console.log ('theFiles: ', util.inspect (theFiles));


        var workRetrieved = function (err, work) {
          if (err) {
            console.log ("error retrieving work: ", err);
            return res.status (400).send ();
          } else {
            var modulesPath = path.resolve(process.cwd(), 'modules');
            var imagesPath = path.resolve(modulesPath, 'images/client/img/photo_works');
            var workImagesPath = path.resolve (imagesPath, work.title);
            // write new images to the server FS.
            syncEditWrites (theFiles, workImagesPath, editObject, coverImages, afterImageWriteCallback);
          }
        };

        // retrieve photo work to update and bubble up to workRetrieved callback
        getPhotoWorkCall (editObject.identifier, workRetrieved);

      }
    };

    var afterDeleteCallback = function (err) {
      if (err) {
        console.log ('cannot continue afterDeleteCallback: ', err);
        return res.status (400).send ();
      } else {
        if (editObject.newImages.length > 0) {
          var newImagesArr = editObject.newImages;
          // create an array of true/false values that are 1:1 with the array
          // of files to upload to keep track of whether or not a new image
          // is a cover image.
          createCoverImageArray (newImagesArr, [], afterCoverImageArrayCreated);
        } else {
          var workRetrieved = function (err, work) {
            if (err) {
              console.log ("error retrieving work: ", err);
              return res.status (400).send ();
            } else {
              var modulesPath = path.resolve(process.cwd(), 'modules');
              var imagesPath = path.resolve(modulesPath, 'images/client/img/photo_works');
              var workImagesPath = path.resolve (imagesPath, work.title);
              afterImageWriteCallback('');
            }
          };

          getPhotoWorkCall (editObject.identifier, workRetrieved);
        }
      }
    };

    var afterInitialImagePush = function (err) {
      if (err) {
        console.log ("could not proceed from pushing initial server images: ", err);
        return res.status (400).send ();
      } else {
        console.log ('editImagesToSave: ', editImagesToSave);
        if (editObject.imagesToDelete.length > 0) {
          // if there are any images marked for deletion, syncDeletes
          // will remove them from the server FS.
          syncDeletes(editObject.imagesToDelete, afterDeleteCallback);
        } else {
          // proceed to the post-deletion callback if there are no
          // images marked for delete.
          afterDeleteCallback();
        }
      }
    };

    var afterKeyRemoval = function (err) {
      if (err) {
        console.log ("could not proceed after key removal: ", err);
        return res.status (400).send ();
      } else {
        // after removing the unwanted key in our serverImages array,
        // we push the server images (if any, it may be the case that
        // all were deleted during the edit and we only have new images
        // to work with) onto an array which keeps track of all
        // images that are apart of the photo work for updating the
        // DB later on (images field in PhotoWorks model)
        var initialImages = editObject.serverImages;
        pushInitialServerImages (initialImages, afterInitialImagePush);
      }
    };

    // execution of edit begins here and bubbles up
    // through the callbacks.
    if (editObject.serverImages.length > 0) {
      console.log ('editObject: ', editObject);
      var serverImagesCopy = editObject.serverImages.slice ();

      // each object in the editObject.serverImages object array
      // has a key called "serverImage" that we do not need when
      // operating on the objects in the array.
      // we pass the array to removeKeyFromObjectsInArray to remove
      // the serverImage array, allowing us to easily work with the objects
      // during editing.
      removeKeyFromObjectsInArray ('serverImage', serverImagesCopy, afterKeyRemoval);
    } else {
      console.log ('editObject: ', editObject);
      afterKeyRemoval();
    }


    console.log("editImagesToSave before writes: ", util.inspect (editImagesToSave));
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
