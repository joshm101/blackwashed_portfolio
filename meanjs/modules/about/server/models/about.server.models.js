'use strict';

var mongoose  = require('mongoose'),
  Schema    = mongoose.Schema;

var aboutSchema = new Schema ({
  text: {
    type: String
  },
  imageUrl: {
    type: String
  }

});

mongoose.model('aboutPage', aboutSchema);
