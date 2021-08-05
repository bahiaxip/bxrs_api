"use strict"

var express=require("express");
var MessageController = require("../controllers/message");
var auth = require("../middleware/auth");
var api=express.Router();

api.post("/message",auth.ensureAuth,MessageController.saveMessage);
api.get("/received-messages/:page?",auth.ensureAuth,MessageController.getReceivedMessages);
api.get("/sended-messages/:page?",auth.ensureAuth,MessageController.getEmmittedMessages);
//no posible, siempre toma el primero, para mandar el segundo es necesario enviar el primero
//api.delete("/message/:sended?/:received?",auth.ensureAuth,MessageController.deleteMessage);
api.delete("/message/:id",auth.ensureAuth,MessageController.deleteMessage);
api.put("/message/:id",MessageController.updateReceivedMessage);
module.exports=api;
