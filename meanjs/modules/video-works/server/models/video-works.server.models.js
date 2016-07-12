'use strict';

var mongoose  = require('mongoose'),
    Schema    = mongoose.Schema;

var videoWorksSchema = new Schema ({
  title: {
    type: String
  },
  directedBy: {
    type: [String]
  },
  editedBy: {
    type: [String]
  },
  cast: {
    type: [String]
  },
  videoUrl: {
    type: String
  },
  copyright: {
    type: String
  }

});

mongoose.model('videoWorks', videoWorksSchema);
