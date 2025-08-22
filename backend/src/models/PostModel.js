import mongoose from "mongoose";
import { required } from "zod/v4-mini";



const PostSchema = new mongoose.Schema({
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    title:{
        type:String,
        required:true
    },
    slug:{
        type:String,
        required:true,
        unique:true
    },
    content: { type: String, required: true },
    description:{
        type:String,
        default:""
    },
    tags:[
        {
            type:String,
        }
    ],
    likes:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ],
    comments:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Comment"
        }
    ],
    imageUrl:{
        type:String,
        default:""
    }
},{timestamps:true})

export default mongoose.model("Post",PostSchema)