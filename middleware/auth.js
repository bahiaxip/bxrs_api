"use strict"

var moment = require("moment");
var jwt = require("jwt-simple");
var secret_key = "podemos_generar_un_código_random_en_lugar_de_esto";

exports.ensureAuth = function(req,res,next){
  if(!req.headers.authorization){
    return res.status(403).send({message: "not exists authentication "});
  }
  var token = req.headers.authorization.replace(/['"]+/g,'');

  try{
    var payload = jwt.decode(token,secret_key);

    if(payload.exp <= moment().unix()){
      return res.status(401).send({
        message: "expirated authentication"
      });
    }
  }catch(ex){
    return res.status(404).send({
      message: "not valid authentication",
      status:"401"
    })
  }
  req.user = payload;
  next();
}
