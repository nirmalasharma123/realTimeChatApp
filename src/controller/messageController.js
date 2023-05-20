const chatMOdel = require("../model/chatModel");
const messageModel = require('../model/messageModel');
const userMOdel = require('../model/userModel');

const sendMessage = async function(req, res) {
    
    let data = req.body;
        data.sender = req.token
    if (!data.chat || !data.context) {
        return res.status(400).send({ status: false, message: "Fields are mandatory" })};

        let createMessage = await messageModel.create(data);
        createMessage = await createMessage.populate("sender", "name profilePic");
        createMessage = await createMessage.populate("chat")
        createMessage = await userMOdel.populate(createMessage, {
      path: "chat.users",
      select: "name profilePic email",
    });

    await chatMOdel.findByIdAndUpdate(data.chat, { latestMessage: createMessage });
  return res.status(200).send({ status: true, message: "Message sent", data: createMessage});

}


const getOneMessage =  async function(req,res){

    let id = req.params.chatId;

    let findmessage = await messageModel.findOne({chat:id}).populate("sender",{name:1,profilePIc:1,email:1}).populate("chat");
    if(!findmessage) res.status(404).send({status:false,message:"no message found"});

    return res.status(200).send({status:true,message:"chat",data:findmessage})

}

module.exports = { sendMessage ,getOneMessage};

