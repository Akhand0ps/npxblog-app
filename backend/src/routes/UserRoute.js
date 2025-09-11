import express from "express"
import { register,login, logout, updateBio, profile, updateAvatar, publicProfile } from "../controllers/UserController.js"
import {auth} from "../middlewares/auth.js"
const router = express.Router();


router.post("/register",register);
router.post("/login",login);
router.post("/logout",logout);

router.get("/profile",auth,profile)
router.get("/profile/:userId", publicProfile)

router.patch("/:userId/bio",auth,updateBio);
router.patch("/:userId/avatar",auth,updateAvatar);

export default router;