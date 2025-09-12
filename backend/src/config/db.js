import mongoose from "mongoose";



const connectDB = async()=>{

    try{

        await mongoose.connect(process.env.MONGO_URL);
        console.log("MONGODB CONNECTED");
    }catch(err){

        console.error("Mongo failed:",err.message);
        // Do not exit process; allow app to continue running so hosting can detect open port
        throw err;
    }
}



export default connectDB;

