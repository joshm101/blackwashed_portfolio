'use strict';

var mongoose  = require('mongoose'),
  Schema    = mongoose.Schema;

var worksSchema = new Schema ({
  work_id: {
    type: String
  },
  work_type: {
    type: String
  },
  created: {
    type: Date
  }
});

mongoose.model('works', worksSchema);
