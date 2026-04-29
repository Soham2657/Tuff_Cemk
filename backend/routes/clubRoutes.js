import express from "express";
import {
  createClub,
  getClubs,
  getClubById,
  leaveClub,
  deleteClub,
  searchClubs,
} from "../controllers/clubController.js";

import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/roleMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Create club (admin)
router.post("/", protect, adminOnly, upload.single("image"), createClub);

// Search clubs
router.get("/search/query", protect, searchClubs);

// Get all clubs
router.get("/", protect, getClubs);

// Get single club
router.get("/:id", protect, getClubById);

// Leave club
router.post("/:id/leave", protect, leaveClub);

// Delete club (admin)
router.delete("/:id", protect, adminOnly, deleteClub);

export default router;