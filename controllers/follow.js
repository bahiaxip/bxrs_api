"use strict"

var User = require("../models/user");
var Follow = require("../models/follow");

var controller = {
  saveFollow: function(req,res){

    var params = req.body;
    var follow = new Follow();

    if(req.user.sub && params.followed){
      follow.user = req.user.sub;
      follow.followed = params.followed;

      Follow.find({user:req.user.sub,followed:params.followed},(err,existedFollow)=>{
        if(err) return res.status(500).send({message: "Hubo un error"});
        if(existedFollow && existedFollow.length >=1){
          return res.status(200).send({message: "El usuario ya se encuentra siguiéndolo",status:"existed"});
        }else{
          follow.save((err,followStored) => {
            if(err) return res.status(500).send({message: "Error al guardar el seguimiento"});
            if(!followStored) return res.status(404).send({message: "El seguimiento no se ha guardado"});
            return res.status(200).send({follow:followStored});
          });
        }
      })
    }else{
      return res.status(200).send({message: "Faltan datos en el envío"})
    }
  },

  deleteFollow:function(req,res){
    var userId = req.user.sub;
    var followId = req.params.id;

    Follow.find({"user":userId,"followed":followId}).deleteOne(err =>{
      if(err) return res.status(500).send({message: "Error al dejar de seguir"})
        return res.status(200).send({message: "Se ha dejado de seguir al usuario"})
    })
  }
}

module.exports = controller;
