"use strict"

var jwt = require("jwt-simple");
var moment = require("moment");
var secret = "podemos_generar_un_código_random_en_lugar_de_esto";
exports.createToken=function(user){
  var payload = {
    sub: user._id,
    name:user.name,
    nick:user.nick,
    email:user.email,
    image:user.image,
    iat: moment().unix(),
    exp: moment().add(2,"days").unix()
  };

  return jwt.encode(payload,secret);
}
