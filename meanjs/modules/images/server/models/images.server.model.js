'use strict';

var mongoose   = require('mongoose'),
    Schema     = mongoose.Schema;

var CyclerImagesSchema = new Schema ({
  path: {
    type: String
  },
  owner: {
    type: String
  }
});

mongoose.model('CyclerImages', CyclerImagesSchema);
