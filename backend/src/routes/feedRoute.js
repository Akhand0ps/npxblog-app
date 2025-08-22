import express from "express"
import { getFeed } from "../controllers/ContentController.js";
import { auth } from "../middlewares/auth.js";
import { SearchContent } from "../controllers/SearchController.js";

const router = express.Router();





router.get("/feed",auth,getFeed);
router.get("/search",auth,SearchContent);

//apply get by tags 


export default router;