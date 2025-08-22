
import mongoose from "mongoose";



const UserSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },

    password:{
        type:String,
        required:true
    },
    bio:{
        type:String,
        required:false
    },

    avatar:{
        type:String,
        default:"",
        required:false
    },
    following:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ],

    followers:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }   
    ],

    likedPost:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Post"
        }
        
    ]


},{timestamps:true})





export default mongoose.model("User",UserSchema);


