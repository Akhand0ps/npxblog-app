import dotenv from "dotenv"
dotenv.config();
import connectDB from "./src/config/db.js";
import app from "./app.js"


const PORT=process.env.PORT || 3001;


app.get("/",(req,res)=>{
    console.log("hi")
    n++;
    res.send(`hiii ${n}`)
})


connectDB().then(()=>{
    app.listen(PORT,()=>{
    console.log(`server running on ${PORT}`);
})
})



