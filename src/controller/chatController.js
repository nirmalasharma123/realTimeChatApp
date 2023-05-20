const chatModel = require("../model/chatModel");
const userModel = require("../model/userModel");

const createChat = async function (req, res) {
  try {
    let userId = req.body.userId;

    if (!userId) {
      return res
        .status(400)
        .send({ status: false, message: "userId should be present" });
    }

    let findSender = await userModel.findOne({ _id: userId });
    if (!findSender)
      return res.status(400).send({ status: false, message: "No user found" });

    let findUser = await chatModel
      .find({ isGroupChat: false, users: { $in: [req.token, userId] } })
      .populate("users", { password: 0, phoneNo: 0 })
      .populate({
        path: "latestMessages",
        populate: {
          path: "sender",
          select: "name profilePic,email,-password",
        },
      });

    if (findUser.length == 0) {
      let obj = {};
      obj.chatName = findSender.name;
      obj.isGroupChat = false;
      obj.users = [req.token, userId];

      let userChat = await chatModel.create(obj);

      return res
        .status(201)
        .send({ status: false, message: "chats", data: userChat });
    }
    return res.status(200).send({ status: true, data2: findUser });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: error.message });
  }
};

/// fetch chats

const fetchChats = async function (req, res) {
  try {
    let getChats = await chatModel
      .find({ users: { $in: req.token } })
      .populate("users", { password: 0, phoneNo: 0 })
      .populate({
        path: "latestMessages",
        populate: {
          path: "sender",
          select: "name profilePic,email,-password",
        },
        select:"context sender"
      })
      .sort({ updatedAt: -1 });

    return res
      .status(200)
      .send({ status: true, message: "chats", data: getChats });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

////create group chat

const createGroupChat = async function (req, res) {
  try {
    let data = req.body;

    if (!data.chatName && data.users)
      return res.status(400).send({
        status: false,
        message: "Group chat contain users and chat name",
      });

    if (data.users.length < 2)
      return res.status(400).send({
        status: false,
        message: "Group chat contain  at least 2 people ",
      });

    data.users.push(req.token);
    data.groupAdmin = req.token;
    data.isGroupChat = true;

    let group = await chatModel.create(data);

    let findGroup = await chatModel
      .find({ _id: group._id })
      .populate("users", { password: 0, phoneNo: 0 })
      .populate({
        path: "latestMessages",
        populate: {
          path: "sender",
          select: "name profilePic,email,-password",
        },
      })
      .populate("groupAdmin", { name: 1 })
      .sort({ updatedAt: -1 });

    return res
      .status(200)
      .send({ status: true, message: "Group Chat", data: findGroup });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

/// reName group ;

const reNameGroup = async function (req, res) {
  try {
    let data = req.body;

    if (!data.chatId && data.chatName)
      return res
        .status(400)
        .send({ status: false, message: "field's  are mandatory" });

    let findChat = await chatModel.findOne({
      _id: data.chatId,
      isGroupChat: true,
    });
    if (!findChat)
      return res.status(400).send({ status: false, message: "NO chat found" });

    console.log(findChat.groupAdmin);

    if (findChat.groupAdmin.toString() !== req.token)
      return res.status(400).send({
        status: false,
        message: "Only group admin can change the name ",
      });

    let UpdateChat = await chatModel
      .findOneAndUpdate({ _id: data.chatId }, { chatName: data.chatName })
      .populate("users", { password: 0, phoneNo: 0 })
      .populate({
        path: "latestMessages",
        populate: {
          path: "sender",
          select: "name profilePic,email,-password",
        },
      })
      .populate("groupAdmin", { name: 1 })
      .sort({ updatedAt: -1 });

    return res
      .status(200)
      .send({ status: true, message: "Chat name updated", data: UpdateChat });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

//////      add       //////            user              ///////////////////////////////////////////////////;

const addMember = async function (req, res) {
  const data = req.body;

  if (!data)
    return res
      .status(400)
      .send({ status: false, message: "Please provide details" });

  let findUsers = await userModel.find({ _id: data.users });
  if (!findUsers)
    return res.status(400).send({ status: false, message: "NO user found" });

  let findChat = await chatModel.findOne({ _id: data.chatId });

  if (findChat.groupAdmin.toString() != req.token)
    return res
      .status(403)
      .send({ status: false, message: "You are not authorize for this" });

  if (!findChat)
    return res
      .status(400)
      .send({ status: false, message: "No chat Group found" });

  if (findChat.users.includes(data.user))
    return res.status(400).send({
      status: false,
      message: "These users are already present in the group",
    });

  let addMembers = await chatModel
    .findOneAndUpdate(
      { _id: data.chatId },
      { $push: { users: data.user } },
      { new: true }
    )
    .populate("users", { password: 0, phoneNo: 0 })
    .populate({
      path: "latestMessages",
      populate: {
        path: "sender",
        select: "name profilePic,email,-password",
      },
    })
    .populate("groupAdmin", { name: 1 })
    .sort({ updatedAt: -1 });

  return res.status(200).send({ status: true, data: addMembers });
};


//// remove from group

const removeMember = async function(req,res){

  const data = req.body;

  if (!data)
    return res
      .status(400)
      .send({ status: false, message: "Please provide details" });

  let findUsers = await userModel.find({ _id: data.user});
  if (!findUsers)
    return res.status(400).send({ status: false, message: "NO user found" });

  let findChat = await chatModel.findOne({ _id: data.chatId });

  if (findChat.groupAdmin.toString() != req.token)
    return res
      .status(403)
      .send({ status: false, message: "You are not authorize for this" });

  if (!findChat)
    return res
      .status(400)
      .send({ status: false, message: "No chat Group found" });

  let removeMembers = await chatModel
    .findOneAndUpdate(
      { _id: data.chatId },
      { $pull: { users: { $in: data.user } } },
      { new: true }
    )
    .populate("users", { password: 0, phoneNo: 0 })
    .populate({
      path: "latestMessages",
      populate: {
        path: "sender",
        select: "name profilePic,email,-password",
      },
    })
    .populate("groupAdmin", { name: 1 })
    .sort({ updatedAt: -1 });

  return res.status(200).send({ status: true, data: removeMembers })

}
module.exports = {
  createChat,
  fetchChats,
  createGroupChat,
  reNameGroup,
  addMember,
  removeMember
};
