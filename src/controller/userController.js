const userModel = require("../model/userModel");
const AWS = require("aws-sdk");
const { uploadFile } = require("../controller/aws");
const bcrypt = require("bcrypt");
const dotenv= require("dotenv");
const jwt = require("jsonwebtoken")
dotenv.config()
const secreat= process.env.secreat;

const userSignUp = async function (req, res) {
  try {
    let files = req.files;
    let data = req.body;

    if (!data.email || !data.password || !data.phoneNo)
      return res
        .status(400)
        .send({ status: false, message: "All fields are mandatory" });

    let findDelicacy = await userModel.findOne({
      $or: [{ email: data.email }, { phoneNo: data.phoneNo }],
    });

    if (findDelicacy) {
      if (findDelicacy.email === data.email)
        return res
          .status(400)
          .send({ status: false, message: "Email already in use " });
      if (findDelicacy.phoneNo == data.phoneNo)
        return res
          .status(400)
          .send({ status: false, message: "PhoneNo already in use " });
    }

  if(data.profilePic){

    if (files && files.length > 0) {
      let uploadUrl = await uploadFile(files[0]);
      data.profilePic = uploadUrl;
    }
  }

    let bcryptPassword = await bcrypt.hash(
      data.password,
      data.password.length
    );
    data.password = bcryptPassword;

    await userModel.create(data);

    return res
      .status(201)
      .send({ status: true, message: "User created successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ status: false, message: error.message });
  }
};


const userSignIn =  async function (req,res){
     try {

        let { email, password } = req.body;

        let findUser = await userModel.findOne({ email: email });
      
        if (!findUser)
          return res.status(404).send({ status: false, message: "user not found" });
      
        let checkPassword = await bcrypt.compare(password, findUser.password);
        if (!checkPassword)
          return res
            .status(400)
            .send({ status: false, message: "Incorrect credential" });
      
        let token = jwt.sign({ userId: findUser._id.toString() },secreat );
        return res.status(200).send({ status: true, token: token })
           
     } catch (error) {
            return res.status(500).send({ status: false, message: error.message })
     }
    
}

////search user

const searchUser = async function(req,res){

    try{

    let data = req.query

    if(data.email || data.name){
        let search = new RegExp(data.email ||data.name,"i");

        let user = await userModel.find({$or:[{name:search},{email:search}]}).select({password:0,phoneNo:0});

        if(!user) return res.status(400).send({status:false,message:"No user found"})

        return res.status(200).send({status:true,message:"users",data:user})

    }
}catch(error){
    return res.status(500).send({ status: false, message: error.message })

}
}




module.exports = { userSignUp,userSignIn ,searchUser};
