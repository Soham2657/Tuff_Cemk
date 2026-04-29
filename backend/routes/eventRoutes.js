import express from "express";
import {
  createEvent,
  getEvents,
  getEventById,
  registerEvent,
  deleteEvent,
  searchEvents,
  getMyEvents,
} from "../controllers/eventController.js";

import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/roleMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/", protect, adminOnly, upload.single("image"), createEvent);
router.get("/search/query", searchEvents);
router.get("/my", protect, getMyEvents);
router.get("/", getEvents);
router.get("/:id", getEventById);
router.post("/:id/register", protect, registerEvent);
router.delete("/:id", protect, adminOnly, deleteEvent);
export default router;