"use strict"

var express = require("express");
var FollowController = require("../controllers/follow");
var api = express.Router();

//middleware
var auth=require("../middleware/auth");

//rutas
api.post("/follow",auth.ensureAuth,FollowController.saveFollow);
api.delete("/follow/:id",auth.ensureAuth,FollowController.deleteFollow);

module.exports = api;
