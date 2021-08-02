"use strict"

var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var mongoosePaginate=require("mongoose-paginate-v2");

var PublicationSchema = Schema ({
  text: String,
  image:  {
    original: String,
    name: String,
    ext: String
  },
  created_at: String,
  user: { type: Schema.ObjectId, ref: "User"}

})
PublicationSchema.plugin(mongoosePaginate);
module.exports = mongoose.model( "Publication", PublicationSchema);
