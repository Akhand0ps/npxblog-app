
import { da } from "zod/v4/locales";
import BlacklistToken from "../models/BlacklistToken.js";
import User from "../models/UserModel.js"

import {signup,Userlogin,BioUpdate} from "../services/UserService.js";


export const register = async(req,res)=>{
    console.log("camer in resgister ")
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

        const {user:createdUser,token} = await signup({
            input
        })

        //ab cookie bana
    
        
        res.cookie("token",token,{
            httpOnly:true,
            secure:true,
            sameSite:"Strict",
            maxAge:1*24*60*60*1000 
        });

        console.log("token created");
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
        
        
        console.log("token hai ye: ",token);

        res.cookie("token",token,{

            httpOnly:true,
            secure:true,
            sameSite:"Strict",
            maxAge:1*24*60*60*1000
        })

        console.log("logged in")
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

        res.clearCookie("token",{
            httpOnly:true,
            secure:process.env.NODE_ENV ==="production",
            sameSite:"Strict"
        })

        return res.status(200).json({message:"Logged out successfully"});
    }catch(err){

        console.error(error);
        return res.status(500).json({message:"INTERNAL SERVER ERROR"});
    }

}


export const updateBio = async(req,res)=>{
    try{
        const {userId} = req.params;
        const {bio} = req.body;

        const updatedBio = await BioUpdate(userId,{bio});
        if(updateBio.error) return res.status(404).json({message:"User not found"});

        return res.status(200).json({message:"Bio updated successfully",user:updatedBio.user});
    }catch(err){
        console.error(err);
        return res.status(500).json({message:"Error occured in updating bio"});
    }
}



export const profile = async(req,res)=>{

    try{
        const userId = req.user.id;
        console.log("userid:",userId);

        const data = await User.findById(userId).select("name email bio")
    
        console.log("Data: ",data);
        return res.status(200).json({data});
    }catch(err){
        console.error(err);
        return res.status(500).json({message:"INTERNAL SERVER ERROR"});
    }
}