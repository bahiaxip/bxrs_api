"use strict"

var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var mongoosePaginate = require("mongoose-paginate-v2");

var UserSchema = Schema({
  //id: String,
  name: String,
  surname: String,
  nick: String,
  email: {
    type: String,
    required: true
  },
  phone: String,
  city: String,
  password: String,
  role:String,
  image: {
    original: String,
    name: String,
    ext: String
  }
});
UserSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("User", UserSchema);
