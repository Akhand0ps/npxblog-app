import express from "express";
import {auth} from "../middlewares/auth.js";
import { CreatePost, deletePost, getAllPosts,getOnePost,updatePost, getPostsByUser } from "../controllers/ContentController.js";
import { likeUnlikePost } from "../controllers/ActivityController.js";


const router = express.Router();


router.post("/create-post",auth,CreatePost);
router.get("/get-posts",auth,getAllPosts);
router.put("/:slug",auth,updatePost);
router.delete("/:slug",auth,deletePost);

// public endpoints should be ordered before generic slug route
router.get("/by-user/:userId", getPostsByUser); // public
router.get("/:slug",getOnePost); // public: get one post by slug


router.post("/like-unlike",auth,likeUnlikePost);





export default router;