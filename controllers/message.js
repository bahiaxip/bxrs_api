"use strict";

var Message = require("../models/message");
var moment = require("moment");
var controller = {

  saveMessage: function(req,res){
    var params = req.body;
    console.log(params)
    if(!params.text || !params.receiver)
      return res.status(500).send({message: "Faltan datos"});
    var message = new Message();
    message.emitter = req.user.sub;
    message.receiver = params.receiver;
    message.text = params.text;
    message.created_at = moment().unix();
    message.viewed = "false";

    message.save((err,messageStored) => {
      if(err) return res.status(500).send({message: "Error en la petición"});
      if(!messageStored) return res.status(404).send({message: "Error al guardar mensaje"});
      return res.status(200).send({message:messageStored})
    })
  },
  //para más seguridad distinguimos si es received o sended
  //y sea el que sea, debe coincidir con el id del token, pero....
  //no se puede hacer ya que puede ser opcional, pero primero toma el primero,
  //es decir, no puedo enviar el segundo sin enviar el primero, por tanto, anulado,
  //se mantiene solo el token y se comprueba que el received o el sended coincidan
  //con el id del token
  deleteMessage:function(req,res){
    /*
    if(req.params.sended || req.params.received){
      let type="";
      if(req.params.sended){
        var messageId = req.params.sended;
        type="sended";
      }else{
        var messageId = req.params.received;
        type="received";
      }
      */
    if(req.params.id){
      var messageId=req.params.id;
      var userId = req.user.sub;
      console.log(messageId);
      console.log(userId);
      Message.findOne({$or:
      [
        {"receiver":userId},{"emitter":userId}
      ],"_id":messageId},(err,message)=> {

        if(err) return res.status(500).send({message: "Error en la petición"})
        if(!message) return res.status(404).send({message: "No se encuentra el mensaje"})
        message.remove(err=> {
          if(err) return res.status(500).send({message: "No se pudo borrar el mensaje"})
          return res.status(200).send({
            message: "El mensaje ha sido eliminado",
            status:"success"
          });
        });

      })
    }else{
      return res.status(500).send({message: "Faltan datos"});
    }



  },

  updateReceivedMessage:function(req,res){
    var messageId=req.params.id;
    Message.findByIdAndUpdate(messageId,{viewed:'true'},{new:true},(err,messageUpdated) => {
      if(err) return res.status(500).send({message: "Error en la petición"});
      return res.status(200).send({message: messageUpdated})
    });
  },

  getReceivedMessages:function(req,res){
    var userId=req.user.sub;

    Message.find({"receiver":userId}).populate("emitter","nick").sort({created_at:"desc"}).exec((err,messages) =>{
      if(err) return res.status(500).send({message: "Error en la petición del mensaje"});
      if(!messages) return res.status(404).send({message: "No existen mensajes"});

      return res.status(200).send({
        messages
      })
    })
  },

  getEmmittedMessages:function(req,res){
    var userId = req.user.sub;

    Message.find({"emitter":userId}).populate("emitter receiver","nick").sort({created_at:"desc"}).exec((err,messages) => {
      if(err) return res.status(500).send({message: "Error en la petición"});
      if(!messages) return res.status(404).send({message: "No existen mensajes"});
      return res.status(200).send({
        messages
      })
    })
  }

}

module.exports=controller;

