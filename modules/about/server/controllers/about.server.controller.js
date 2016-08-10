'use strict';

var validator    =  require ('validator'),
  multiparty   =  require('multiparty'),
  uuid         =  require ('uuid'),
  fs           =  require ('fs'),
  path         =  require ('path'),
  mongoose     =  require ('mongoose'),
  util         =  require ('util'),
  AboutPage    =  mongoose.model ('aboutPage');


exports.editAboutPage = function (req, res) {
  var form = new multiparty.Form();

  form.parse (req, function (err, fields, files) {
    if (err) {
      console.log ("error parsing: ", err);
      return res.status (400).send ();
    } else {
      console.log ('fields: ', util.inspect (fields));
      //console.log ('files: ', util.inspect (files));
      var newFile = false;
      for (var prop in files) {
        if (files.hasOwnProperty (prop)) newFile = true;
      }
      var aboutText = fields.aboutText[0];
      if (newFile) {
        var tempImagePath = files.file[0].path;
        var extension = tempImagePath.substring (tempImagePath.lastIndexOf ('.'));
        var fileName = uuid.v4() + extension;
        var relativeDestination = 'modules/images/client/img/about_image/';
        var absoluteDestination = path.resolve (process.cwd(), relativeDestination);
        AboutPage.find ({}, function (err, aboutPage) {
          if (err) {
            console.log ("error searching DB: ", err);
            return res.status (400).send ();
          } else {
            if (aboutPage.length === 0) {
              // first time setting about page
              fs.readFile (tempImagePath, function (err, data) {
                if (err) {
                  console.log('error reading image: ', err);
                } else {
                  var writeDestination = path.resolve (absoluteDestination, fileName);
                  fs.writeFile (writeDestination, data, function (err) {
                    if (err) {
                      console.log ('error: ', err);
                    } else {
                      console.log ('successfully wrote about page image');
                      var relativePath = relativeDestination + fileName;
                      var aboutObject = {
                        text: aboutText,
                        imageUrl: relativePath
                      };

                      var newAbout = new AboutPage (aboutObject);
                      newAbout.save (function (err) {
                        if (err) {
                          console.log ("error saving to DB: ", err);
                        } else {
                          return res.status (200).send (newAbout);
                        }
                      });
                    }
                  });
                }
              });
            } else {
              var about = aboutPage[0];
              var oldRelativePath = about.imageUrl;
              var oldAbsolute = path.resolve (process.cwd (), oldRelativePath);
              fs.unlink (oldAbsolute, function (err) {
                if (err) {
                  console.log ('error deleting old about image file: ', err);
                } else {
                  fs.readFile (tempImagePath, function (err, data) {
                    if (err) {
                      console.log('error reading image: ', err);
                    } else {
                      var writeDestination = path.resolve (absoluteDestination, fileName);
                      fs.writeFile (writeDestination, data, function (err) {
                        if (err) {
                          console.log ('error: ', err);
                        } else {
                          console.log ('successfully wrote about page image');
                          var relativePath = relativeDestination + fileName;
                          about.imageUrl = relativePath;
                          about.text = aboutText;
                          about.save (function (err) {
                            if (err) {
                              console.log ("error saving to DB: ", err);
                            } else {
                              return res.status (200).send (about);
                            }
                          });
                        }
                      });
                    }
                  });
                }
              });
            }
          }
        });
      } else {
        AboutPage.find ({}, function (err, aboutPage) {
          if (err) {
            console.log ('error reading from DB: ', err);
          } else {
            var about = aboutPage[0];
            about.text = aboutText;
            about.save (function (err) {
              if (err) {
                console.log ('error saving to DB: ', err);
              } else {
                return res.status (200).send (about);
              }
            })
          }
        });
      }
    }
  });
};

exports.getAboutPage = function (req, res) {
  AboutPage.find ({}, function (err, aboutPage) {
    if (err) {
      console.log ('error getting AboutPage: ', err);
      return res.status (400).send ();
    }
    return res.status (200).send (aboutPage);
  })
};
