

import mongoose from "mongoose";
import { required } from "zod/v4-mini";

const CommentSchema = new mongoose.Schema({

    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    post:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Post",
        required:true
    },
    content:{
        type:String,
        required:true
    },
    likes:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ],
    replies:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Comment"
        }
    ]

},{timestamps:true})


export default mongoose.model("Comment",CommentSchema);


