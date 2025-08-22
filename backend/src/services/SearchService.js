
import Post from "../models/PostModel.js"


export const searchPosts = async({query,page=1,limit=10,filters={}})=>{


    try{

        const skip = (page-1)*limit;
        const searchCriteria = {

            $or:[
                {title:{$regex:query,$options:'i'}},
                {content:{$regex:query,$options:'i'}},
                {description:{$regex:query,$options:'i'}},
                {tags:{$in:[new RegExp(query,'i')]}}
            ]
        }
        if(filters.author){

            searchCriteria.author = filters.author;
        }

        if(filters.tags && filters.tags.length>0){
            searchCriteria.tags = {$in:filters.tags};
        }


        const posts = await Post.find(searchCriteria)
            .populate("author",'name avatar')
            .select("title description slug imageUrl createdAt tags likes")
            .sort({createdAt:-1})
            .skip(skip)
            .limit(limit);
        
        const totalPosts = await Post.countDocuments(searchCriteria);

        const totalPages = Math.ceil(totalPosts/limit);

        return {
            posts
        }
    }catch(err){
        console.error(err);
        return {error:err.message};

    }
}