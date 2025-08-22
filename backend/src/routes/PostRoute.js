import express from "express";
import {auth} from "../middlewares/auth.js";
import { CreatePost, deletePost, getAllPosts,getOnePost,updatePost } from "../controllers/ContentController.js";
import { likeUnlikePost } from "../controllers/ActivityController.js";


const router = express.Router();


router.post("/create-post",auth,CreatePost);
router.get("/get-posts",auth,getAllPosts);
router.put("/:slug",auth,updatePost);
router.delete("/:slug",auth,deletePost);



router.get("/:slug",getOnePost); //public hai ye.


router.post("/like-unlike",auth,likeUnlikePost);





export default router;