const express= require("express");
const router = express.Router();
const userController = require("../controller/userController");
const chatController = require("../controller/chatController");
const auth = require("../auth");
const {sendMessage,getOneMessage} = require("../controller/messageController")


router.post("/signUp",userController.userSignUp);
router.post("/login",userController.userSignIn);
router.get("/searchUser",userController.searchUser)


router.post("/chat", auth.auth ,chatController.createChat);
router.get("/allChats", auth.auth,chatController.fetchChats);
router.post("/createGroupChat",auth.auth,chatController.createGroupChat);
router.put("/renameGroup",auth.auth,chatController.reNameGroup);
router.post("/addMember",auth.auth,chatController.addMember);
router.post("/removeMember",auth.auth,chatController.removeMember);
router.post("/message",auth.auth,sendMessage);
router.get("/oneChat/:chatId",auth.auth,getOneMessage)



module.exports= router