
import Post from "../models/PostModel.js";

export const SearchContent = async(req,res)=>{

    try{

        // const {q:query,type='all',page=1,limit=10,tags,author} = req.query;

        const query = req.query.q || "";
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10; 

        if(!query || query.trim().length < 2){
            return res.status(400).json({message:"Search uqery must be at least 2 chars long"})
        };

        const searchCriteria = {

            $or:[
                {title:{$regex:query,$options:'i'}},
                {content:{$regex:query,$options:'i'}},
                {description:{$regex:query,$options:'i'}},
                {tags:{$in:[new RegExp(query,'i')]}}
            ]
        };


        const results = await Post.find(searchCriteria)
            .limit(limit)
            .skip((page-1) * limit);
        
        res.status(200).json({
            results,
            total:results.length,
            page,
            limit
        })
    }catch(err){
        console.error(err);
        return res.status(500).json({message:"Search failed",error:err.message})
    }
}