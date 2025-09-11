

import jwt, { decode } from "jsonwebtoken"



export const auth = (req,res,next)=>{

    console.log("came in auth");
     const token = req.cookies.token;
     console.log(token);
    if(!token)return res.status(401).json({message:"cookie not found"});


    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET);

        // Handle token format
        if (decoded.userId) {
            req.user = { id:decoded.userId};
        } else {
            return res.status(401).json({message:"Invalid token format"});
        }

        console.log("user id:", req.user.id);
        next();
    }catch(err){

        res.status(401).json({message:"Token is not valid"});
    }
}