import User from "../models/UserModel.js"
import Post from "../models/PostModel.js"
import Comment from "../models/Comment.js";


export const followUser = async(req , res)=>{

    try{

        const userId = req.user.id;

        const{targetId} = req.body;

        if(userId === targetId)return res.status(400).json({message:"You cannot follow yourself"});

        const user = await User.findById(userId);
        const target = await User.findById(targetId);

        if(!target)return res.status(404).json({message:"Target user not found"});

        if(user.following.includes(targetId))return res.status(400).json({message:"Already following..."});

        user.following.push(targetId);
        target.followers.push(userId);

        await user.save();
        await target.save();

        console.log()


        return res.status(200).json({message:`You're now following ${target.name}`});
    }catch(err){

        console.error(err);
        return res.status(500).json({message:err.message});
    }
}


export const unfollowUser = async(req,res)=>{

    try{

        const userId = req.user.id;

        const{targetId} = req.body;

        const user = await User.findById(userId);
        const target = await User.findById(targetId);

        if(!target)return res.status(404).json({message:"Target User not found!!!"});

        user.following =   user.following.filter(id=> id.toString() !==targetId);
        target.followers = target.followers.filter(id => id.toString() !== userId);


        await user.save();
        await target.save();

        res.status(200).json({message:`You unfollowed ${target.name}`});
    }catch(err){
        console.error(err);
        return res.status(500).json({message:err.message});
    }
}



//like/unlike the post

export const likeUnlikePost = async(req,res)=>{

    try{
        
        const userId = req.user.id;
        const{postId} = req.body;

        const post = await Post.findById(postId);

        if(post.likes.includes(userId)){

            post.likes = post.likes.filter(id => id.toString() !== userId);
            await post.save();
            return res.status(200).json({message:"Post unliked"});
        }

        post.likes.push(userId);
        await post.save();
        return res.status(200).json({message:"Post liked"});
    }catch(err){
        console.error(err);
        return res.status(500).json({message:err.message});
    }
}


export const likeUnlikeComment = async(req,res)=>{

    console.log("like/unlike comment");
    try{
        const userId =req.user.id;

        const{commentId} = req.body;
        console.log(commentId);

        const comment = await Comment.findById(commentId);
        console.log(comment);

        if(!comment)return res.status(404).json({message:"Comment not found"});

        if(comment.likes.includes(userId)){
            comment.likes = comment.likes.filter(id=> id.toString() !== userId);
            await comment.save();
            console.log(comment.content);
            return res.status(200).json({message:"Comment unliked",content:comment.content});
        }

        comment.likes.push(userId);
        await comment.save();
        console.log(comment.content);
        return res.status(200).json({message:"Comment liked",content:comment.content});

        
    }catch(err){
        console.error(err);
        return res.status(500).json({message:err.message});
    }
}