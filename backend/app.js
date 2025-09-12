import express from "express"
import cors from "cors";
import UserR from "./src/routes/UserRoute.js";
import PostR from "./src/routes/PostRoute.js";
import CommentR from "./src/routes/CommentRoute.js";
import FollowR from "./src/routes/ActivityRoute.js";
import FeedR from "./src/routes/feedRoute.js";


import cookieParser from "cookie-parser";
const app = express();

// Trust proxy so secure cookies work correctly behind Render/other proxies
app.set('trust proxy', 1);

const corsOptions = {
  origin: ["http://localhost:5173", "https://npxbg.vercel.app"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  // Do not hardcode allowedHeaders/exposedHeaders so cors reflects request headers dynamically
};

app.use(cors(corsOptions));
// Explicitly handle preflight for all routes
app.options("*", cors(corsOptions));
app.use(express.json());
app.use(cookieParser());


app.use("/api/v1/user",UserR);
app.use("/api/v1/posts",PostR);
app.use("/api/v1/posts",CommentR);
app.use("/api/v1/user",FollowR);
app.use("/api/v1",FeedR);


export default app;
