

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { createUserSchema,updateBioSchema } from "../utils/ZodValidations.js";

import User from "../models/UserModel.js";

export const signup = async({input})=>{
    
    const normalized = {
        name: input?.name,
        email: input?.email,
        password: input?.password,
        bio: input?.bio ?? undefined,
        avatar: input?.avatar ? input.avatar : undefined,
    };

    // Validate incoming payload safely //hamesa yahi pe krle.
    const validatedata = createUserSchema.safeParse(normalized);

    if (!validatedata.success) {
        const issues = validatedata.error?.issues ?? [];
        return {
            error: 'VALIDATION_ERROR',
            errors: issues.map(err => ({
                field: Array.isArray(err.path) ? err.path.join('.') : String(err.path ?? ''),
                message: err.message
            }))
        };
    }

    const userCreate = validatedata.data;


    const hashedPassword = await bcrypt.hash(userCreate.password,11);

    const data = {
        name:userCreate.name,
        email:userCreate.email,
        password:hashedPassword,
        bio: userCreate.bio || "",
        avatar: userCreate.avatar || "",
        followers: [],
        following:[],
        likedPost:[]

    }
    const user = await User.create(data);

    const token = jwt.sign( {userId: user._id} , process.env.JWT_SECRET,{expiresIn:"1d"});
    return {user:user,token};
}



export const Userlogin = async({input})=>{

    const {email,password} = input;
    const user = await User.findOne({email})

    if(!user){
        return {error:"user does not exist"}
    }

    const isMatch = await bcrypt.compare(password,user.password);

    if(!isMatch)return {error:"Invalid credentials"};

    const token = jwt.sign({userId: user._id} , process.env.JWT_SECRET,{expiresIn:"1d"});
    console.log("login service:",token);
    return token;
}



export const BioUpdate = async(userId,{bio})=>{
    try{
        const validatied = updateBioSchema.safeParse({bio});
        if(!validatied.success) {
            return {error: validatied.error.message}
        }
        const updateUser  = await User.findByIdAndUpdate(
            userId,
            {bio: validatied.data.bio},
            {new: true}
        );
        if(!updateUser)return {error:"User not found"};
        return updateUser;
    }catch(err){
        console.error(err);
    }
}
