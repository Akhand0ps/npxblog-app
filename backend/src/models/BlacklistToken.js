


import mongoose from "mongoose";


const BlackTokenSchema = new mongoose.Schema({

    token:{
        type:String,
        required:true,
        unique:true,
        index:true,
        expires:"1d"

    }
},{timestamps:true})


export default mongoose.model("BlackListToken",BlackTokenSchema);