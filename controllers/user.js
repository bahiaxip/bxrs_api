"use strict"

var User=require("../models/user");
var Visibility=require("../models/visibility");
var Follow = require("../models/follow");
//librería de encriptación para el pass
var bcrypt = require("bcrypt-nodejs");
var jwt = require("../services/jwt");
var path= require("path");
var fs = require("fs")

var controller= {
  home:function(req,res){
    return res.status(200).send({
      message:"Hola mundo desde el servidor NodeJS"
    })
  },
  saveUser: function(req,res){
    var params=req.body;
    var user = new User();
    var visibility = new Visibility();
    console.log(req.body);
    if(params.nick && params.email && params.password){
      user.name = params.nick;
      //no necesario asignarlo
      user.surname = null;
      user.nick = params.nick;
      user.email = params.email;
      //no necesario asignarlos
      user.phone = null;
      user.city = null;
    //falta user.role
      user.image = null;
      //visibility
      visibility.one=false;
      visibility.name=false;
      visibility.surname=false;
      visibility.email=false;
      visibility.phone=false;
      visibility.city=false;




      User.find({$or: [
          {email:user.email.toLowerCase()},
          {nick: user.nick.toLowerCase()}
        ]}).exec((err,users) => {
          if(err) return res.status(500).send({message: "Error en la petición de usuario"});

          if(users && users.length >= 1){
            return res.status(200).send({
              message: "El usuario ya existe"
            });
          }else{
            //comprobamos antes si los directorios ya existen con ese mismo correo y evitamos futuros conflictos
            if(fs.existsSync("./uploads/users/"+params.email)
               && fs.existsSync("./uploads/publications/"+params.email)){
                console.log("Los directorios de imágenes ya estaban creados y pueden generar conflictos");
                return res.status(200).send({message: "No se pudo crear el usuario, error al crear directorios"})
            }
            //creamos directorios individuales para imagen de perfil y publicaciones
            fs.mkdirSync('./uploads/users/'+params.email,{recursive:true});
            fs.mkdirSync('./uploads/publications/'+params.email,{recursive:true});

            bcrypt.hash(params.password,null,null,(err,hash) => {
              user.password=hash;
              user.save((err,userStored) => {
                if(err) return res.status(500).send({
                  message: "Error al guardar el usuario"
                })
                if(userStored){
                  visibility.user=user._id;
                  visibility.save((err,visibilityStored) => {
                    if(err) return res.status(500).send({message: "Error al guardar visibility"})

                    if(!visibilityStored) return res.status(200).send({message: "Usuario creado pero hubo un error con visibility"})

                    if(visibilityStored){
                      res.status(200).send({
                        user:userStored,
                        message: "Usuario creado correctamente"
                      })
                    }
                  })

                }else{
                  res.status(404).send({
                    message: "No se ha podido crear el usuario"
                  })
                }
              });
            });

          }
        })

    }else{
      res.status(200).send({
        message: "Faltan datos"
      });
    }
  },
  getTotalUsers:function(req,res){

    User.find((err,users) => {
      if(err) return res.status(500).send({message: "Error en la petición"});
      if(!users) return res.status(404).send({message: "No hay usuarios disponibles"});

      return res.status(200).send({
        users
      })
    }).sort("_id")
  },

  getUsers:function(req,res){
    var identityUserId=req.user.sub;
    var page=1;

    if(req.params.page){
      page= req.params.page;
    }
    var itemsPage = 4;
    const options = {
      page:page,
      limit:itemsPage,
      sort:{_id:"desc"}
    }

    User.paginate({_id:{$nin:identityUserId}},options,(err,users)=> {

      if(err) return res.status(500).send({message:"Error en la petición"});
      if(!users) return res.status(404).send({message: "No hay usuarios disponibles"});

      followUserIds(identityUserId).then((value) => {

        return res.status(200).send({
          users,
          users_following:value.following,
          users_followed:value.followed,
          visibility:value.visibilitied
        })
      })

    })

    //User.find().sort("_id").paginate(page,itemsPerPage,(err,users,total) => {
    /*User.find((err,users) => {
      if(err) return res.status(500).send({message: "Error en la petición"});
      if(!users) return res.status(404).send({message: "No hay usuarios disponibles"});

      return res.status(200).send({
        users
      })
    }).sort("_id")
    */

  },
  loginUser:function(req,res){
    var params=req.body;
    var email=params.email;
    var password = params.password;

    User.findOne({email:email},(err,user) => {
      if(err) return res.status(500).send({message: "Error en el inicio de sesión"});
      if(user){
        bcrypt.compare(password,user.password,(err,check) => {
          if(check){
            if(params.gettoken){
              return res.status(200).send({
                token:jwt.createToken(user)
              });
            }
            //por seguridad asignamos undefined
            user.password=undefined;
            return res.status(200).send({user})
          }else{
            return res.status(404).send({message: "El usuario no se ha podido identificar"});
          }
        });
      }else{
        return res.status(404).send({message: "El usuario no se ha podido identificar"});
      }
    });
  },

  getUser:function(req,res){
    var userId = req.params.id;
    console.log(userId);
    User.findById(userId,(err,user) => {
      if(err) return res.status(500).send({message: "Error en la petición"});
      if(!user) return res.status(404).send({message: "El usuario no existe"});
      //Visibility
      return res.status(200).send({
        user
      })
    });
  },

  updateUser:function(req,res){
    var userId=req.params.id;
    var update = req.body;
    //eliminamos pass por seguridad
    delete update.password;
    //si no existe autorización enviar un dato que indique al cliente
    //llamar al logout y de esa forma borramos el storage (storage.clear())
    if(userId != req.user.sub){
      return res.status(500).send({message: "No existe autorización para actualizar los datos"})
    }
  //falta revisar token...
//sería mejor utilizar findOne y comprobar solo el
    User.findOne({email:update.email.toLowerCase()}).exec((err,user) => {
      if(err) return res.status(500).send({message: "Error en la petición"});
      //var user_isset = false;





      /*
      users.forEach((user) =>{
        if(user && user._id != userId) user_isset=true;
      })
      */
      //if(user_isset) return res.status(404).send({message: "Los datos ya están en uso"});

      User.findByIdAndUpdate(userId,update,{new:true},(err,userUpdated) => {
        if(err) return res.status(500).send({message: "Error en la petición"});

        if(!userUpdated) return res.status(404).send({message: "No se ha podido actualizar el usuario"});
//es necesario revisar si se ha eliminado algún dato para desactivar la visibilidad
        console.log("user: ",user)

  //actualizar visibility
        Visibility.findOne({user:userId},(err,vis) =>{
          if(err) return res.status(500).send({message: "Error en la petición de visibilidad"});
          if(user.name=='' || user.name == null)
            vis.name = false;
          if(user.surname == '' || user.surname == null)
            vis.surname = false;
          if(user.phone == '' || user.phone == null)
            vis.phone = false;
          if(user.city == '' || user.city == null)
            vis.city = false;
          if(vis) console.log("vis: ",vis)
          vis.save((err,visStored) => {
            //necesario devolver la visibilidad
            console.log("visStored: ",visStored)
            return res.status(200).send({user:userUpdated,visibilityUser:visStored});
          })
          //if(vis) return res.status(404).send({message:"No existe visibilidad aun"})

        })



      });
    });
  },

  uploadImage: (req,res)=>{
    var userId = req.params.id;
    if(req.file){
      console.log(req.file)
      let splitname=path.basename(req.file.originalname).split('\.');
      //extensión
      let ext=splitname[1];


      let file_name=req.file.filename;
      console.log(file_name)
      //si no tiene autenticación eliminamos imagen
      if(userId != req.user.sub){
        console.log("Usuario no autenticado")
        return controller.removeFilesUploads(res,"./"+req.file.path,"No existe autorización para subir imágenes")
      }
      let mime=req.file.mimetype;

      if(mime !== "image/jpeg" && mime !== "image/png" && mime !== "image/gif"){
        console.log("formato distinto a jpg|png|gif: ",ext);
        return controller.removeFilesUploads(res,req.file.path,"El formato de la imagen no está permitido");
      }
      User.findByIdAndUpdate(userId,{image:{original:req.file.originalname,name:file_name,ext:ext}},{new:true},(err,userUpdated) => {
        if(err) return res.status(500).send({message: "No se ha podido actualizar el usuario al actualizar la imagen"});
        if(!userUpdated) return res.status(404).send({message: "Error en la petición"});
        console.log("llega al final")
        return res.status(200).send({user:userUpdated});
      });

      //return res.status(200).send({message:path.basename(req.file.originalname).split('\.')})
    }else{
      return res.status(200).send({message: "No se ha subido ningún archivo"});
    }
    //return res.status(200).send({message:"si llega"})
  },
  getImage: function(req,res){
    //para no tener que buscar la extensión en la db optamos por almacenar las imágenes
    //con la extensión en el server (multer no las almacena por defecto)
    if(req.params.email && req.params.image){
      var email = req.params.email;
      var image = req.params.image;

  //modificar por el correo o el id, el directorio
      var path_file = "./uploads/users/"+email+"/"+image;
      fs.exists(path_file,(exists) => {
        if(exists){
          console.log(path_file)
          res.sendFile(path.resolve(path_file));
        }
        else
          res.status(200).send({message: "No existe la imagen"});
      });
    }else{
      return res.status(200).send({message: "Faltan datos"})
    }
  },
  //elimina la imagen subida (si da error sacar fuera del objeto controller, como
  //la función followUserIds)
  removeFilesUploads:function(res,file_path,message){
    fs.unlink(file_path,(err)=>{
      return res.status(200).send({message: message})
    })
  }
}
async function followUserIds(user_id){

  var following = await Follow.find({user:user_id})
    .select({"_id":0,"__v":0,"user":0})
    .exec().then((follows) => {
      var followList = [];
      follows.forEach((follow) => {
        followList.push(follow.followed);
      });
      return followList;
    });

  var followed = await Follow.find({"followed":user_id})
    .select({"_id":0,"__v":0,"followed":0})
    .exec().then((follows) => {
      var followList = [];
      follows.forEach((follow) => {
        followList.push(follow);
      });
      return followList;
    });

  var visibilities = await Visibility.find()
    .exec().then((visib) => {
      var visibilityList = [];
      visib.forEach((vis) => {
        visibilityList.push(vis);
      });
      return visibilityList;
    })


  return {
    following:following,
    followed:followed,
    visibilitied:visibilities
  }
}

/*async function getVisibility(){
  console.log("llega")
  var userId = req.user.sub;
  Visibility.findOne({"user":userId},(err,visibility) => {
    if(err) return res.status(500).send({message: "Error al obtener visibility"});
    if(!visibility) return res.status(404).send({message: "No se encontró visibility del usuario"});
    return res.status(200).send({
      visibility
    })
  })
},
*/


module.exports=controller;
