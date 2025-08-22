

import express from "express";
import { createComment, deleteComment, getCommentsByPost } from "../controllers/CommentController.js";
import {auth} from "../middlewares/auth.js";
import { likeUnlikeComment } from "../controllers/ActivityController.js";


const router = express.Router();


router.post("/comments/like-unlike",auth,likeUnlikeComment);

//hamesa parameterized ko niche rko nhi conflict hoga
router.post("/comments/:slug",auth,createComment); // ye ek parameterized route hai
router.get("/comments/:slug",auth,getCommentsByPost); //ye bhi 
router.delete("/comments/:commentId",auth,deleteComment);




export default router;