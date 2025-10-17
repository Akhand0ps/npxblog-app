
import jwt from "jsonwebtoken";
import BlacklistToken from "../models/BlacklistToken.js";
import User from "../models/UserModel.js"

import {signup,Userlogin,BioUpdate} from "../services/UserService.js";


export const register = async(req,res)=>{
    try{
        const {name,email,password,bio,avatar} = req.body;

        const check = await User.findOne({email});

        if(check){
            res.status(409).json({message:"User already exists"})
            return;
        }

        const input = {
            name,email,password,bio,avatar
        }

        const signupResult = await signup({ input });

        if (signupResult?.error) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: signupResult.errors || []
            });
        }

        const { user: createdUser, token } = signupResult;

        if (!createdUser || !token) {
            return res.status(500).json({ message: 'Failed to create user' });
        }

        //ab cookie bana
    
        
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 1 * 24 * 60 * 60 * 1000,
            path: "/",
        });

        res.status(201).json({
            message:"User registered successfully",
            userId:createdUser._id,
            token
        })


    }catch(err){

        console.error(err);
        res.status(500).json({message:"error happend in resgistration"})
    }

}



export const login = async(req,res)=>{

    try{
        const {email,password} = req.body;
        const input = {email,password}

        const token = await Userlogin({input});

        if(token.error) return res.status(401).json({message:token.error});
        
        

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 1 * 24 * 60 * 60 * 1000,
            path: "/",
        })
        res.status(200).json({
            token,
            // message:"Logged in successfully",
        })



    }catch(err){

        console.error(err);
        res.status(500).json({message:"err came in login"})
    }
}


export const logout = async(req,res)=>{
    try{     
        const token = req.cookies.token;
        if(!token){

            return res.status(400).json({message:"User not logged in"});
        }
        try{
            jwt.verify(token,process.env.JWT_SECRET);
        }catch(err){
            return res.status(400).json({message:"Invalid token"});
        }
        await BlacklistToken.create({token});
        //ab cookie clear krde

        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            path: "/",
        })

        return res.status(200).json({message:"Logged out successfully"});
    }catch(err){

        console.error(err);
        return res.status(500).json({message:"INTERNAL SERVER ERROR"});
    }

}


export const updateBio = async(req,res)=>{
    try{
        const {userId} = req.params;
        const {bio} = req.body;

        const updatedBio = await BioUpdate(userId,{bio});
        if(updatedBio.error) return res.status(404).json({message:"User not found"});

        return res.status(200).json({message:"Bio updated successfully",user:updatedBio});
    }catch(err){
        console.error(err);
        return res.status(500).json({message:"Error occured in updating bio"});
    }
}

export const updateAvatar = async(req,res)=>{
    try{
        const {userId} = req.params;
        const {avatar} = req.body;

        const user = await User.findByIdAndUpdate(
            userId,
            {avatar: avatar},
            {new: true}
        );

        if(!user) return res.status(404).json({message:"User not found"});

        return res.status(200).json({message:"Avatar updated successfully",user});
    }catch(err){
        console.error(err);
        return res.status(500).json({message:"Error occured in updating avatar"});
    }
}



export const profile = async(req,res)=>{

    try{
        const userId = req.user.id;

        const data = await User.findById(userId).select("name email bio avatar following followers likedPost")
    
        return res.status(200).json({data});
    }catch(err){
        console.error(err);
        return res.status(500).json({message:"INTERNAL SERVER ERROR"});
    }
}

// Public profile by user ID (no auth required)
export const publicProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId)
            .select("name bio avatar followers following createdAt updatedAt");

        if (!user) return res.status(404).json({ message: "User not found" });

        // Return as a plain object to avoid exposing Mongoose internals
        const data = {
            _id: user._id,
            name: user.name,
            bio: user.bio || "",
            avatar: user.avatar || "",
            followers: user.followers || [],
            following: user.following || [],
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };

        return res.status(200).json({ data });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "INTERNAL SERVER ERROR" });
    }
}