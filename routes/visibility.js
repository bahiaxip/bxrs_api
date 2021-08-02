"use strict"

var express = require("express");
var VisibilityController = require("../controllers/visibility");
var api = express.Router();
var auth = require("../middleware/auth");
api.put("/visibility/:id",auth.ensureAuth,VisibilityController.onVisibility);
api.get("/visibility/:id",auth.ensureAuth,VisibilityController.getVisibility);
module.exports = api;
