import mongoose from "mongoose";



const connectDB = async()=>{

    try{

        await mongoose.connect(process.env.MONGO_URL);
        console.log("MONGODB CONNECTED");
    }catch(err){

        console.error("Mongo failed:",err.message);
        process.exit(1);
    }
}



export default connectDB;


