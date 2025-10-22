import dotenv from "dotenv"
dotenv.config();
import connectDB from "./src/config/db.js";
import app from "./app.js"


const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0"; // Ensure binding on all interfaces for Render


// Basic health and root endpoints for uptime checks
app.get("/", (req, res) => {
    res.send("OK");
});

app.get("/health", (req, res) => {
    res.status(200).json({ 
        status: "ok", 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        env: process.env.NODE_ENV || 'development'
    });
});

// Keep-alive endpoint to prevent cold starts
app.get("/api/v1/ping", (req, res) => {
    res.status(200).json({ 
        message: "pong", 
        timestamp: new Date().toISOString() 
    });
});

// Start server immediately so Render detects the open port
const server = app.listen(PORT, HOST, () => {
    console.log(`Server listening on http://${HOST}:${PORT}`);
});

// Connect to MongoDB asynchronously; do not block server start
connectDB()
    .then(() => {
        console.log("Database connected");
    })
    .catch((err) => {
        console.error("Database connection failed:", err?.message || err);
        // Intentionally not exiting so the port remains bound for platform health checks
});



