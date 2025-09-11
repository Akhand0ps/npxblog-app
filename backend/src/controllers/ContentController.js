
import { allCommentsIds, generatePostMeta } from "../utils/Helpers.js";
import { PostCreate , getAllPostService ,UpdatePostService,OnePostService} from "../services/PostService.js";
import Post from "../models/PostModel.js";
import Comment from "../models/Comment.js";

export const CreatePost = async(req,res)=>{

    console.log("came in createpost")
    try{

        const userId = req.user.id;

        //slug nikal, description nikal , likes default daal de,comment default daal
        const {title,content,tags,imageUrl} = req.body;

        const {slug , description} = generatePostMeta(title,content);

        const post = await PostCreate({
            userId,
            title,
            content,
            tags,
            slug,
            description,
            imageUrl
        });


        if(post.error) return res.status(500).json({error:post.error});

        return res.status(200).json({message:"Post created",post});

    }catch(err){
        console.error(err);
        
        return res.status(500).json({error:err.message});
    }
}



export const getAllPosts = async(req,res)=>{

    try{

        const userId = req.user.id;


        const posts = await getAllPostService(userId);

        if(posts.error) return res.status(500).json({error:posts.error});

        console.log("post get posts in controller: ",posts);

        return res.status(200).json(posts);
    }catch(err){
        
        console.error(err)
        return res.status(500).json({error:err.message});
    }
}


export const updatePost = async(req,res)=>{

    try{

        const userId = req.user.id;

        const {slug} = req.params;


        console.log("slug: ",slug);
        const {title,content,tags,imageUrl} = req.body;

        const post = await Post.findOne({slug});

        if(!post)return res.status(404).json({message:"Post not found"});

        if(post.author.toString() !== userId) return res.status(403).json({message:"You're not allowed to update this post"});

        //ab check title ya content me kya change hua hai . jo bhi hua hai woh chnage krde ||op ka use krke. 
        //agr title chnage hua hai toh new slug bnega yaad rk 

        const newpost = await UpdatePostService({
            title,
            content,
            tags,
            imageUrl
        },{post});

        if(newpost.error)return res.status(500).json({message:newpost.error});

        console.log(newpost);

        return res.status(200).json({message:"Post updated successfully",newpost});
    }catch(err){

        console.error(err);
        return res.status(500).json({message:err.message});
    }
}



export const deletePost = async(req,res)=>{

    try{

        const userId = req.user.id;

        const {slug} = req.params;

        const post = await Post.findOne({slug});

        if(!post)return res.status(404).json({message:"Post not found"});

        if(post.author.toString() !==userId)return res.status(403).json({message:"You're not allowed to do this action"});

        
        if(post.comments && post.comments.length > 0){

            const commentIds = await allCommentsIds(post.comments.map(c=>c._id));
            await Comment.deleteMany({_id:{$id:commentIds}});
        }
        await post.deleteOne();

        return res.status(200).json({message:"Post deleted successfully"});
    }catch(err){
        console.error(err);
        return res.status(500).json({message:"INTERNAL SERVER ERROR"});
    }
}



export const getOnePost = async(req,res)=>{

    try{

        // const userId = req.user.id;
        const {slug} = req.params;

        const post = await OnePostService({slug});

        if(post.error) return res.status(404).json({message:post.error});

        return res.status(200).json({message:post});
    }catch(err){
        console.error(err);
        return res.status(500).json({message:err.message});
    }
}




export const getFeed = async(req,res)=>{

    try{
        const {lastId,limit=10} = req.query;

        const query = lastId ? {_id:{$lt:lastId}} : {};

        const posts = await Post.find(query)
            .sort({_id:-1})
            .limit(Number(limit))
            .populate("author","name avatar bio")
        
        res.json({
            posts,
            hashMore: posts.length === Number(limit)
        });
    }catch(err){

        console.error(err);
        res.status(500).json({message:"INTERNAL SERVER ERROR",error:err.message})
    }
}

// Public: get posts by user id
export const getPostsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const posts = await Post.find({ author: userId })
            .sort({ createdAt: -1 })
            .select("title slug description imageUrl createdAt likes comments author")
            .populate("author", "name avatar");

        return res.status(200).json({ posts });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "INTERNAL SERVER ERROR" });
    }
}