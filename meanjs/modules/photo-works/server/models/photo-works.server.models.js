'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var photoWorksSchema = new Schema ({
  title: {
    type: String
  },
  models: {
    type: [String]
  },
  copyright: {
    type: String
  }
});

mongoose.model('photoWorks', photoWorksSchema);
