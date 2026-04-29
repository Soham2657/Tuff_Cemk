import express from "express";
import {
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement
} from "../controllers/adminController.js";

import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/roleMiddleware.js";

const router = express.Router();

// Admin creates announcement
router.post("/announcement", protect, adminOnly, createAnnouncement);

// Everyone can view announcements
router.get("/announcement", protect, getAnnouncements);

// Admin deletes announcement
router.delete("/announcement/:id", protect, adminOnly, deleteAnnouncement);

export default router;