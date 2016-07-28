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
  },
  workInfo: {
    type: String
  },
  coverImageUrl: {
    type: String
  },
  created: {
    type: Date,
    default: Date.now
  }

});

mongoose.model('videoWorks', videoWorksSchema);
