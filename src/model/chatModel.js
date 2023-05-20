const mongoose = require("mongoose");

const chatModel =  new mongoose.Schema({

    chatName:{
        type:String,
        trim:true
    },
    users:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    }],
    isGroupChat:{
        type:Boolean,
        default:false
    },
    latestMessages:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"message"
    },
    isDeleted:{
        type:Boolean,
        default:false
    },
    groupAdmin:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    }
},{
    timestamps:true

    }

);
module.exports= mongoose.model("chat",chatModel)