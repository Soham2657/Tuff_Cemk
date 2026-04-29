import connectDB from "./config/db.js";
import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import protect from "./middleware/authMiddleware.js";
import canteenRoutes from "./routes/canteenRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import clubRoutes from "./routes/clubRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
dotenv.config();

console.log('✓ profileRoutes imported successfully');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global request logger
app.use((req, res, next) => {
  console.log(`🔄 Incoming ${req.method} ${req.path}`);
  next();
});

app.use("/api/auth", authRoutes);
//test route
app.get("/", (req, res) => {
    res.send("API is running...");
});
app.get("/api/protected", protect, (req, res) => {
    res.json({ message: "This is a protected route", user: req.user });
});


app.use("/api/canteen", canteenRoutes);

//event routes

app.use("/api/events", eventRoutes);

//club routes

app.use("/api/clubs", clubRoutes);

//admin routes
app.use("/api/admin", adminRoutes);

//apply to club routes
app.use("/api/applications", applicationRoutes);
//notification routes
app.use("/api/notifications", notificationRoutes);
app.use("/api/ai", aiRoutes);
console.log('✓ About to mount profile routes...');
app.use("/api/profile", profileRoutes);
console.log('✓ Profile routes mounted at /api/profile');

//connect to database and start server
connectDB().then(() => {
    //port
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch((error) => {
    console.error("Failed to connect to database, server not started:", error.message);
    process.exit(1);
});