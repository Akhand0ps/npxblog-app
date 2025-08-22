
import slugify from "slugify";
import Comment from "../models/Comment.js"
const DEFAULT_AVATAR = "https://example.com/default-avatar.png";


function stripHtml(html){

    return html.replace(/<[^>]*>?/gm,"");
}

export const generatePostMeta=(title,content)=>{
    const slug = slugify(title,{
        lower:true,
        strict:true
    });
    const plaintext = stripHtml(content);
    const description = plaintext.substring(0,150) +"...";
    return {slug,description};
}


export const populateComments = async(comments)=>{


    const populatedComments = await Promise.all(

            comments.map(async(comment)=>{

                const populated = await Comment.findById(comment._id)
                    .select("content createdAt replies author likes")
                    .populate("author","name avatar");

                if(!populated) return null;

                if(!populated.author){

                    populated.author={
                        name:"Deleted User",
                        avatar:DEFAULT_AVATAR
                    }
                }else if(!populated.author.avatar){
                    populated.author.avatar = DEFAULT_AVATAR;
                }
                
                if(populated.replies && populated.replies.length > 0){
                    populated.replies = await populateComments(populated.replies);
                }
                return populated;
            })
        )



    const validcomments = populatedComments.filter(comment =>comment !==null);
    
    validcomments.sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));

    return validcomments;

} 


export const allCommentsIds = async(commentIds)=>{

    let ids = [];

    const comments = Comment.find({_id:{$in:commentIds}}).select("replies");
    for(const comment of comments){

        ids.push(comment._id);

        if(comment.replies && comment.replies.length > 0){

            const childIds = await allCommentsIds(comment.replies);
            ids = ids.concat(childIds);
        }

    }



    return ids;
}

