"use strict"

var mongoose=require("mongoose");
var Schema = mongoose.Schema;

var VisibilitySchema = Schema({
  name: Boolean,
  surname: Boolean,
  email: Boolean,
  phone: Boolean,
  city: Boolean,
  image: Boolean,
  one: Boolean,
  user: { type: Schema.ObjectId, ref: "User"}
})

module.exports = mongoose.model("Visibility",VisibilitySchema);
