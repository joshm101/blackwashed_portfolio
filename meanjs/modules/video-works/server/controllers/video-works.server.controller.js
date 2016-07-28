'use strict';

var validator    =  require ('validator'),
    multiparty   =  require('multiparty'),
    uuid         =  require ('uuid'),
    fs           =  require ('fs'),
    path         =  require ('path'),
    rmdir        =  require ('rimraf'),
    ncp          =  require ('ncp').ncp,
    mongoose     =  require ('mongoose'),
    util         =  require ('util'),
    VideoWorks   =  mongoose.model ('videoWorks'),
    Works        =  mongoose.model ('works');

ncp.limit = 16;

exports.addVideoWork = function (req, res) {
  console.log('add video work');
  console.log (util.inspect (req.body));

  var form = new multiparty.Form();

  form.parse (req, function (err, fields, files) {
    if (err) {
      console.log ("error parsing request: ", err);
      return res.status(400).send ();
    } else {
      // VideoWorks.find ({}).remove().exec();

      // get temporary path of image
      var imagePath = files.file[0].path;
      var extension = imagePath.substring (imagePath.lastIndexOf ('.'));
      console.log ("cover image temporary path: ", imagePath);

      console.log ("fields is: ", util.inspect (fields));
      console.log ("files is: ", util.inspect (files));

      // parse the passed video work object string
      var videoWorkObject = JSON.parse (fields['videoWork'][0]);
      console.log ("videoWorkObject parsed: ", videoWorkObject);

      var workTitle = videoWorkObject.title;

      // construct directory where cover image will be saved
      var coverImageDirectory = path.resolve (process.cwd(),
                                              'modules/images/client/img/video_works/' + workTitle);

      // create the cover image's directory
      fs.mkdir (coverImageDirectory, function (err) {
        if (err) {
          console.log ("error creating video work cover image directory:", err);
        } else {
          console.log ("successfully created directory with absolute path ", coverImageDirectory);

          // read data of image to be saved
          fs.readFile (imagePath, function (err, data) {
            if (err) {
              console.log ("error reading file: ", err);
            } else {

              // create name for image and
              // its final save path
              var imageName = uuid.v4() + extension;
              var imageSavePath = path.resolve (coverImageDirectory, imageName);

              // write data of read image file from temporary
              // location to final location. This location
              // will be referenced in the DB entry
              fs.writeFile (imageSavePath, data, function (err) {
                if (err) {
                  console.log ("error writing cover image: ", err);
                } else {
                  console.log ("successfully wrote image file at: ", imageSavePath);

                  // store the relative path of the cover image. This will be the relative
                  // URL needed for resource loading on client side
                  videoWorkObject.coverImageUrl = 'modules/images/client/img/video_works/'
                                                              + workTitle + '/' + imageName;
                  console.log ('videoWork.coverImageUrl: ', videoWorkObject.coverImageUrl);


                  // create DB entry for the submited video work
                  var work = new VideoWorks (videoWorkObject);
                  work.save (function (err) {
                    if (err) {
                      console.log ("error saving to DB: ", err);
                    } else {
                      console.log ("successfully saved/created video work in DB");
                      var generalWork = {
                        work_id: work._id,
                        work_type: 'video',
                        created: work.created
                      };
                      var generalWorkCreated = new Works (generalWork);
                      generalWorkCreated.save (function (err) {
                        if (err) {
                          console.log ('error creating general work for: ', work);
                        } else {
                          console.log ('successfully saved/created general work in DB');
                          return res.status (200).send (work);
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  });
};

exports.deleteVideoWork = function (req, res) {
  console.log('delete video work');
  var workToDelete = JSON.parse (req.query.data);
  var identifier = workToDelete._id;

  VideoWorks.find ( {_id: identifier}, function (err, work) {
    if (err) {
      console.log ("error finding work: ", err);
    } else {
      console.log ("work found: ", util.inspect (work));
      var pathToWork = path.resolve (process.cwd(),
                        'modules/images/client/img/video_works');
      pathToWork = path.resolve (pathToWork, work[0].title);
      rmdir (pathToWork, fs, function (err) {
        if (err) {
          console.log ('error deleting work folder: ', err);
        } else {
          Works.remove ( {work_id: identifier}, function (err, result) {
            if (err) {
              console.log ('error removing general work from DB: ', err);
            } else {
              VideoWorks.remove ( {_id: identifier}, function (err, result) {
                if (err) {
                  console.log ('error removing from DB: ', err);
                } else {
                  console.log ("successfully removed videoWork from DB.");
                  return res.status (200).send ();
                }
              });
            }
          });
        }
      });
    }
  });
};

exports.editVideoWork = function (req, res) {
  console.log('edit video work');

  var form = new multiparty.Form();

  form.parse (req, function (err, fields, files) {
    if (err) {
      console.log ("error parsing request: ", err);
      return res.status (400).send ();
    } else {
      console.log (util.inspect (files));
      console.log ('typeofFiles: ', typeof files);
      var newFile = false;
      for (var prop in files) {
        if (files.hasOwnProperty (prop)) newFile = true;
      }
      var workObject = JSON.parse (fields.work[0]);
      if (newFile === false) {
        // no new cover image
        console.log ("no new cover image");
        VideoWorks.findById (workObject._id, function (err, work) {
          if (err) {
            console.log ('error finding work in DB: ', err);
          } else {
            if (work.title !== workObject.title) {
              console.log ('work: ', util.inspect (work));
              var oldDirectory = path.resolve (process.cwd(),
                'modules/images/client/img/video_works/' +
                work.title);
              var newDirectory = path.resolve (process.cwd(),
                'modules/images/client/img/video_works/' +
                workObject.title);

              fs.mkdir (newDirectory, function (err) {
                if (err) {
                  console.log ("error creating directory: ", err);
                } else {
                  console.log ('successfully created directory: ',
                    newDirectory);
                  ncp (oldDirectory, newDirectory, function (err) {
                    if (err) {
                      console.log ("error copying images: ", err);
                    } else {
                      console.log ('successfully copied images to: ',
                        newDirectory);
                      for (var prop in workObject) {
                        work[prop] = workObject[prop];
                      }
                      var fileName = work.coverImageUrl.substring (
                                  work.coverImageUrl.lastIndexOf ('/') );
                      work.coverImageUrl = 'modules/images/client/img/video_works/' +
                                            work.title + '/' + fileName;
                      work.save (function (err) {
                        if (err) {
                          console.log ("error saving edit to DB: ", err);
                        } else {
                          console.log ("successfully saved edit to DB");
                          return res.status (200).send (work);
                        }
                      });
                    }

                  });
                }
              });
            } else {
              VideoWorks.findById (workObject._id, function (err, work) {
                if (err) {
                  console.log ("error finding work in DB: ", work);
                } else {
                  for (var prop in workObject) {
                    work[prop] = workObject[prop];
                  }
                  work.save (function (err) {
                    if (err) {
                      console.log ("error saving edit to DB: ", err);
                    } else {
                      console.log ("successfully saved edit to DB");
                      return res.status (200).send (work);
                    }
                  });
                }
              });
            }
          }
        });

      } else {
        console.log ('workObject: ', util.inspect (workObject));
        // new cover image
        console.log ('new cover image');
        var newCoverImage = files.file[0].path;
        console.log ("newCoverImage: ", newCoverImage);

        VideoWorks.findById (workObject._id, function (err, work) {
          if (err) {
            console.log ("error finding work in DB");
          } else {
            console.log ('work is: ', util.inspect (work));

            // if submitted edit has a different title than
            // the one stored
          //   if (work.title !== workObject.title) {
            var oldDirectory = path.resolve (process.cwd(),
                                  'modules/images/client/img/video_works/' +
                                  work.title);
            rmdir (oldDirectory, fs, function(err) {
              if (err) {
                console.log ("error removing old directory: ", err);
              } else {
                console.log ('successfully removed old directory');
                var newDirectory = path.resolve (process.cwd(),
                                      'modules/images/client/img/video_works/' +
                                       workObject.title);
                fs.mkdir (newDirectory, function (err) {
                  if (err) {
                    console.log ("error creating new directory: ", err);
                  } else {
                    console.log ("successfully created new directory: ",
                                                            newDirectory);
                    var newCoverImage = files.file[0].path;
                    console.log ("newCoverImage: ", newCoverImage);
                    fs.readFile (newCoverImage, function (err, data) {
                      if (err) {
                        console.log ("error reading image: ", err);
                      } else {
                        var imageExtension = newCoverImage.substring (
                                              newCoverImage.lastIndexOf('.'));
                        var fileName = uuid.v4() + imageExtension;
                        var saveLocation = path.resolve (newDirectory, fileName);
                        var relativePath = 'modules/images/client' +
                                           '/img/video_works/' +
                                            workObject.title + '/' +
                                            fileName;
                        fs.writeFile (saveLocation, data, function (err) {
                          if (err) {
                            console.log ('error writing image file: ', err);
                          } else {
                            console.log ("successfully wrote image file at: ",
                                          saveLocation);
                            workObject.coverImageUrl = relativePath;
                            console.log ('workObject.coverImageUrl: ',
                                            workObject.coverImageUrl);
                            for (var prop in workObject) {
                              work[prop] = workObject[prop];
                            }
                            work.save (function (err) {
                              if (err) {
                                console.log ("error submitting edit to DB: ",
                                              err);
                              } else {
                                console.log ("successfully saved edit to DB");
                                return res.status (200).send (work);
                              }
                            });
                          }
                        });
                      }
                    });
                  }
                });
              }
            });
           //  }
          }
        });
        //VideoWorks.findById( {_id: } )
      }
      console.log (util.inspect (fields));
    }
  });
};

exports.getVideoWorks = function (req, res) {
  VideoWorks.find({}, function (err, works) {
    if (err) {
      console.log ('error retrieving works: ', err);
    } else {
      console.log ('videoWorks: ', works);
      return res.status (200).send (works);
    }
  });
};
