"use strict"

var moment = require("moment");
var Publication = require("../models/publication");
var User = require("../models/user");
var Follow=require("../models/follow");
var path= require("path");
var fs = require("fs");

var controller = {
  addPublication: function(req,res){
    var params = req.body;

    if(!params.text)
      return res.status(200).send({message: "Text not exist"});
    var publication = new Publication();
    console.log(req.body)
    publication.text = params.text;
    publication.image=null;
    publication.user = req.user.sub;
    publication.created_at = moment().unix();
    publication.save((err,publicationStored) => {
      if(err)
        return res.status(404).send({message: "error storing publication"});
      if(!publicationStored)
        return res.status(404).send({message: "publication hasn't been stored"})
      return res.status(200).send({publication:publicationStored});
    })
  },

  getPublications:function(req,res){

    var page=1;
    if(req.params.page)
      page=req.params.page;

    Follow.find({user:req.user.sub}).populate("followed").exec((err,follows) =>{
      if(err) return res.status(500).send({message: "Error al obtener los seguidores"});

      var followList = [];
      follows.forEach((follow)=>{
        followList.push(follow.followed);
      });
      followList.push(req.user.sub);
      var itemsPage=3;
      var options={
        page:page,
        limit:itemsPage,
        sort:{created_at:"desc"},
        populate:'user'
      }

      Publication.paginate({user:{"$in":followList}},options,(err,publications) =>{
        if(err) return res.status(500).send({message: "Error al devolver las publicaciones"});
        if(!publications) return res.status(404).send({message: "No hay publicaciones"});

        return res.status(200).send({
          publications:publications
        });
      })
    })
    //Publication.find((err,publications) => {
      /*
    Publication.paginate({user:user},options,(err,publications) => {
      if(err)
        return res.status(500).send({message: "Error al solicitar publicaciones"})
      if(!publications)
        return res.status(404).send({message: ""})
      return res.status(200).send({
        publications
      })
    })
    */
  },
  //últimas publicaciones a partir de una fecha de los usuarios que sigue el
  //usuario logueado
  getLastPublications:function(req,res){
    var lastPubCreatedAt = req.params.created;
    Follow.find({user:req.user.sub}).populate("followed").exec((err,follows) => {
      if(err) return res.status(500).send({message: "Error al obtener los seguidores"});
      var followList = [];
      follows.forEach((follow) => {
        followList.push(follow.followed);
      });
      followList.push(req.user.sub);
      Publication.find({user:{"$in":followList},created_at:{$gt:lastPubCreatedAt}},(err,publications) => {
        if(err) return res.status(500).send({message: "Error en la petición"});
        if(!publications) return res.status(404).send({message: "No existen publicaciones"});
        return res.status(200).send({ publications});
      })
    })
  },
  //ultimas publicaciones a partir de una fecha de una publicación
  /*
  getLastPublications:function(req,res){
    var lastPubCreatedAt = req.params.created;
    console.log(lastPubCreatedAt);

    Publication.find({'created_at':{$gt:lastPubCreatedAt}},(err,publications) => {
      if(err) return res.status(500).send({message: "Error en la petición"});
      if(!publications) return res.status(404).send({message: "No existen publicaciones"});
      return res.status(200).send({ publications});
    })
  },
  */
  updatePublication:function(req,res){
    var publicationId=req.params.id;
    console.log("publicationId: ",publicationId);
    var publication=req.body;
    console.log("publicacion: ",publication)
    console.log(publication)
    Publication.findByIdAndUpdate(publicationId,{text:publication.text},{new:true},(err,publicationUpdated)=> {
      if(err) return res.status(500).send({message: "Error con la actualización de la publicación"})
        return res.status(200).send({
          publication:publicationUpdated
        })
    })
  },
//necesario borrar imagen si es que existe
  deletePublication: function(req,res){
    var publicationId=req.params.id;
    /*
    Publication.find({"user":req.user.sub,"_id":publicationId}).remove(err=>{
      if(err) return res.status(500).send({message: "Error al borrar la publicación"});
      return res.status(200).send({publication: "Publicación eliminada"})
    });
    */
    Publication.findOne({"user":req.user.sub,"_id":publicationId},(err,publication) => {
      if(err) return res.status(500).send({message: "Error al borrar publicación"});
      if(!publication) return res.status(404).send({message: "No existe la publicación"})

      if(publication.image && publication.image.name){
        var path_file = "./uploads/publications/"+req.user.email+"/"+publication.image.name;
        fs.exists(path_file,(exists) => {
          if(exists){
            console.log("la ruta: ",path_file)
            //con unlink da error, probablemente requiera then()
            fs.unlinkSync(path_file);
          }
        });
      }
      publication.remove(err => {
        if(err) return res.status(500).send({message: "No se pudo eliminar la publicación"});
          return res.status(200).send({publication: "Publicación eliminada"})
        })
    })

  },

  uploadImage:function(req,res){
    var publicationId=req.params.id;
    if(req.file){
      let splitname=path.basename(req.file.originalname).split('\.');
      //extensión
      let ext=splitname[1];
      let file_name=req.file.filename;
      let userId;

      Publication.findById(publicationId,(err,publication) => {
        if(err) return res.status(500).send({message: "Error obteniendo publicación asociada"});
        if(!publication) return res.status(404).send({message: "No aparece la publicación"});

        userId=publication.user;

        if(userId != req.user.sub){
          return res.status(500).send({message: "No existe autorización"})
        }

        //comprobación de extensión aceptada
      let mime=req.file.mimetype;

      if(mime !== "image/jpeg" && mime !== "image/png" && mime !== "image/gif"){
        console.log("formato distinto a jpg|png|gif: ",ext);
        return removeFilesUploads(res,req.file.path,"El formato de la imagen no está permitido");
      }


        Publication.findByIdAndUpdate(publicationId,{image:{original:req.file.originalname,name:file_name,ext:ext}},{new:true},(err,publicationUpdated) => {
          if(err) return res.status(500).send({message: "Error actualizando imagen de publicación"});
          return res.status(200).send({
            publicationUpdated
          })
        })


      })
    }else{
      return res.status(200).send({message: "llega"})
    }
  },

  getImage:function(req,res){
    if(req.params.email && req.params.image){
      var email = req.params.email;
      var image = req.params.image;

      var path_file = "./uploads/publications/"+email+"/"+image;
      fs.exists(path_file,(exists) => {
        if(exists){
          res.sendFile(path.resolve(path_file));
        }else
          res.status(200).send({message:"No existe la imagen"})
      })
    }else{
      return res.status(200).send({message: "Faltan datos"});
    }
  }
}

function removeFilesUploads(res,file_path,message){
  fs.unlink(file_path,(err)=>{
    return res.status(200).send({message: message})
  })
}
module.exports = controller;
