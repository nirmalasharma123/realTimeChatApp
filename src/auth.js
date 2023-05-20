const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const secreat = process.env.secreat

const auth =  async function (req,res,next){

    try {
        
    
    let token = req.headers["x-api-key"]

    if(!token) return res.status(400).send("token must be present");
    console.log("yes")

    jwt.verify(token,secreat ,function(error,decodedToken){

        console.log("no")
        if(error) return res.status(400).send({status:false,Message:"why"})

        req.token = decodedToken.userId;

        console.log(req.token)
        next()
    })} catch (error) {
        console.log(error)

        return res.status(500).send({status:false,
            message:error.message})
        
    }

}

module.exports = {auth}