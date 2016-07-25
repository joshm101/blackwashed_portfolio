'use strict';

var validator    =  require ('validator'),
    multiparty   =  require('multiparty'),
    uuid         =  require ('uuid'),
    fs           =  require ('fs'),
    path         =  require ('path'),
    mongoose     =  require ('mongoose'),
    util         =  require ('util'),
    VideoWorks   =  mongoose.model ('videoWorks');

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
};

exports.deleteVideoWork = function (req, res) {
  console.log('delete video work');
};

exports.editVideoWork = function (req, res) {
  console.log('edit video work');
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
