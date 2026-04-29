import express from "express";
import protect from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import {
  getMyProfile,
  upsertMyProfile,
  uploadMyProfilePicture,
} from "../controllers/profileController.js";

const router = express.Router();

// Log all requests to profile routes
router.use((req, res, next) => {
  console.log(`📧 Profile route request: ${req.method} ${req.path}`);
  next();
});

router.get("/me", protect, getMyProfile);
router.put("/me", protect, upsertMyProfile);
router.put("/me/picture", protect, upload.single("image"), uploadMyProfilePicture);

export default router;
