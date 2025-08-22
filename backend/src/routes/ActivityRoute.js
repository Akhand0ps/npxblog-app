import express from "express";
import { followUser, unfollowUser } from "../controllers/ActivityController.js";
import {auth} from "../middlewares/auth.js"


const router = express.Router();


router.post("/follow",auth,followUser);
router.post("/unfollow",auth,unfollowUser);




export default router;