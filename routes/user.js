"use strict"

var express = require("express");

var UserController=require("../controllers/user");
var api=express.Router();
var auth=require("../middleware/auth");
var multer = require("multer");
//sin extensión
//var md_upload = multer({dest:"./uploads/users"});

var storage=multer.diskStorage({
  destination:function(req,file,cb){
    //mediante el método auth.ensureAuth obtenemos el email
    cb(null,'./uploads/users/'+req.user.email)
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
//si se desea con extensión sustituir con multer.diskStorage -> (req,file,cb), https://www.npmjs.com/package/multer
//var storage=multer.diskStorage({...})
//var md_upload = multer({storage:storage})
api.get("/home",UserController.home);
api.post("/register",UserController.saveUser);
api.get("/users",auth.ensureAuth,UserController.getTotalUsers)
api.get("/users/:page?",auth.ensureAuth,UserController.getUsers);
api.post("/login",UserController.loginUser);
api.get("/user/:id",auth.ensureAuth,UserController.getUser);
api.put("/user/:id",auth.ensureAuth,UserController.updateUser);

api.post("/upload-image-user/:id",[auth.ensureAuth,md_upload.single('avatar')],UserController.uploadImage);
//podríamos comprobar el token del usuario
api.get("/image-user/:email/:image",UserController.getImage);
module.exports=api;
