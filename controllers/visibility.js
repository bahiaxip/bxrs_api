"use strict"

var Visibility = require("../models/visibility");

var controller = {

  onVisibility:function(req,res){
    var userId = req.user.sub;
    var update = req.body;
    console.log(update);
    if(userId && update){
      console.log(update)
      if(update.name==true || update.surname==true || update.email==true
        || update.phone==true || update.city==true || update.image==true)

        update.one=true;
      else
        update.one=false;
      /*
      Visibility.find({user:userId},(err,onVisibility) => {
        if(err) return res.status(500).send({message: "Error en la petición"});
        if(onVisibility)
          Visibility.save({name:})
          return res.status(200).send({
            message: "Se creo la visibilidad",
            data: onVisibility
          })
      })
      */

      Visibility.findOneAndUpdate({user:userId},update,(err,updated) => {
        if(err) return res.status(500).send({message: "Hubo un error"});
        if(!updated) return res.status(404).send({message: "No existe esa visibilidad"});
        return res.status(200).send({message: "Existe respuesta"});
      })
    }else{
      return res.status(200).send({message: "Faltan datos"});
    }

  },

  getVisibility:function(req,res){
    //console.log("llega")
    var userId = req.user.sub;
    Visibility.findOne({"user":userId},(err,visibility) => {
      if(err) return res.status(500).send({message: "Error al obtener visibility"});
      if(!visibility) return res.status(404).send({message: "No se encontró visibility del usuario"});
      return res.status(200).send({
        visibility
      })
    })
  },

  offVisibility: function(req,res){

  }
}

module.exports = controller;
