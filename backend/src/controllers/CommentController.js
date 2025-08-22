
import Post from "../models/PostModel.js";
import { allCommentsIds, populateComments } from "../utils/Helpers.js";
import Comment from "../models/Comment.js";


export const createComment = async(req,res)=>{

    console.log("Camme in create comment");
    try{
        console.log("id",req.user.id);

        const userId = req.user.id;


        const{content,parentCommentId} = req.body;

        const {slug} = req.params;


        if(!content)return res.status(400).json({message:"Content is required"});

        const post = await Post.findOne({slug});

        if(!post)return res.status(404).json({message:"Post not found"});


        const newComment = new Comment({
            author:userId,
            post:post._id,
            content,
            replies:[],
        });

        //agr comment ek reply hai toh
        if(parentCommentId){

            const parent = await Comment.findById(parentCommentId);
            if(!parent)return res.status(404).json({message:"Parent comment not found"});
            parent.replies.push(newComment._id);

            await parent.save();
        }
        else{

            //agr top-level 

            post.comments.push(newComment._id);
            await post.save();
        }

        
        await newComment.save();
        console.log("comment done");

        return res.status(201).json({message:"Comment added",comment:newComment});
    }catch(err){
        
        console.error(err);

        return res.status(500).json({message:"INTERNAL SERVER ERROR"});
    }

}


export const getCommentsByPost = async(req,res)=>{

    try{
        const {slug} = req.params;

        const post = await Post.findOne({slug})
            .populate("comments");
        
        if(!post)return res.status(404).json({message:"Post not found!!"});

        const comments = await populateComments(post.comments);
        return res.status(200).json(comments);
    }catch(err){
        console.error(err);
        return res.status(500).json({message:"INTERNAL SERVER ERROR"});
    }
}


export const deleteComment = async(req,res)=>{

    try{
        const userId = req.user.id;

        const{commentId} = req.params;

        const comment = await Comment.findById(commentId);
        if(!comment)return res.status(404).json({message:"Comment not found"});

        console.log("comment author: ",comment.author.toString());
        console.log("userId: ",userId);
        if(comment.author.toString() !== userId){
            return res.status(403).json({message:"You're not allowed to do this action"});
        }


        if(comment.replies && comment.replies.length >0){
            
            const commentsids = allCommentsIds(comments.replies.map(c=>c._id));

            await Comment.deleteMany({_id:{$in:commentsids}});
        }

        await comment.deleteOne();

        return res.status(200).json({message:"Comment deleted successfully"});
    }catch(err){
        console.error(err);
        return res.status(500).json({message:"INTERNAL SERVER ERROR"});
    }
}