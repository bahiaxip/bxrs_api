"use strict"

var express = require("express");

var PublicationController = require("../controllers/publication");
var auth = require("../middleware/auth");
var multer = require("multer");
var storage=multer.diskStorage({
  destination:function(req,file,cb){
    //mediante el método auth.ensureAuth obtenemos el email
    cb(null,'./uploads/publications/'+req.user.email)
  },
  filename:function(req,file,cb){
    //añadimos código aleatorio
    const randomname=Math.random().toString(20).slice(2);
    const ext=file.originalname.split('\.')[1];
    console.log("desde routes: ",file);
    cb(null,randomname+'.'+ext)
  }
});
//con extensión
var md_upload=multer({storage:storage});

var api = express.Router();
api.post("/publication",auth.ensureAuth,PublicationController.addPublication);
api.put("/publication/:id",auth.ensureAuth,PublicationController.updatePublication);
api.get("/publications/:page?",auth.ensureAuth,PublicationController.getPublications);
api.delete("/publication/:id",auth.ensureAuth,PublicationController.deletePublication);

api.post("/upload-image-pub/:id",[auth.ensureAuth,md_upload.single("imagepub")],PublicationController.uploadImage);
//podríamos comprobar el token del usuario
api.get("/image-pub/:email/:image",PublicationController.getImage);

api.get("/last-publications/:created",auth.ensureAuth,PublicationController.getLastPublications);
module.exports = api;
