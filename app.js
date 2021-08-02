const express = require("express");
var bodyParser = require("body-parser");
var app=express();

//cargar rutas
var user_routes = require("./routes/user");
var publication_routes = require("./routes/publication");
var follow_routes = require("./routes/follow");
var visibility_routes = require("./routes/visibility");
var messages_routes = require("./routes/message");

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//Configuración de cabeceras y CORS
//es un middleware que reduce los problemas en peticiones http
//el * es modificable con las urls correspondientes.
app.use((req,res,next) =>{
  res.header("Access-Control-Allow-Origin","*");
  res.header("Access-Control-Allow-Headers", "Authorization, X-API-KEY, Origin, X-Requested-With,Content-Type,Accept,Access-Control-Allow-Request-Method");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS,PUT,DELETE");
  res.header("Allow","GET,POST,OPTIONS,PUT,DELETE");
  next();
});

//rutas
app.use("/",user_routes);
app.use("/",publication_routes);
app.use("/",follow_routes);
app.use("/",visibility_routes);
app.use("/",messages_routes);
module.exports=app;
