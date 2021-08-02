"use strict"

var mongoose = require("mongoose");
var app = require("./app");
var port = 3389;

mongoose.Promise=global.Promise;
mongoose.connect("mongodb://localhost:27017/ionicRRSS",{useNewUrlParser:true, useUnifiedTopology:true,useFindAndModify:false})
  .then(()=> {
    console.log("La conexión a mongoDB se ha realizado correctamente");
    app.listen(port,()=>{
      console.log("api de ionicRRSS escuchando en el puerto 3389");
    });
  })
  .catch(err => console.log("Error: ",err));
