
import { ta } from "zod/v4/locales";
import Post from "../models/PostModel.js";
import { generatePostMeta , populateComments} from "../utils/Helpers.js";


export const PostCreate = async({userId,title,content,slug,description,imageUrl})=>{

    try{
        console.log("service me userId",userId);
        const post = await Post.create({
            author:userId,
            title,
            content,
            slug,
            description,
            imageUrl
        });


        return post;
    }catch(err){
        console.error(err);
        return {error:err};
    }
}


export const getAllPostService = async(userId)=>{

    try{
        console.log("came in getALlposts");
        const posts = await Post.find({
            author:userId,
        })
        .sort({createdAt: -1})
        .select("title slug description imageUrl createdAt tags comments likes")
        .populate("comments");

        for(let post of posts){
            post.comments = await populateComments(post.comments);
        }

        if(posts.length ==0)return [];
        

        // console.log(posts);
        return posts;
    }catch(err){
        console.error(err);
        return {error:err.message};
    }
}


export const UpdatePostService= async({title,content,tags,imageUrl},{post})=>{

    try{

        // console.log("before updation: ",post);
        if(title || content){
            const{slug:newSlug,description} = generatePostMeta(title ||post.title,content||post.content);
            post.slug = newSlug;
            post.description  = description;
            if(title) post.title = title;
            if(content)post.content = content;
        }

        if(tags) post.tags = tags;
        if(imageUrl) post.imageUrl = imageUrl;

        await post.save();

        // console.log("updated post: ",post);

        return post;
    }catch(err){
        console.error(err);
        return {error:err.message};
    }
}


export const OnePostService = async({slug})=>{

    try{

        const post = await Post.findOne({slug})
            .select("title slug content description imageUrl likes createdAt author comments")
            .populate("author","name email");


        if(!post)return {error:"Post not found"};

        if(post.comments && post.comments.length > 0){

            post.comments  = await populateComments(post.comments);
        }

        return post;
    }catch(err){
        console.error(err);
        return {error:err.message};
    }
}